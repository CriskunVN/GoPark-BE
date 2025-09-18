import nodemailer from 'nodemailer';
import catchAsync from '../utils/catchAsync.js';
import fs from 'fs';
import path from 'path';
// Import type
import type { EmailOptions } from '../types/emailType.js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

const resetTemplatePath = path.join(
  process.cwd(),
  'src',
  'utils',
  'template',
  'email-template.html'
);
const verifyTemplatePath = path.join(
  process.cwd(),
  'src',
  'utils',
  'template',
  'email-verify.html'
);
const htmlResetTemplate = fs.readFileSync(resetTemplatePath, 'utf-8');
const htmlVerifyTemplate = fs.readFileSync(verifyTemplatePath, 'utf-8');

// // Gửi email
// const sendEmail = catchAsync(async (option: EmailOptions) => {
//   // // 1) Create a transporter
//   // const transporter = nodemailer.createTransport({
//   //   service: 'gmail',
//   //   auth: {
//   //     user: process.env.EMAIL_USERNAME,
//   //     pass: process.env.EMAIL_PASSWORD,
//   //   },
//   //   secure: true,
//   // });

//   const mailOptions = {
//     from: `GoPark <${process.env.FROM_EMAIL}>`,
//     to: option.email,
//     subject: option.subject,
//     text: option.message,
//   };
//   // 3) Send the email
//   await resend.emails.send(mailOptions);
// });

export const sendPasswordResetEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const resetLink = `${process.env.URL_FE_NEW}/account/reset/password?token=${token}`;

  // Sử dụng template HTML
  const html = htmlResetTemplate
    .replace('{{userName}}', email)
    .replace(/{{resetURL}}/g, resetLink)
    .replace('{{privacyURL}}', 'https://gopark.id.vn/privacy')
    .replace('{{termsURL}}', 'https://gopark.id.vn/terms')
    .replace('{{contactURL}}', 'https://gopark.id.vn/contact');

  try {
    await resend.emails.send({
      from: `GoPark Team <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch (err: any) {
    console.error('Send mail error:', err);
    throw err; // Để job chuyển sang failed
  }
};

export const sendVerifyEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const verifyLink = `${process.env.URL_FE_NEW}/account/verify?token=${token}`;
  const html = htmlVerifyTemplate
    .replace('{{userName}}', email)
    .replace(/{{verifyURL}}/g, verifyLink)
    .replace('{{privacyURL}}', 'https://gopark.id.vn/privacy')
    .replace('{{termsURL}}', 'https://gopark.id.vn/terms')
    .replace('{{contactURL}}', 'https://gopark.id.vn/contact');
  try {
    await resend.emails.send({
      from: `GoPark Team <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: 'Xác nhận email đăng ký tài khoản',
      html,
    });
  } catch (err: any) {
    console.error('Send mail error:', err);
    throw err;
  }
};
