const NodeCache = require('node-cache');
const { CACHE_TTL_SECONDS } = require('../config/constants');

const cache = new NodeCache({ stdTTL: CACHE_TTL_SECONDS, checkperiod: 120 });

function get(key) {
  return cache.get(key);
}

function set(key, value, ttl) {
  if (ttl !== undefined) {
    cache.set(key, value, ttl);
  } else {
    cache.set(key, value);
  }
}

function del(key) {
  cache.del(key);
}

function flush() {
  cache.flushAll();
}

module.exports = { get, set, del, flush };
