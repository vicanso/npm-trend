/**
 * 此模块做mongoose model的相关初始化操作
 * @module models
 */
const mongoose = require('mongoose');
const _ = require('lodash');
const requireTree = require('require-tree');

const config = localRequire('config');
const hooks = localRequire('helpers/hooks');
const Schema = mongoose.Schema;
mongoose.Promise = require('bluebird');

/**
 * 初始化models，根据配置的model path，读取所有配置的model，初始化。
 * 并增加公共的统计hook函数
 * @param  {MongooseClient} client   mongoose实例化的client
 * @param  {[type]} modelPath model定义文件目录
 */
const initModels = (client, modelPath) => {
  const models = requireTree(modelPath);
  _.forEach(models, (model, key) => {
    const name = model.name || (key.charAt(0).toUpperCase() + key.substring(1));
    const schema = new Schema(model.schema, model.options);
    if (model.indexes) {
      _.forEach(model.indexes, fields => schema.index(fields));
    }
    _.forEach(model.static, (fn, k) => schema.static(k, fn));
    _.forEach(['pre', 'post'], (type) => {
      _.forEach(model[type], (fns, k) => {
        _.forEach(fns, fn => schema[type](k, fn));
      });
    });

    // add static hook functions
    const statisticsHooks = hooks.getStatisticsHooks(name);
    _.forEach(statisticsHooks, (hooksInfos, hookName) => {
      const {
        pre,
        post,
      } = hooksInfos;
      if (_.isFunction(pre)) {
        // pre hook
        schema.pre(hookName, pre);
      }
      if (_.isFunction(post)) {
        // post hook
        schema.post(hookName, post);
      }
    });

    client.model(name, schema);
  });
};

/**
 * 根据mongodb连接串初始化Mongoose Connection
 * @param  {String} uri     mongodb连接串：mongodb://user:pass@localhost:port/database
 * @param  {Object} options mongoose中createConnection的options
 * @return {Connection}  Mongoose Connection
 */
const initClient = (uri, options) => {
  /* istanbul ignore if */
  if (!uri) {
    return null;
  }
  const opts = _.extend({
    db: {
      native_parser: true,
    },
    server: {
      poolSize: 5,
    },
  }, options);
  const client = mongoose.createConnection(uri, opts);
  const maskUri = uri.replace(/\/\/\S+:\S+@/, '//***:***@');
  client.on('connected', () => {
    console.info(`${maskUri} connected`);
  });
  client.on('disconnected', () => {
    /* istanbul ignore next */
    console.error(`${maskUri} disconnected`);
  });
  client.on('reconnected', _.debounce(() => {
    /* istanbul ignore next */
    console.error(`${maskUri} reconnected`);
  }, 3000));
  client.on('connecting', () => {
    /* istanbul ignore next */
    console.error(`${maskUri} connecting`);
  });
  client.on('error', err => console.error(`${maskUri} error, %s`, err));
  initModels(client, __dirname);
  return client;
};

const client = initClient(config.mongoUri);

/**
 * 获取mongodb model
 * @param  {String} name collection的名称
 * @return {Model} mongoose model
 */
exports.get = (name) => {
  /* istanbul ignore if */
  if (!client) {
    throw new Error('the db is not init!');
  }
  return client.model(name);
};
