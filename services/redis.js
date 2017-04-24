const Redis = require('ioredis');

const config = localRequire('config');
const client = new Redis(config.redisUri);

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
