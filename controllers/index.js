/**
 * 此模块用于对定义的路由处理，主要做参数校验，以后调用相应的service，在处理完成后，
 * 把响应数据返回
 * @module controllers
 */

const requireTree = require('require-tree');

module.exports = requireTree('.');
