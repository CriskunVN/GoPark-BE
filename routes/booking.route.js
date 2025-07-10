import * as BookingController from '../controllers/booking.controller.js';
import express from 'express';

const router = express.Router();

// Route để tạo một booking mới
router.route('/').get(BookingController.getAllBookings);
// Route để lấy thông tin một booking theo ID
router.route('/:id')
    .get(BookingController.getBookingById)
    .patch(BookingController.updateBooking)
    .delete(BookingController.deleteBooking);

// Route để tạo booking theo giờ và theo ngày
router.route('/bookingHour')
    .post(BookingController.createBookingByHour);

router.route('/bookingDate').post(BookingController.createBookingByDate);

// Route để hủy một booking
router.route('/:id/cancel')
    .patch(BookingController.cancelBooking);
// Route để checkin một booking
router.route('/:id/checkin')
    .patch(BookingController.checkinBooking);
// Route để checkout một booking
router.route('/:id/checkout')
    .patch(BookingController.checkoutBooking);

export default router;      