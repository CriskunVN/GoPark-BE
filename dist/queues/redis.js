import IORedis from 'ioredis';
// Cấu hình kết nối Redis
const redisConnection = new IORedis({
    host: process.env.REDIS_HOST ||
        'redis-17261.c98.us-east-1-4.ec2.redns.redis-cloud.com',
    port: 17261,
    password: process.env.REDIS_PASSWORD || 'ETbNlCeFtovlhKjYXdD1HTp108oRoqOk',
    maxRetriesPerRequest: null, // BẮT BUỘC với BullMQ!
});
export default redisConnection;
//# sourceMappingURL=redis.js.map