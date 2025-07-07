import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import AppError from './utils/appError.js';
import userRouter from './routes/user.route.js';
import parkinglotRouter from './routes/parkinglot.route.js';
import parkingSlotRouter from './routes/parkingSlot.route.js';
import searchRoutes from './routes/search.route.js';
import vehicleRoutes from './routes/vehicle.route.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// 1. GLOBAL MIDDLEWARE
// Cấu hình CORS để cho phép frontend truy cập vào backend
app.use(
  cors({
    origin: ['https://go-park-fe.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(helmet()); // Bảo mật HTTP headers
app.use(morgan('dev')); // Ghi log các request
app.use(express.json()); // Parse JSON request body
app.use(express.static(`${__dirname}/public`)); // Serve file tĩnh nếu cần

// 3. ROUTES
app.use(`/api/v1/users`, userRouter);
app.use(`/api/v1/parkinglots`, parkinglotRouter);
app.use('/api/v1/search', searchRoutes);
app.use(`/api/v1/parking-slots`, parkingSlotRouter);
app.use('/api/v1/vehicles', vehicleRoutes);

// 4. ERROR HANDLER
app.use((err, req, res, next) => {
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
