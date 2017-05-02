/** @module helpers/errors */

const createError = require('http-errors');
const _ = require('lodash');

const errors = localRequire('errors');

function getErrorByCode(code, lang = 'en') {
  const item = errors[code] || {
    code: `${code}`,
  };
  const err = new Error(item[lang] || 'Unknown error');
  return createError(item.status || 500, err, {
    code: `${code}`,
    expected: true,
  });
}

/**
 * 生成自定义的Error对象，扩展了Error，增加 {expected: true, code: 错误码, status: HTTP状态码} 属性，
 * expected表示是主动抛出的异常（用于区分代码出错导致的异常），code为自定义的错误编码
 * @param  {Number} code 错误码，在`errors`中定义
 * @param  {String} [lang = 'en'] 出错信息语言
 * @return {Error} 返回自定义的错误对象
 * @example
 * const errors = require('./helpers/errors');
 * const err = errors.get(1);
 */
exports.get = function get(...args) {
  const arg = args[0];
  if (_.isNumber(arg)) {
    return getErrorByCode(...args);
  }
  const err = createError(...args);
  // 主动抛出的error设置expected，可以通过判断expected是否为true来识别是否为未知error
  err.expected = true;
  return err;
};
