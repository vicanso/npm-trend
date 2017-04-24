/**
 * 此模块主要实现timeout功能，用于全局设置请求的超时间隔，
 * 此功能在timeout之后，只是响应出错，但无法中止当前已进行的操作，
 * 因此如果对于会修改数据等操作，前端不能直接重发请求（或者后端做好重发的处理，使用一次性token等）
 */

const _ = require('lodash');

/**
 * timeout中间件，可以配置超时时间与pass函数
 * @param  {Object} [options={}] options.timeout：超时间隔，单位ms；
 * options.pass：判断该请求是否需要跳过timeout，返回true则跳过
 * @return {Function} 返回中间件处理函数
 */
module.exports = (options = {}) => (ctx, next) => {
  const pass = options.pass || _.noop;
  const timeout = options.timeout || 5000;
  if (pass(ctx)) {
    return next();
  }
  let timer;
  return Promise.race([
    new Promise((resolve, reject) => {
      timer = setTimeout(() => {
        // 此异常设置为非主动抛出异常，方便定时排查超时接口
        const err = new Error('Request Timeout');
        err.status = 408;
        reject(err);
      }, timeout);
    }),
    new Promise((resolve, reject) => next().then(() => {
      clearTimeout(timer);
      resolve();
    }, (err) => {
      clearTimeout(timer);
      reject(err);
    })),
  ]);
};
