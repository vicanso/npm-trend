/** @module helpers/globals */

const _ = require('lodash');

/**
 * @constant
 * 用于应用经别记录一些数据、状态使用
 * @type {Object}
 * @prop {Integer} globals.level 应用当前所处的系统级别，某些非重要路由可以使用`level`中间件来限定当系统`level`低于某个值则返回出错
 * @prop {String} globals.status 应用状态，分别为`running`与`pause`，在`/ping`的处理中，
 * 如果系统状态非`running`状态时，则返回出错，前置的反向代理则认为应用不可用，不将请求转发过来，
 * 可在处理处理请求不过来的时候，直接将状态切换至`pause`，等不忙的时候，重新切换状态至`running`（也可用于graceful reload）
 * @prop {Integer} globals.connectingTotal 应用当前正在处理请求数，当接收到HTTP请求的时候 +1，当处理完成时 -1
 * @prop {String} globals.concurrency 应用并发状态，分别为`low` `mid` 与 `high`，
 * 在`limit`中间件中，如果达到`high`时，会设置`status`为`pause`，让反向代理认为应用不可用，不再转发新的请求（旧的请求还是正常处理），避免雪崩效应
 * @prop {Object} globals.performance.http 记录中间件`koa-http-stats`返回的http performance
 */
const globals = {
  level: 100,
  // running, pause
  status: 'running',
  // handling request count
  connectingTotal: 0,
  concurrency: 'low',
  performance: {
    // 参考middlewares/http-stats
    http: null,
  },
};

/**
 * 获取globals中的值
 * @param  {String} key 字段名
 * @return {Any} 返回对应的值
 * @example
 * const globals = require('./helpers/globals');
 * const level = globals.get('level');
 */
exports.get = key => _.get(globals, key);

/**
 * 设置globals的值
 * @param  {String} key 字段段
 * @param  {Any} value 要设置的值
 * @return {Object} globals 返回globals对象
 * @example
 * const globals = require('./helpers/globals');
 * globals.set('level', 1);
 */
exports.set = (key, value) => _.set(globals, key, value);
