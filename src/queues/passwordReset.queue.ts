import { Queue, Worker, Job } from 'bullmq';
import type { JobsOptions } from 'bullmq';
import redisConnection from './redis.js';
import { processPasswordResetJob } from '../jobs/passwordReset.job.js';

// (A) Queue: chỉ giữ options chung
const passwordResetQueue = new Queue('passwordResetQueue', {
  connection: redisConnection, // Kết nối đến Redis
});

// (B) Helper: dedupe theo “cửa sổ thời gian” bằng Redis SET NX + jobId cố định
const addPasswordResetJob = async (email: string, token: string) => {
  await passwordResetQueue.add('sendPasswordResetEmail', { email, token });
};

// (C) Worker: rate-limit tốc độ xử lý để né quota SMTP (ví dụ 30 mail/phút)
const passwordResetWorker = new Worker(
  'passwordResetQueue', // Tên queue cần lắng nghe
  processPasswordResetJob, // Hàm xử lý từng job lấy ra từ queue
  {
    connection: redisConnection,
    concurrency: 5, // Số job xử lý 5 job cùng lúc
    limiter: { max: 30, duration: 60_000 }, // <= rate-limit ở tầng CONSUME ( )
  }
);

export { passwordResetQueue, addPasswordResetJob };
