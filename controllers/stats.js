/**
 * 此模块主要是处理统计相关的请求
 * @module controllers/stats
 */

const _ = require('lodash');
const stringify = require('simple-stringify');

/**
 * 用于处理前端ajax请求的相关统计，暂时只输入到日志中，可以考虑是否写入influxdb
 * @param {Method} POST
 * @param {Header} X-User-Token 用户登录之后返回的一个标识的token，如果未登录则是`unknown`
 * @param {Array} request.body 提交的统计信息，数据格式是：
 * [{method: String, url: String, use: Integer, processing: Integer,
 * network: Integer, status: Integer, hit: Integer}]
 * @prop {Route} /api/stats/ajax
 * @return {Object} 成功时返回null
 */
exports.ajax = (ctx) => {
  const token = ctx.get('X-User-Token');
  _.forEach(ctx.request.body, (item) => {
    console.info(`browser-ajax ${token} ${stringify.json(item)}`);
  });
  /* eslint no-param-reassign:0 */
  ctx.status = 201;
};

/**
 * 用于记录前端收集的出错日志
 * @param {Method} POST
 * @param {Header} X-User-Token 用户登录之后返回的一个标识的token，如果未登录则是`unknown`
 * @param {Array} request.body 提交的出错记录，数据格式为[{}]，出错记录格式没有严格要求
 * @prop {Route} /api/stats/exception
 * @return {Object} 成功时返回null
 */
exports.exception = (ctx) => {
  const token = ctx.get('X-User-Token');
  _.forEach(ctx.request.body, (item) => {
    console.error(`browser-exception ${token} ${stringify.json(item)}`);
  });
  /* eslint no-param-reassign:0 */
  ctx.status = 201;
};

/**
 * 用于记录前端收集的统计数据
 * @param {Method} POST
 * @param {Header} X-User-Token 用户登录之后返回的一个标识的token，如果未登录则是`unknown`
 * @param {Object} request.body.screen 前端获取的屏幕相关参数
 * @param {String} request.body.template 该页面对应的template
 * @param {Object} request.body.timing 前端记录的页面加载js,html等的时间
 * @param {Object} request.body.performance 前端获取到的`window.performance.timing`，不是所有的浏览器都支持
 * @param {Array} request.body.entries 前端获取到的`window.performance.getEntries()`，有该页面加载资源所用的时间
 * @prop {Route} /api/stats/exception
 * @return {Object} 成功时返回null
 */
exports.statistics = (ctx) => {
  const data = ctx.request.body;
  console.info(`browser-screen:${stringify.json(data.screen)}`);
  console.info(`browser-timing:${data.template} ${stringify.json(data.timing)}`);
  console.info(`browser-performance:${stringify.json(data.performance)}`);
  _.forEach(data.entries, entry => console.info(`browser-entry:${stringify.json(entry)}`));
  /* eslint no-param-reassign:0 */
  ctx.status = 201;
};
