/**
 * 此模块用于debug的处理，设置当前请求为debug模式，直接指定当前请求的响应数据或者响应码
 * @module middlewares/debug
 */

const Joi = require('joi');
const _ = require('lodash');

/**
 * 从querystring中取`_debug`, `_mock`, `_status`生成debug params。
 * `_mock` mock当前接口的返回值，如果设置了该参数，接口不做任何处理，以mock配置的值返回
 * @param {Boolean} request.query._debug 设置当前请求是否debug模式，如果设置了，设置`DEBUG`字段为true，后续怎么使用需要各接口支持
 * @param {Object} request.query._mock 当前接口的返回值，如果设置了该参数，接口不做任何处理，以mock配置的值返回
 * @param {Integer} request.query._status 如果设置了`_mock`，并且设置了此参数，则设置该响应的HTTP Status为此参数的值
 * @return {Function} 返回中间件处理函数
 */
module.exports = () => {
  const renameList = {
    DEBUG: '_debug',
    MOCK: '_mock',
    STATUS: '_status',
  };
  let schema = Joi.object().keys({
    DEBUG: Joi.boolean(),
    MOCK: Joi.object(),
    STATUS: Joi.number().integer(),
  });

  _.forEach(renameList, (v, k) => {
    schema = schema.rename(v, k);
  });

  return (ctx, next) => {
    const query = ctx.query;
    const result = Joi.validateThrow(query, schema, {
      stripUnknown: true,
    });
    if (result.MOCK) {
      if (result.STATUS) {
        ctx.status = result.STATUS;
      }
      ctx.body = result.MOCK;
      return null;
    }
    if (!_.isEmpty(result)) {
      _.forEach(result, (v, k) => {
        delete query[renameList[k]];
      });
      /* eslint no-param-reassign:0 */
      ctx.state.debugParams = result;
      /* eslint no-param-reassign:0 */
      ctx.query = query;
    }
    return next();
  };
};
