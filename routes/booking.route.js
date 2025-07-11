import * as BookingController from '../controllers/booking.controller.js';
import express from 'express';

const router = express.Router();

// Route để tạo một booking mới
router.route('/').get(BookingController.getAllBookings);
// Route để lấy thông tin một booking theo ID
router
  .route('/:id')
  .get(BookingController.getBookingById)
  .patch(BookingController.updateBooking)
  .delete(BookingController.deleteBooking);

// Route để tạo booking theo giờ
router.route('/bookingHour').post(BookingController.createBookingByHour);

// Route để tạo booking theo ngày
router.route('/bookingDate').post(BookingController.createBookingByDate);

// Route để tạo một booking cho khách vãng lai
router.route('/bookingGuest').post(BookingController.createBookingForGuest);

// Route để hủy một booking
router.route('/:id/cancel').patch(BookingController.cancelBooking);

export default router;
