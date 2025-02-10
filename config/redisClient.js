const Redis = require('ioredis');

// Corrected Redis URL without any extra encoding
const redisClient = new Redis('redis://default:qtsbqxgaB17FLWhj9tBMndYYynVY8yrm@redis-12591.c276.us-east-1-2.ec2.redns.redis-cloud.com:12591');

redisClient.on('connect', () => {
    console.log('Connected to Redis...');
});

redisClient.on('error', (err) => {
    console.log('Redis error:', err);
});

module.exports = redisClient;
