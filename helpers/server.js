const Koa = require('koa');
const koaLog = require('koa-log');
const _ = require('lodash');
const mount = require('koa-mounting');
const staticServe = require('koa-static-serve');

const config = localRequire('config');

module.exports = (port) => {
  const app = new Koa();
  // trust proxy
  app.proxy = true;
  app.keys = ['cuttle-fish', 'tree.xie'];
  localRequire('middlewares/session').init(app);
  // error handler
  app.use(localRequire('middlewares/error')());
  app.use(localRequire('middlewares/entry')(config.app, config.appUrlPrefix));
  // timeout
  app.use(localRequire('middlewares/timeout')({
    timeout: 3000,
    // 如果query中设置了disableTimeout，则跳过timeout处理
    pass: ctx => _.has(ctx.query, 'disableTimeout'),
  }));
  // health check
  app.use(localRequire('middlewares/ping')('/ping'));

  // http log
  /* istanbul ignore if */
  if (config.env === 'development') {
    app.use(koaLog('dev'));
  } else {
    /* istanbul ignore next */
    koaLog.morgan.token('server', () => config.name);
    koaLog.morgan.token('request-id', ctx => ctx.get('X-Request-Id') || 'unknown');
    koaLog.morgan.token('user', ctx => ctx.get('X-User-Token'));
    app.use(koaLog(config.httpLogFormat));
  }
  // http stats
  app.use(localRequire('middlewares/http-stats')());
  // htt connection limit
  const limitOptions = config.connectLimitOptions;
  app.use(localRequire('middlewares/limit')(_.omit(limitOptions, 'interval'),
    limitOptions.interval));
  const staticOptions = config.staticOptions;
  // 开发环境中，实时编译stylus
  /* istanbul ignore if */
  if (config.env === 'development') {
    app.use(mount(
      staticOptions.urlPrefix,
      /* eslint global-require:0 */
      require('koa-stylus-parser')(staticOptions.path)));
  }
  const denyQuerystring = config.env !== 'development';
  // static file
  app.use(mount(
    staticOptions.urlPrefix,
    staticServe(staticOptions.path, {
      denyQuerystring,
      maxAge: staticOptions.maxAge,
      headers: staticOptions.headers,
    })));

  app.use(require('koa-methodoverride')());
  app.use(require('koa-bodyparser')());
  // debug middleware
  app.use(localRequire('middlewares/debug')());

  app.use(require('koa-rest-version')());

  app.use(localRequire('middlewares/common').fresh());

  app.use(require('koa-etag')());

  app.use(localRequire('middlewares/state')(localRequire('versions')));

  app.use(localRequire('middlewares/picker')('_fields'));

  app.use(localRequire('router').routes());

  app.on('error', _.noop);

  /* istanbul ignore if */
  if (!port) {
    return app.listen();
  }

  const server = app.listen(port, (err) => {
    /* istanbul ignore if */
    if (err) {
      console.error(`server listen on http://127.0.0.1:${port}/ fail, err:${err.message}`);
    } else {
      console.info(`server listen on http://127.0.0.1:${port}/`);
    }
  });
  return server;
};
