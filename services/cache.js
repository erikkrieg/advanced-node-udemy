const { promisify } = require('util');
const mongoose = require('mongoose');
const redis = require('redis');
const keys = require('../config/keys');

const exec = mongoose.Query.prototype.exec;
const client = redis.createClient(keys.redisURI);

client.hget = promisify(client.hget);

mongoose.Query.prototype.cache = function ({ key } = {}) {
  this.useCache = true;
  this.cacheHashKey = JSON.stringify(key || '');
  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  const collection = this.mongooseCollection.name;
  const key = JSON.stringify({ ...this.getQuery(), collection });

  const cachedValue = await client.hget(this.cacheHashKey, key);

  if (cachedValue) {
    const parsedCachedValue = JSON.parse(cachedValue);
    const result = Array.isArray(parsedCachedValue)
      ? parsedCachedValue.map(val => new this.model(val))
      : new this.model(parsedCachedValue);
    return result;
  }

  const result = await exec.apply(this, arguments);
  client.hset(this.cacheHashKey, key, JSON.stringify(result), 'EX', 10);
  return result;
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  }
}
