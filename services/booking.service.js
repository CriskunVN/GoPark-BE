import Booking from '../models/booking.model.js';
import AppError from '../utils/appError.js';
import { isPaymentMethodAllowed } from './paymentOption.service.js';

// Tạo booking mới
export const createBooking = async (data) => {
    // Kiểm tra xem user con tồn tại không
  if (!data.userId) {
    throw new AppError('User ID is required for booking', 400);
    }
    // Kiểm tra xem slot có còn trống không
    if (data.parkingSlotId.status !== 'available') {
        throw new AppError('Parking slot is not available', 400);
    }
    // Kiểm tra thời gian bắt đầu và kết thúc
    if (data.startTime >= data.endTime) {
        throw new AppError('Start time must be before end time', 400);
    }
    
    // Tính toán giá tiền dựa trên thời gian booking
    const duration = (data.endTime - data.startTime) / (1000 * 60 * 60); // Tính theo giờ
    const pricePerHour = data.parkingSlotId.pricePerHour || 0; // Giá theo giờ của slot
    data.totalPrice = duration * pricePerHour;
    
    // Cập nhật trạng thái của slot
    data.parkingSlotId.status = 'booked';
    
    // Tạo booking mới
    data.status = 'pending'; // Trạng thái ban đầu của booking

    // Kiểm tra phương thức thanh toán khách chọn
    const paymentMethod = data.paymentMethod || 'pay-at-parking';
    await isPaymentMethodAllowed(data.parkingSlotId, paymentMethod);
    data.paymentMethod = paymentMethod;
    if (paymentMethod === 'prepaid') {
        data.paymentStatus = 'paid';
    } else {
        data.paymentStatus = 'unpaid';
    }

  // Tạo booking mới
  data.bookingDate = new Date(); // Ngày tạo booking, mặc định là ngày hiện
  data.vehicleNumber = data.vehicleNumber || ''; // Số xe của người dùng, có thể để trống nếu không có

  const booking = await Booking.create(data);
  return booking;
};

// Lấy danh sách booking (có thể filter theo user, slot, status...)
export const getBookings = async (filter = {}, options = {}) => {
  return Booking.find(filter, null, options).populate('userId parkingSlotId');
};

// Lấy chi tiết một booking
export const getBookingById = async (id) => {
  return Booking.findById(id).populate('userId parkingSlotId');
};

// Hủy booking
export const cancelBooking = async (id) => {
  return Booking.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true });
};

// Check-in
export const checkInBooking = async (id) => {
  return Booking.findByIdAndUpdate(id, { status: 'confirmed' }, { new: true });
};

// Check-out
export const checkOutBooking = async (id) => {
  return Booking.findByIdAndUpdate(id, { status: 'completed' }, { new: true });
};
