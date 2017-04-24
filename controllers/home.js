/**
 * @module controllers/home
 */

/**
 * 根据template，生成html，主要是网页是单页应用但是需要刷新时能加载到html
 * @param {Method} GET
 * @prop {Route} /
 * @prop {Route} /login
 * @prop {Route} /register
 * @prop {Template} home
 * @return {String} 返回render的html
 * @example
 * curl 'http://host/login'
 */
module.exports = ctx => ctx.setCache(600);
