const Redis = require('ioredis');
const _ = require('lodash');

const config = localRequire('config');
const client = new Redis(config.redisUri);

const delayLog = _.throttle((message, type) => {
  if (type === 'error') {
    console.error(`redis error, ${message})`);
  } else {
    console.info(`redis ${message}`);
  }
}, 3000);

client.on('error', err => delayLog(err.message, 'error'));

client.on('connect', () => delayLog('connected'));


const getSessionKey = key => `${config.app}:${key}`;

class SessionStore {
  constructor(redisClient) {
    this.redisClient = redisClient;
  }
  async get(key) {
    const data = await this.redisClient.get(getSessionKey(key));
    if (!data) {
      return null;
    }
    return JSON.parse(data);
  }
  async set(key, json, maxAge) {
    await this.redisClient.psetex(getSessionKey(key), maxAge, JSON.stringify(json));
  }
  async destroy(key) {
    await this.redisClient.del(getSessionKey(key));
  }
}

exports.client = client;
exports.sessionStore = new SessionStore(client);
