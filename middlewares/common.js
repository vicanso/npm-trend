/**
 * 一些公共的与业务无关的中间件
 * @module middlewares/common
 */
const _ = require('lodash');
const url = require('url');
const checker = require('koa-query-checker');

const errors = localRequire('helpers/errors');
const influx = localRequire('helpers/influx');
const noCacheQuery = checker('cache-control=no-cache');

/**
 * 对于url中的querystring检验，如果有querystring则校验不通过，返回出错。
 * 主要是一些接口是不需要querystring的，如果增加了，对接口处理没影响，
 * 但是会导致varnish缓存的增多，特别有可能前端调用接口时把时间戳加上，完全利用不到`varnish`
 * @return {Function} 返回中间件处理函数
 */
exports.noQuery = () => (ctx, next) => {
  if (_.isEmpty(ctx.query)) {
    return next();
  }
  throw errors.get(2);
};

/**
 * 用于生成deprecate的提示信息，会在响应的Header中添加`Warning`头，
 * 前端在请求这类url中，根据返回的Header，在开发环境中，增加提示。
 * 每次该请求被调用到，都会写一条warn日志，并且记录到influxdb中
 * @param {Strimg} hint 提示文案
 * @return {Function} 返回中间件处理函数
 */
exports.deprecate = hint => (ctx, next) => {
  ctx.set('Warning', hint);
  console.warn(`deprecate - ${ctx.url} is still used.`);
  const urlInfo = url.parse(ctx.url);
  influx.write('deprecate', {
    path: urlInfo.pathname,
  });
  return next();
};

/**
 * 用于校验请求是否设置了no-cache的相关属性，主要为了便于在varnish中更高效的判断该请求是不可缓存的
 * 如果非GET或HEAD请求，不做任何校验，默认符合。
 * 否则判断Header中的`Cache-Control`是否设置为`no-cache`或者querystring中是否有设置`cache-control=no-cache`。
 * 注：如果使用Header的配置方式，会导致请求头中`if-none-match`等缓存相关的字段缺失，尽量使用querystring的方式
 * @return {Function} 返回中间件处理函数
 * @see {@link https://github.com/vicanso/articles/blob/master/varnish-suggestion.md|GitHub}
 */
exports.noCache = () => (ctx, next) => {
  const method = ctx.method.toUpperCase();
  if ((method !== 'GET' && method !== 'HEAD')
    || ctx.get('Cache-Control') === 'no-cache'
    || ctx.query['cache-control'] === 'no-cache') {
    ctx.set('Cache-Control', 'no-cache, max-age=0');
    return next();
  }
  return noCacheQuery(ctx, next);
};

/**
 * 用于校验请求版本号是否符合配置定义，依赖于koa-rest-version来生成版本与数据类型
 * @param  {Array|Integer} v 版本号，支持单个和多个版本号的定义。
 * 如果是多个版本号同时并存，使用[v1, v2]，如果只是单一版本，则直接v1
 * @param  {Array|String} [t = "json"]响应数据支持类型，支持单一与多种类型配置，
 * 如: 'json' 或者 ['json', 'xml']
 * @return {Function} 返回中间件处理函数
 * @see {@link https://github.com/vicanso/koa-rest-version|GitHub}
 */
exports.version = (v, t) => {
  const versions = _.isArray(v) ? v : [v];
  const tp = t || 'json';
  const typeList = _.isArray(tp) ? tp : [tp];
  return (ctx, next) => {
    const version = _.get(ctx, 'versionConfig.version', 1);
    if (_.indexOf(versions, version) === -1) {
      const err = errors.get(5);
      err.message = err.message
        .replace('#{version}', versions.join(','));
      throw err;
    }
    const type = _.get(ctx, 'versionConfig.type', 'json');
    if (_.indexOf(typeList, type) === -1) {
      const err = errors.get(6);
      err.message = err.message
        .replace('#{type}', typeList.join(','));
      throw err;
    }
    return next();
  };
};

/**
 * 根据请求的Header，判断是否数据未变化，是则以304返回，该函数直接修改自koa-fresh
 * @return {Function} 返回中间件处理函数
 * @see {@link https://github.com/koajs/koa-fresh|GitHub}
 */
exports.fresh = () => (ctx, next) => next().then(() => {
  const {
    status,
    body,
    method,
  } = ctx;
  if (!body || status === 304) {
    return;
  }
  let cache = method === 'GET' || method === 'HEAD';
  if (cache) {
    cache = status >= 200 && status < 300;
  }
  if (cache && ctx.fresh) {
    /* eslint no-param-reassign:0 */
    ctx.status = 304;
    ctx.remove('Content-Type');
    ctx.remove('Content-Length');
  }
});

/**
 * 路径的相关统计，用于全局增加到路径的处理函数中，记录`method`, `paht`, `spdy` 与 `use`。
 * spdy字段根据use的时间来生成所处时间段，方便对路由处理性能分组展示
 * @return {Function} 返回中间件处理函数
 */
exports.routeStats = () => (ctx, next) => {
  const start = Date.now();
  const end = ctx.state.timing.start('route');
  const delayLog = (use) => {
    const method = ctx.method.toUpperCase();
    const layer = _.find(ctx.matched, tmp => _.indexOf(tmp.methods, method) !== -1);
    /* istanbul ignore if */
    if (!layer) {
      return;
    }
    influx.write('httpRoute', {
      use,
    }, {
      method: method.toLowerCase(),
      path: layer.path,
      spdy: _.sortedIndex([30, 100, 300, 1000, 3000], use),
    });
  };
  return next().then(() => {
    end();
    setImmediate(delayLog, Date.now() - start);
  });
};
