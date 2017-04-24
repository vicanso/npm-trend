/**
 * 此模块主要用于mongoose的hook，有统计性能、更新操作等
 * @module helpers/hooks
 */

const ulid = require('ulid');
const _ = require('lodash');

const influx = localRequire('helpers/influx');

function writeStats(f, t) {
  const fields = f;
  const tags = t;
  const spdy = _.sortedIndex([30, 100, 300, 600, 1000], fields.use);
  tags.spdy = `${spdy}`;
  influx.write('mongoose', fields, tags);
}

/**
 * 创建mongoose的save操作的统计hook函数，生成pre与post的hook函数，将统计数据写入到influxdb中，
 * fields:{use: 耗时(ms) , id: ObjectID}，tags:{collection, op: 'save'}
 * @param  {String} collection 在数据库中collection的名称
 * @return {Object} 返回 {pre: function, post: function}
 * @example
 * const hooks = createSaveStats('user');
 * cosnt schema = xxx; // mongoose schema;
 * schema.pre('save', hooks.pre);
 * schema.post('save', hooks.post);
 */
function createSaveStats(collection) {
  return {
    pre: function preSave(next) {
      if (!this.startedAt) {
        this.startedAt = Date.now();
      }
      next();
    },
    post: function postSave() {
      /* eslint no-underscore-dangle:0 */
      const id = this._id.toString();
      const use = Date.now() - this.startedAt;
      const tags = {
        collection,
        op: 'save',
      };
      const fields = {
        use,
        id,
      };
      writeStats(fields, tags);
    },
  };
}

/**
 * 创建mongoose普通操作(findOne, findOneAndUpdate等等)的统计hook函数，生成pre与post的hook函数，将统计数据写入到influxdb中，
 * fields: {use: 耗时(ms)} tags:{collection, op: '操作名称，如findOne,fineOneAndUpdate等'}
 * @param  {String} collection 在数据库中collection的名称
 * @return {Object} 返回 {pre: function, post: function}
 * @example
 * const hooks = createNormalStats('user');
 * cosnt schema = xxx; // mongoose schema;
 * schema.pre('find', hooks.pre);
 * schema.post('find', hooks.post);
 */
function createNormalStats(collection) {
  return {
    pre: function pre(next) {
      if (!this.startedAt) {
        this.startedAt = Date.now();
      }
      next();
    },
    post: function post() {
      const use = Date.now() - this.startedAt;
      const tags = {
        collection,
        op: this.op,
      };
      const fields = {
        use,
      };
      writeStats(fields, tags);
    },
  };
}

/**
 * 自动填充数据，用于update或者validate(save)的中填充数据
 * @param  {Object} opts 填充配置, {name: type}，name表示要填充的字段，type表示要填充的类型
 * type暂只支持'date'与'ulid'两种类型，date为ISOString
 * @param  {Object} data 要填充的数据，会修改该数据相应的字段
 * @return {Object} 返回填充好的数据（和data是同一个对象）
 * @example
 * const opts = {
 *   createdAt: 'date',
 *   token: 'ulid',
 * };
 * const data = {
 *   name: 'tree.xie',
 * };
 * fillData(opts, data);
 * // {name: "tree.xie", createdAt: "2017-03-14T12:59:56.417Z", token: "01ARZ3NDEKTSV4RRFFQ69G5FAV"}
 * console.info(data);
 */
function fillData(opts, data) {
  const result = data;
  _.forEach(opts, (type, key) => {
    if (data[key]) {
      return;
    }
    if (type === 'date') {
      result[key] = new Date().toISOString();
    } else if (type === 'ulid') {
      result[key] = ulid();
    }
  });
  return result;
}

/**
 * 生成mongoose中update操作的hook，主要是配置填充相应字段（调用fillData），并__v字段做 +1 操作
 * @param  {Object} opts 数据填充配置
 * @return {Function} 返回hook函数
 * @example
 * const hooks = require('./helpers/hooks');
 * const updateHook = hooks.createUpdateHook({
 *   updatedAt: 'date',
 * });
 * cosnt schema = xxx; // mongoose schema;
 * schema.pre('findOneAndUpdate', updateHook);
 */
exports.createUpdateHook = opts => function createUpdateHook(next) {
  /* eslint no-underscore-dangle:0 */
  const data = this._update;
  fillData(opts, data);
  if (data.$inc) {
    data.$inc.__v = 1;
  } else {
    data.$inc = {
      __v: 1,
    };
  }
  next();
};

/**
 * 生成mongoose中validate操作的hook，主要是配置填充相应字段（调用fillData）
 * @param  {Object} opts 数据填充配置
 * @return {Function} 返回hook函数
 * @example
 * const hooks = require('./helpers/hooks');
 * const validateHook = hooks.createValidateHook({
 *   createdAt: 'date',
 *   updatedAt: 'date',
 * });
 * cosnt schema = xxx; // mongoose schema;
 * schema.pre('validate', validateHook);
 */
exports.createValidateHook = opts => function createValidateHook(next) {
  fillData(opts, this);
  next();
};

/**
 * 生成mongoose的统计函数hooks，包括：save, findOne, findOneAndUpdate, findOneAndRemove, count, find，
 * 在初始化model时，添加hooks，便于监控mongodb的各类操作性能
 * @param  {String} collection 数据库中collection的名称
 * @return {Object} 返回包括各个函数的hook，{save: function, findOne: function, ...}
 * @example
 * cosnt schema = xxx; // mongoose schema;
 * const hooks = require('./helpers/hooks');
 * const statisticsHooks = hooks.getStatisticsHooks('user');
 * _.forEach(statisticsHooks, (hooksInfos, hookName) => {
 *   const {
 *     pre,
 *     post,
 *   } = hooksInfos;
 *   if (_.isFunction(pre)) {
 *     // pre hook
 *     schema.pre(hookName, pre);
 *   }
 *   if (_.isFunction(post)) {
 *     // post hook
 *     schema.post(hookName, post);
 *   }
 * });
 */
exports.getStatisticsHooks = (collection) => {
  const saveHoook = createSaveStats(collection);
  const normalHook = createNormalStats(collection);
  return {
    save: saveHoook,
    findOne: normalHook,
    findOneAndUpdate: normalHook,
    findOneAndRemove: normalHook,
    count: normalHook,
    find: normalHook,
  };
};

