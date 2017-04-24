/**
 * 此模块生成HTTP处理的各类统计指标
 * @module middlewares/http-stats
 */

const _ = require('lodash');
const httpStats = require('koa-http-stats');

const globals = localRequire('helpers/globals');
const influx = localRequire('helpers/influx');

/**
 * 对HTTP的响应时间、状态码等生成统计指标，返回的统计指标如下：
 * {
 *   connecting: Integer, // 正在处理请求数
 *   total: Integer,  // 总处理的请求数
 *   use: Integer, // 处理时间ms
 *   bytes: Integer, // 响应数据字节
 *   code: Integer, // 响应状态码
 *   status: Integer, // 按状态码区分， 1xx -> 1, 2xx -> 2 ...
 *   spdy: Integer, // 响应速度区间，按options中配置的time
 *   size: Integer, // 响应数据大小区间
 *   busy: Integer, // 系统繁忙级别，根据connecting的数量来判断所处区间
 *   request: Integer, // 根据请求头的X-Requested-At获取请求所用时间（只是一个估计算）
 *   method: String, // 请求类型
 *   ip: String, // 用户IP
 * }
 * 并将数据记录到influxdb中
 * @param  {Object} options 各统计指标的分段配置，包括处理时间，字节，状态码等
 * @return {Function} 返回中间件处理函数
 * @see {@link https://github.com/vicanso/koa-http-stats|GitHub}
 */
module.exports = options => httpStats(options, (p, statsData, ctx) => {
  const tagKeys = 'status spdy size busy'.split(' ');
  const performance = p;
  if (!performance.createdAt) {
    performance.createdAt = (new Date()).toISOString();
  }
  globals.set('performance.http', performance);
  const fields = _.omit(statsData, tagKeys);
  fields.ip = ctx.ip;
  fields.url = ctx.url;
  const requestedAt = parseInt(ctx.get('X-Requested-At') || 0, 10);
  if (requestedAt) {
    fields.request = Date.now() - requestedAt - statsData.use;
  }
  const tags = _.pick(statsData, tagKeys);
  tags.method = ctx.method;
  influx.write('http', fields, tags);
});
