import nodemailer from 'nodemailer';
import catchAsync from './catchAsync.js';

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

  // 2) Define the email options
  const mailOptions = {
    from: 'GoPark <goparkservice@gmail.io> ',
    to: option.email,
    subject: option.subject,
    text: option.message,
    // html: '<h1>HTML version</h1>',
  };
  // 3) Send the email
  await transporter.sendMail(mailOptions);
});

export default sendEmail;
