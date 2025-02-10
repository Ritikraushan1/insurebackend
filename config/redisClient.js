const Redis = require('ioredis');
 
const redisClient  = new Redis()
 
// client.on('connect', () => {
//     console.log('Connected to Redis...');
// });
module.exports  = redisClient;