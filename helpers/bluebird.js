/** @module helpers/bluebird */

global.Promise = require('bluebird');

/**
 * 使用`bluebird`替换全局的Promise，提升Promise的性能，引入该模块则自动替换
 * @example
 * require('./helpers/bluebird');
 * console.info(Promise === require('bluebird')); // true
 */
module.exports = global.Promise;
