import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import AppError from './utils/appError.js';
//Route
import userRouter from './routes/user.route.js';
import userNewRouter from './routes/user_new.route.js';
import parkinglotRouter from './routes/parkinglot.route.js';
import parkingSlotRouter from './routes/parkingSlot.route.js';
import searchRoutes from './routes/search.route.js';
import vehicleRoutes from './routes/vehicle.route.js';
import bookingRouter from './routes/booking.route.js';
import chatbotRoutes from './routes/chatbot.routes.js';
import ticketRouter from './routes/ticket.route.js';
import ocrRoute from "./routes/ocr.route.js";

// Route for VNPay
import vnpayRouter from './routes/vnpay.route.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Admin routes
import adminRouter from './routes/admin.route.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// 1. GLOBAL MIDDLEWARE
// Cấu hình CORS để cho phép frontend truy cập vào backend
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://go-park-fe.vercel.app',
      ];
      // Cho phép cả request không có origin (ví dụ từ Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(helmet()); // Bảo mật HTTP headers
app.use(morgan('dev')); // Ghi log các request
app.use(express.json()); // Parse JSON request body
app.use(express.static(`${__dirname}/public`)); // Serve file tĩnh nếu cần

// 3. ROUTES

const apiPrefix = process.env.API_PREFIX || '/api/v1';

app.use(`${apiPrefix}/users`, userRouter); // đăng nhập
app.use(`${apiPrefix}/users_new`, userNewRouter); // New user routes
app.use(`${apiPrefix}/parkinglots`, parkinglotRouter); // route bãi đỗ xe
app.use(`${apiPrefix}/search`, searchRoutes); // route tìm kiếm
app.use(`${apiPrefix}/parking-slots`, parkingSlotRouter); // route chỗ đỗ xe
app.use(`${apiPrefix}/vehicles`, vehicleRoutes); // route xe
app.use(`${apiPrefix}/bookings`, bookingRouter); // route đặt chỗ
app.use(`${apiPrefix}/chatbot`, chatbotRoutes); // route chatbot
app.use(`${apiPrefix}/tickets`, ticketRouter); //route vé xe
app.use(`${apiPrefix}/vnpay`, vnpayRouter); // route thanh toán VNPay
app.use(`${apiPrefix}/admin`, adminRouter); // route admin
app.use("/ocr", ocrRoute);


// 4. ERROR HANDLER (Middle xử lý lỗi)
app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

// app.use((err, req, res, next) => {
//   next(new AppError(`Can't found URL: ${req.originalUrl} on this server`, 404));
// });

export default app;
