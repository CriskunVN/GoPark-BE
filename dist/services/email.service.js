import nodemailer from 'nodemailer';
import catchAsync from '../utils/catchAsync.js';
import fs from 'fs';
import path from 'path';
const templatePath = path.join(process.cwd(), 'src', 'utils', 'template', 'email-template.html');
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
        secure: true,
    });
    // 2) Define the email options
    const mailOptions = {
        from: 'GoPark <goparkservice@gmail.io> ',
        to: option.email,
        subject: option.subject,
        text: option.message,
    };
    // 3) Send the email
    await transporter.sendMail(mailOptions);
});
export const sendPasswordResetEmail = async (email, token) => {
    const transporter = nodemailer.createTransport({
        // Cấu hình SMTP của bạn
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    const resetLink = `${process.env.URL_FE}/account/reset/password?token=${token}`;
    // Sử dụng template HTML
    const html = htmlTemplate
        .replace('{{userName}}', email)
        .replace('{{resetURL}}', resetLink);
    await transporter.sendMail({
        from: '"GoPark" <goparkservice@gmail.com>',
        to: email,
        subject: 'Reset your password',
        html,
    });
    console.log(`Password reset email sent to ${email}`);
};
export default sendEmail;
//# sourceMappingURL=email.service.js.map