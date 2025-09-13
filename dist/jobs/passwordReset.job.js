//JOB WORKER
import { Job } from 'bullmq';
import { sendPasswordResetEmail } from '../services/email.service.js';
// Hàm xử lý job gửi email đặt lại mật khẩu
export async function processPasswordResetJob(job) {
    try {
        // ...xử lý gửi email...
        const { email, token } = job.data;
        await sendPasswordResetEmail(email, token);
        console.log(`✅ Job gửi email reset mật khẩu hoàn thành: ${job.id}`);
        return true; // hoặc return dữ liệu gì đó
    }
    catch (err) {
        console.error(`❌ Job gửi email reset mật khẩu thất bại: ${job.id}`, err);
        throw err; // để BullMQ biết job failed
    }
}
//# sourceMappingURL=passwordReset.job.js.map