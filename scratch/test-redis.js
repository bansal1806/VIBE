const Redis = require('ioredis');

async function testRedis() {
  const redisUrl = "redis://localhost:6379";
  console.log(`Connecting to Redis at ${redisUrl}...`);
  
  const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
  });

  try {
    const res = await redis.ping();
    console.log(`SUCCESS: Redis ping result: ${res}`);
  } catch (err) {
    console.error(`FAILURE: Redis connection failed:`, err.message);
  } finally {
    redis.disconnect();
  }
}

testRedis();
