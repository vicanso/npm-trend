/**
 * 此模块提供一些公共常用的函数
 * @module helpers/utils
 */

const _ = require('lodash');

const globals = localRequire('helpers/globals');
const {
  client,
} = localRequire('helpers/influx');

// do something before exit
function beforeExit() {
  if (!client) {
    return Promise.resolve();
  }
  return client.syncWrite();
}

/**
 * 从参数列表中获取第一个符合条件的参数返回，如果都不符合，则使用默认值返回
 * @param  {Array} arr 参数列表
 * @param  {Function} validate 校验函数，如果符合则返回true
 * @param  {Any} defaultValue 默认值
 * @return {Any} 返回符合条件的值或者默认值
 * @example
 * const utils = require('./helpers/utils');
 * // max: 100
 * const max = utils.getParam(['name', true, 100], _.isInteger, 10);
 */
exports.getParam = (arr, validate, defaultValue) => {
  const v = _.find(arr, validate);
  if (!_.isUndefined(v)) {
    return v;
  }
  return defaultValue;
};

/**
 * 将系统status设置为pasue之后，检测当前系统正在连接的请求数，如果为0，则退出。
 * 如果在多次检测还不为0，则强制退出
 * @param  {Integer} times 检测次数
 * @param  {Integer} [checkInterval = 10000] 每次检测的间隔
 * @return {Timer} 返回setInterval的Timer对象
 * @example
 * const utils = require('./helpers/utils');
 * // 每隔2秒检测一次是否还有连接请求，如果无，则退出
 * utils.checkToExit(5, 2000);
 */
exports.checkToExit = (times, checkInterval = 10 * 1000) => {
  let count = times;
  globals.set('status', 'pause');
  const timer = setInterval(() => {
    /* istanbul ignore if */
    if (!count) {
      console.error(`exit while there are ${count} connections`);
      clearInterval(timer);
      beforeExit().then(() => {
        process.exit(1);
      }, () => {
        process.exit(1);
      });
      return;
    }
    /* istanbul ignore if */
    if (!globals.get('connectingTotal')) {
      console.info('exit without any connection');
      clearInterval(timer);
      beforeExit().then(() => {
        process.exit(0);
      }, () => {
        process.exit(0);
      });
    } else {
      count -= 1;
    }
  }, checkInterval).unref();
  return timer;
};

/**
 * 生成随机的字符串
 * @param  {Number} [length = 6] 字符串长度
 * @return {String} 返回随机生成的字符串
 * @example
 * const utils = require('./helpers/utils');
 * // 689PLFGZF0
 * const token = utils.randomToken(10);
 */
exports.randomToken = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
  const charsCount = chars.length;
  const arr = [];
  for (let i = 0; i < length; i += 1) {
    arr.push(chars[_.random(0, charsCount)]);
  }
  return arr.join('');
};
