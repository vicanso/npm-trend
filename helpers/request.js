const request = require('superagent');
const _ = require('lodash');
const stringify = require('simple-stringify');

exports.timeout = 5 * 1000;

function httpStats(req) {
  const stats = {};
  const finished = _.once(() => {
    stats.use = Date.now() - stats.startedAt;
    delete stats.startedAt;
    if (stats.error) {
      console.error(stringify.json(stats));
    } else {
      console.info(stringify.json(stats));
    }
  });
  req.once('request', () => {
    /* eslint no-underscore-dangle:0 */
    const sendData = req._data;
    _.extend(stats, {
      host: req.host,
      path: req.req.path,
      method: req.method,
      startedAt: Date.now(),
    });
    const backendServer = req.backendServer;
    if (backendServer) {
      _.extend(stats, _.pick(backendServer, ['ip', 'port']));
    }
    if (!_.isEmpty(sendData)) {
      stats.data = stringify.json(sendData);
    }
  });
  req.once('error', (err) => {
    stats.code = -1;
    stats.error = err.message;
    finished();
  });
  req.once('response', (res) => {
    stats.code = res.statusCode;
    finished();
  });
}

function defaultHandle(req) {
  req.timeout(exports.timeout);
  httpStats(req);
}

_.forEach(['get', 'post', 'put', 'del'], (method) => {
  exports[method] = (...args) => {
    const req = request[method](...args);
    defaultHandle(req);
    return req;
  };
});
