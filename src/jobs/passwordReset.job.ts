//JOB WORKER
import { Job } from 'bullmq';
import { sendPasswordResetEmail } from '../services/email.service.js';

// Hàm xử lý job gửi email đặt lại mật khẩu
export const processPasswordResetJob = async (job: Job) => {
  const { email, token } = job.data;
  await sendPasswordResetEmail(email, token);
};
