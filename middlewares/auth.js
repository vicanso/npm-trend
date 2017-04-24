/** 认证相关的中间件（主要用于一些内部接口的认证）
 * @module middlewares/auth
 */

const crypto = require('crypto');

const errors = localRequire('helpers/errors');

/**
 * admin的校验中间件，从Header中获取`Auth-Token`，通过sha1生成字符串与`adminToken`对比，
 * 如果相等，则表示该认证通过
 * @param  {String} adminToken 将token通过sha1生成的字符串
 * @return {Function} 返回中间件处理函数
 */
exports.admin = adminToken => (ctx, next) => {
  const shasum = crypto.createHash('sha1');
  const token = ctx.get('Auth-Token');
  if (token && shasum.update(token).digest('hex') === adminToken) {
    return next();
  }
  throw errors.get(1);
};
