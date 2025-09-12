import { Queue } from 'bullmq';
import redisConnection from './redis.js';
// (A) Queue: tạo queue
export const passwordResetQueue = new Queue('passwordResetQueue', {
    connection: redisConnection, // Kết nối đến Redis
    prefix: 'bull',
});
// (B) Helper: hàm thêm job vào queue
export const addPasswordResetJob = async (email, token) => {
    console.log('Add job gửi email reset mật khẩu vào queue', email);
    await passwordResetQueue.add('sendPasswordResetEmail', { email, token }, {
        jobId: `${email}-${Date.now()}`, // jobId luôn khác nhau
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3, // Thử lại tối đa 3 lần nếu thất bại
    });
};
//# sourceMappingURL=passwordReset.queue.js.map