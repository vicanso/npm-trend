/**
 * 此模块增加localRequire函数，用于引入项目中的模块，在引入此模块之后，就可全局使用localRequire
 * @module helpers/local-require
 */

const path = require('path');

/**
 * 用于引入项目中的模块，使用相对于项目根目录的相对路径
 * @example
 * require('./helpers/local-require');
 * const influx = localRequire('helpers/influx');
 * @param  {String} name 该模块在项目中的相对路径
 * @return {Object} 返回该模块的引用
 */
function localRequire(name) {
  const file = path.join(__dirname, '..', name);
  /* eslint import/no-dynamic-require:0 global-require:0 */
  return require(file);
}

/**
 * 基于项目的相对路径引入模块
 * @example
 * const influx = localRequire('helpers/influx');
 * @global
 */
global.localRequire = localRequire;
