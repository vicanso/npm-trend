/**
 * 此模块主要处理template相关操作
 * @module middlewares/template
 */

const path = require('path');
const _ = require('lodash');
const pug = require('pug');

const config = localRequire('config');

/**
 * 模板render
 * @param  {String} filename 模板文件名
 * @param  {Object} data     生成模板所用的数据
 * @param  {Object} options  options，具体查看`pug`的options
 * @return {String} 编译生成的HTML
 */
function render(filename, data, options) {
  let file = path.join(config.viewPath, filename);
  const extname = path.extname(file);
  if (!extname) {
    file += '.pug';
  }
  const isDevlopment = config.env === 'development';
  return pug.renderFile(file, _.extend({
    compileDebug: isDevlopment,
    cache: !isDevlopment,
  }, options, data));
}

/**
 * 根据文件生成相应的render中间件
 * @param  {String} file 模板路径
 * @return {Function} 返回中间件处理函数
 */
function parse(file) {
  return (ctx, next) => next().then(() => {
    const {
      importer,
      timing,
    } = ctx.state;
    const end = timing.start('template');
    /* eslint no-param-reassign:0 */
    ctx.state.TEMPLATE = file;
    let html = render(file, ctx.state);
    if (importer) {
      // 替换css,js文件列表
      html = html.replace('<!--CSS_FILES_CONTAINER-->', importer.exportCss());
      html = html.replace('<!--JS_FILES_CONTAINER-->', importer.exportJs());
    }
    end();
    /* eslint no-param-reassign:0 */
    ctx.body = html;
  });
}

exports.parse = parse;
exports.render = render;
