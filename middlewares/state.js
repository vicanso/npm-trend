/**
 * 此模块添加各类公共函数到`ctx.state`中，主要用于模板渲染之类
 * @module middlewares/state
 */
const urlJoin = require('url-join');
const Importer = require('jtfileimporter');
const _ = require('lodash');
const moment = require('moment');
const path = require('path');

const config = localRequire('config');

/**
 * 生成图片地址
 * @param  {String} staticUrlPrefix 静态文件引用前缀
 * @param  {Object} versions        引入路径与版本号的对照 {"/xx/xx.jpg": 124131}
 * @return {Function}               地址转换函数
 */
function getImgUrl(staticUrlPrefix, versions) {
  return function joinUrlPath(f) {
    let file = f;
    if (file.charAt(0) !== '/') {
      file = `/${file}`;
    }
    /* istanbul ignore if */
    if (config.env === 'development') {
      return urlJoin(staticUrlPrefix, file, `?v=${Date.now()}`);
    }
    const version = versions[file];
    if (version) {
      const ext = path.extname(file);
      file = file.replace(ext, `.${version}${ext}`);
    }
    return urlJoin(staticUrlPrefix, file);
  };
}

/**
 * 对state生成各类增添属性的中间件
 * @param  {Object} versions 静态文件版本号
 * @return {Function} 返回中间件处理函数
 */
module.exports = (versions) => {
  const appUrlPrefix = config.appUrlPrefix;
  const staticOptions = config.staticOptions;
  /* eslint max-len:0 */
  const staticUrlPrefix = appUrlPrefix ? urlJoin(appUrlPrefix, staticOptions.urlPrefix) : staticOptions.urlPrefix;
  const imgUrlFn = getImgUrl(staticUrlPrefix, versions);
  const anchorUrlFn = url => (appUrlPrefix ? urlJoin(appUrlPrefix, url) : url);
  return (ctx, next) => {
    const state = ctx.state;
    const importer = new Importer();
    importer.prefix = staticUrlPrefix;
    if (config.env !== 'development') {
      importer.version = versions;
      importer.versionMode = 1;
      if (staticOptions.host) {
        importer.hosts = [staticOptions.host];
      }
    }

    state.STATIC_URL_PREFIX = staticUrlPrefix;
    state.APP_URL_PREFIX = appUrlPrefix;
    state.APP_VERSION = config.version;
    state.APP = config.app;
    state.ENV = config.env;
    state._ = _;
    state.moment = moment;
    state.IMG_URL = imgUrlFn;
    state.URL = anchorUrlFn;
    state.importer = importer;
    state.DEBUG = _.get(ctx, 'state.debugParams.DEBUG', false);
    return next();
  };
};
