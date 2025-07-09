import * as BookingController from '../controllers/booking.controller.js';
import express from 'express';

const router = express.Router();

// Route để tạo một booking mới
router.route('/').get(BookingController.getAllBookings).post(BookingController.createBooking);
// Route để lấy thông tin một booking theo ID
router.route('/:id')
    .get(BookingController.getBookingById)
    .patch(BookingController.updateBooking)
    .delete(BookingController.deleteBooking);
// Route để lấy danh sách booking của một user


export default router;