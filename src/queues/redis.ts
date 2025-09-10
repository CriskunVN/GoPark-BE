import IORedis from 'ioredis';

import dotenv from 'dotenv';
import path from 'path';
// Đảm bảo luôn lấy đúng file .env ở thư mục gốc dự án
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Cấu hình kết nối Redis
const host: string = process.env.REDIS_HOST || 'localhost';
const port: number = process.env.REDIS_PORT
  ? parseInt(process.env.REDIS_PORT)
  : 6379;
const password: string = process.env.REDIS_PASSWORD || '';

const redisConnection = new IORedis({
  host: host,
  port: port,
  password: password,
  maxRetriesPerRequest: null,
});

redisConnection.on('connect', () => {
  console.log(
    `✅ Redis connected: ${redisConnection.options.host}:${redisConnection.options.port}`
  );
});

redisConnection.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

export default redisConnection;
