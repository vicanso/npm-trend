/**
 * 用于跟踪用户行为的中间件，主要用于一些会修改数据的操作
 * @module middlewares/tracker
 */
const _ = require('lodash');
const stringify = require('simple-stringify');

const influx = localRequire('helpers/influx');

/**
 * 记录用户的行为日志到influxdb中
 * @param  {Object} data 用户行为日志数据
 */
function logUserTracker(data) {
  console.info(`user tracker ${stringify.json(data)}`);
  const tags = 'category result'.split(' ');
  influx.write('userTracker', _.omit(data, tags), _.pick(data, tags));
}

/**
 * 生成行为日志中间件，根据设置的参数列表获取用户提交的参数，
 * 以后最后的结果，记录到influxdb中
 * @param  {String} category 该用户行为分类，如：用户注册、用户收藏
 * @param  {Array} params   参数列表, 如：["name", "code"]，
 * 取参数的优先顺序是：ctx.request.body --> ctx.params --> ctx.query
 * @return {Function} 返回中间件处理函数
 */
module.exports = (category, params) => (ctx, next) => {
  const data = {
    category,
    token: ctx.get('X-User-Token'),
    ip: ctx.ip,
  };
  _.forEach(params, (param) => {
    _.forEach(['request.body', 'params', 'query'], (key) => {
      const v = _.get(ctx, `${key}.${param}`);
      if (_.isNil(data[param]) && !_.isNil(v)) {
        data[param] = v;
      }
    });
  });
  const start = Date.now();
  const delayLog = (use, result) => {
    data.result = result;
    data.use = use;
    logUserTracker(data);
  };
  return next().then(() => {
    setImmediate(delayLog, Date.now() - start, 'success');
  }, (err) => {
    setImmediate(delayLog, Date.now() - start, 'fail');
    throw err;
  });
};
