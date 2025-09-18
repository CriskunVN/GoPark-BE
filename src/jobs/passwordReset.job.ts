//JOB WORKER
import { Job } from 'bullmq';
import {
  sendPasswordResetEmail,
  sendVerifyEmail,
} from '../services/email.service.js';

// Hàm xử lý job gửi email đặt lại mật khẩu
export async function processPasswordResetJob(job: Job) {
  try {
    // ...xử lý gửi email...
    const { email, token } = job.data;
    await sendPasswordResetEmail(email, token);
    console.log(`✅ Job gửi email reset mật khẩu hoàn thành: ${job.id}`);
    return true; // hoặc return dữ liệu gì đó
  } catch (err) {
    console.error(`❌ Job gửi email reset mật khẩu thất bại: ${job.id}`, err);
    throw err; // để BullMQ biết job failed
  }
}

export async function processVerifyEmailJob(job: Job) {
  try {
    const { email, token } = job.data;
    await sendVerifyEmail(email, token);
    console.log(`✅ Job gửi email xác nhận hoàn thành: ${job.id}`);
    return true;
  } catch (err) {
    console.error(`❌ Job gửi email xác nhận thất bại: ${job.id}`, err);
    throw err;
  }
}

// Note: hàm này chỉ định nghĩa cách xử lý job, không gọi trực tiếp
// Việc thêm job vào queue được thực hiện ở nơi khác (như trong controller)
