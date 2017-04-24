/**
 * 此模块定义influxdb的schme，在`helpers/influx`中会使用定义的schema来初始化。
 * 对于写入influxdb的数据，虽然influxdb会根据第一次写入的字段决定数据类型，
 * 不过使用的时候，最好还是把schme先定义好
 * @module influx-schemas
 * @see {@link https://github.com/vicanso/influxdb-nodejs}
 * @example
 * const schmeas = require('./influx-schemas');
 * // {"mongoose": {"fields": ...} ...}
 * console.info(schemas);
 */

const schemas = {
  mongoose: {
    fields: {
      use: 'integer',
      id: 'string',
    },
    tags: {
      collection: '*',
      op: '*',
      spdy: '012345'.split(''),
    },
    options: {
      stripUnknown: true,
    },
  },
  deprecate: {
    fields: {
      path: 'string',
    },
    options: {
      stripUnknown: true,
    },
  },
  httpRoute: {
    fields: {
      use: 'integer',
    },
    tags: {
      method: '*',
      path: '*',
      spdy: '012345'.split(''),
    },
    options: {
      stripUnknown: true,
    },
  },
  excetion: {
    fields: {
      code: 'integer',
      path: 'string',
      message: 'string',
    },
    tags: {
      type: ['E', 'U'],
    },
    options: {
      stripUnknown: true,
    },
  },
  http: {
    fields: {
      connecting: 'integer',
      total: 'integer',
      use: 'integer',
      bytes: 'integer',
      code: 'integer',
      ip: 'string',
      url: 'string',
      request: 'integer',
    },
    // 根据koa-http-stats配置的指定
    tags: {
      status: '12345'.split(''),
      spdy: '012345'.split(''),
      size: '012345'.split(''),
      busy: '01234'.split(''),
      method: '*',
    },
    options: {
      stripUnknown: true,
    },
  },
  // user tracker中记录不同业务字段很多不确定，因此不做stripUnknown
  userTracker: {
    fields: {
      use: 'integer',
      ip: 'string',
      token: 'string',
    },
    tags: {
      category: '*',
      result: ['success', 'fail'],
    },
  },
  performance: {
    fields: {
      lag: 'integer',
      physical: 'integer',
      exec: 'integer',
      connectingTotal: 'integer',
      cpuUsedPercent: 'interger',
    },
    tags: {
      status: ['free', 'normal', 'busy'],
      memory: ['low', 'mid', 'high', 'higher'],
      connecting: ['fewer', 'few', 'medium', 'many'],
    },
    options: {
      stripUnknown: true,
    },
  },
  session: {
    fields: {
      account: 'string',
      use: 'interger',
    },
    tags: {
      spdy: '012345'.split(''),
    },
    options: {
      stripUnknown: true,
    },
  },
};

module.exports = schemas;
