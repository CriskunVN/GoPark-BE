import nodemailer from 'nodemailer';
import catchAsync from './catchAsync.js';
import fs from 'fs';
import path from 'path';
const templatePath = path.join(
  process.cwd(),
  'utils',
  'template',
  'email-template.html'
);
const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
// This function sends an email using nodemailer
// It takes an option object with email, subject, and message properties
const sendEmail = catchAsync(async (option) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Thay thế biến trong template
  const html = htmlTemplate
    .replace('{{userName}}', option.user)
    .replace('{{resetURL}}', option.resetURL);

  // 2) Define the email options
  const mailOptions = {
    from: 'GoPark <goparkservice@gmail.io> ',
    to: option.email,
    subject: option.subject,
    text: option.message,
    // Nếu option.html có giá trị thì gửi html, nếu không thì undefined
    html,
  };
  // 3) Send the email
  await transporter.sendMail(mailOptions);
});

export default sendEmail;
