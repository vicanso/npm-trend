/**
 * 此模块主要用于将各类统计数据先入队列，再多数据一起写到influxdb，提升性能。
 * 注意：使用influxdb主要是做统计，数据不保证是否会丢失
 * @module helpers/influx
 */

const Influx = require('influxdb-nodejs');
const _ = require('lodash');

const config = localRequire('config');
const utils = localRequire('helpers/utils');
const debug = localRequire('helpers/debug');
const schemas = localRequire('influx-schemas');

const client = config.influx ? new Influx(config.influx) : null;
const maxQueueLength = 100;

/**
 * 将当前队列中的统计数据全部写入到influxdb
 */
function flush() {
  const count = client.writeQueueLength;
  if (!count) {
    return;
  }
  client.syncWrite()
    .then(() => console.info(`influxdb write ${count} records sucess`))
    .catch(err => console.error(`influxdb write fail, ${err.message}`));
}

const debounceFlush = _.debounce(flush, 30 * 1000);
if (client) {
  _.forEach(schemas, (schema, measurement) => {
    client.schema(measurement, schema.fields, schema.tags, schema.options);
  });
  client.timeout = 3000;
  client.on('writeQueue', () => {
    // sync write queue if the length is 100
    if (client.writeQueueLength === maxQueueLength) {
      flush();
      return;
    }
    debounceFlush();
  });
}

/**
 * @prop {Influxdb-nodejs} client Influxdb-nodejs的实例
 */
exports.client = client;

/**
 * 写统计数据到influxdb
 * @param  {String}    measurement 统计表的名称
 * @param  {Object}    fields      统计的fields
 * @param  {Object}    [tags = null] 统计的tags，可以为空
 * @param  {Boolean}   [syncNow = false] 是否立即同步，建议不要使用立即同步，会影响性能，如果为false则统计数据进入队列
 * @return {Writer}  返回Influxdb-nodejs中的Wrtier对象
 * @example
 * const influx = require('./helpers/influx');
 * influx.write('http', {
 *   use: 30,
 *   code: 200,
 * }, {
 *   method: 'GET',
 *   type: '2',
 *   spdy: 'fast',
 * });
 */
exports.write = (measurement, fields, ...args) => {
  /* istanbul ignore if */
  if (!client) {
    debug('measurement:%s, fields:%j, args:%j', measurement, fields, args);
    return null;
  }
  const writer = client.write(measurement)
    .field(fields);
  const tags = utils.getParam(args, _.isObject);
  /* istanbul ignore else */
  if (tags) {
    writer.tag(tags);
  }
  debug('influx measurement:%s, fields:%j, tags:%j', measurement, fields, tags);
  const syncNow = utils.getParam(args, _.isBoolean);
  if (!syncNow) {
    writer.queue();
  }
  return writer;
};
