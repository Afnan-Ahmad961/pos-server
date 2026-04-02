const redis = require('../config/redis');

/**
 * Cache service for products
 * Pattern: products:{userId}
 */

const getCache = async (key) => {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
};

const setCache = async (key, value, ttl = 3600) => {
    // ioredis uses setex(key, seconds, value)
    await redis.setex(key, ttl, JSON.stringify(value));
};

const deleteCache = async (key) => {
    await redis.del(key);
};

module.exports = { getCache, setCache, deleteCache };