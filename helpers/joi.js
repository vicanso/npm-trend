/**
 * 此模块扩展了Joi的校验方法，引入该模块之后则增加validateThrow方法，该方法如果校验失败时抛出自定义的异常信息
 * @module helpers/joi
 */

const Joi = require('joi');

const errors = localRequire('helpers/errors');

/**
 * 增加校验数据出错抛出异常的处理，参数参考Joi.validate，如果校验出错，使用errors生成自定义出错，code为99999。
 * @param  {Object} value 要做校验的数据
 * @param  {Object} schema 数据的schema定义
 * @param  {Object} [options = null] 校验的配置信息
 * @return {Object} 经过Joi.validate之后的数据（根据options，有可能做了类型转换）
 * @example
 * require('./helpers/joi');
 * const Joi = require('joi');
 * // it will throw an error
 * const data = Joi.validateThrow({
 *   key: 'boks',
 * }, {
 *   key: Joi.string().valid('tree.xie'),
 * });
 */
function validateThrow(...args) {
  const result = Joi.validate(...args);
  const err = result.error;
  if (err) {
    err.status = 400;
    throw errors.get(err, {
      code: 99999,
    });
  }
  return result.value;
}

Joi.validateThrow = validateThrow;

module.exports = Joi;
