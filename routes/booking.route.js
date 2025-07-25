import * as BookingController from '../controllers/booking.controller.js';
import * as authController from '../controllers/auth.controller.js';
import express from 'express';

const router = express.Router();

// Middleware để bảo vệ các route sau khi đăng nhập
router.use(authController.protect);

// Route để tạo một booking mới
router.route('/').get(BookingController.getAllBookings);
// Route để lấy thông tin một booking theo ID
router
  .route('/:id')
  .get(BookingController.getBookingById)
  .patch(BookingController.updateBooking)
  .delete(BookingController.deleteBooking);

// Route tạo một booking online cho khách hàng
router.route('/bookingOnline').post(BookingController.createBookingOnline);

// Route để tạo một booking cho khách vãng lai
router.route('/bookingGuest').post(BookingController.createBookingForGuest);

// Route để hủy một booking
router.route('/:id/cancel').patch(BookingController.cancelBooking);

// Route để thanh toán tại bãi
router.route('/:id/payAtParking').patch(BookingController.payAtParking);

export default router;
