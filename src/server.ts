// 4. SERVER

import mongoose from 'mongoose';
import type { Server } from 'http';

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import app from './app.js';

// Import worker để xử lý job trong queue
import './workers/passwordReset.worker.js'; // chạy worker cùng process

// Cron job: Update booking status to 'booked' when startTime <= now
import './utils/cron/bookingStatusUpdater.js';
import './utils/cron/parkingSlotCleaner.js';
import AppError from './utils/appError.js';

let server: Server | undefined;
// Xử  lý các lỗi không được bắt (uncaught exceptions)
process.on('uncaughtException', (err: AppError) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
// Xử lý các lỗi không được bắt trong các promise (unhandled rejections)
process.on('unhandledRejection', (err: AppError) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! Shutting down...');
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

if (!process.env.DATABASE) {
  console.log(process.env.DATABASE);
  throw new AppError('DATABASE environment variable is not defined');
}
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD || ''
); // Replace <PASSWORD> with your actual database password

// Connect to the database using mongoose
mongoose.connect(DB).then(() => console.log('DB connection successful!'));

const port = process.env.PORT;

// Start the server
server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('REDIS_HOST:', process.env.REDIS_HOST);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: AppError) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
