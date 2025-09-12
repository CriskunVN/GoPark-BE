import { Worker } from 'bullmq';
import redisConnection from '../queues/redis.js';
import { processPasswordResetJob } from '../jobs/passwordReset.job.js';
import 'dotenv/config'; // QUAN TRỌNG: nạp .env cho WORKER process
// Worker lắng nghe queue
const passwordResetWorker = new Worker('passwordResetQueue', // Tên queue phải trùng với tên queue khi tạo
processPasswordResetJob, // Hàm xử lý job
{
    connection: redisConnection,
    concurrency: 10,
    limiter: { max: 60, duration: 60000 }, // 60 job/phút (tránh vượt quota SMTP)
    prefix: 'bull', // Đảm bảo trùng prefix với queue
});
// Log sự kiện
passwordResetWorker
    .on('ready', () => console.log('[WORKER] ready'))
    .on('active', (job) => console.log('[WORKER] active', job.id))
    .on('completed', (job) => console.log('[WORKER] done', job.id))
    .on('failed', (job, err) => console.log('[WORKER] failed', job?.id, err))
    .on('stalled', (jobId) => console.log('[WORKER] stalled', jobId))
    .on('error', (e) => console.log('[WORKER] error', e));
// Giữ process sống
process.on('SIGINT', async () => {
    await passwordResetWorker.close();
    process.exit(0);
});
//# sourceMappingURL=passwordReset.worker.js.map