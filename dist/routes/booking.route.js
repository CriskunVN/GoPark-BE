import * as BookingController from '../controllers/booking.controller.js';
import * as authController from '../controllers/auth.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import express from 'express';
const router = express.Router();
// Middleware để bảo vệ các route sau khi đăng nhập
router.use(protect);
// Public route for admin dashboard (for development/testing)
router.route('/admin/all').get(BookingController.getAllBookings);
// Route để lấy bookings của user hiện tại
router.route('/my-bookings').get(BookingController.getMyBookings);
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
//# sourceMappingURL=booking.route.js.map