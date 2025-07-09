import Booking from '../models/booking.model.js';
import AppError from '../utils/appError.js';
import { isPaymentMethodAllowed } from './paymentOption.service.js';
import mongoose from 'mongoose';

// Tính tổng tiền dựa trên thời gian bắt đầu, kết thúc và giá mỗi giờ
const funcTotalPrice = (start, end, pricePerHour) => {
    const diffMs = end - start;
    if (diffMs <= 0) {
        throw new AppError('End time must be after start time', 400);
    }
    // Tính số giờ, làm tròn lên nếu có lẻ phút
    const hours = Math.ceil(diffMs / (1000 * 60 * 60));
    return hours * pricePerHour;
};



// Tạo booking mới
export const createBooking = async (data) => {
    // Kiểm tra xem user con tồn tại không
    const user = await mongoose.model('User').findById(data.userId);
    if (!user) {
        throw new AppError('User ID is required for booking', 400);
    }
    // Kiểm tra slot
    if (!data.parkingSlotId) {
        throw new AppError('Parking slot is required', 400);
    }
    const slot = await mongoose.model('ParkingSlot').findById(data.parkingSlotId);
    if (!slot) {
        throw new AppError('Parking slot not found', 404);
    }
    if (slot.status !== 'available') {
        throw new AppError('Parking slot is not available', 400);
    }
    // Kiểm tra thời gian
    if (!data.startTime || !data.endTime || data.startTime >= data.endTime) {
        throw new AppError('Invalid start or end time', 400);
    }

    // Tính tiền theo thời gian start và end
    const totalPrice = funcTotalPrice(data.startTime , data.endTime , slot.pricePerHour);

    // Cập nhật trạng thái slot
    await mongoose.model('ParkingSlot').findByIdAndUpdate(data.parkingSlotId, { status: 'booked' });
    
    // Phương thức thanh toán
    const paymentMethod = data.paymentMethod || 'pay-at-parking';
    const isAllowed = await isPaymentMethodAllowed(data.parkingSlotId, paymentMethod);
    if (!isAllowed) {
        throw new AppError('Payment method not allowed for this parking lot', 400);
    }
    
    // Tạo booking
    const booking = await Booking.create({
        userId: data.userId,
        parkingSlotId: data.parkingSlotId,
        startTime: data.startTime,
        endTime: data.endTime,
        totalPrice,
        paymentMethod,
        paymentStatus: paymentMethod === 'prepaid' ? 'paid' : 'unpaid',
        status: 'pending',
        bookingDate: new Date(),
        vehicleNumber: data.vehicleNumber || ''
    });
    return booking;
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
