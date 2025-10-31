import Booking from '../models/booking.model.js';
import AppError from '../utils/appError.js';
import Ticket from '../models/ticket.models.js';
import * as InvoiceService from './invoice.service.js';
import * as fee from './fee.service.js';
import { isPaymentMethodAllowed } from './paymentOption.service.js';
import mongoose from 'mongoose';
import ParkingSlot from '../models/parkingSlot.model.js';
// Hàm validate dùng chung cho booking
const validateBookingInput = async (data) => {
    if (!data.userId)
        throw new AppError('User ID là bắt buộc', 400);
    if (!data.parkingSlotId)
        throw new AppError('Chỗ đỗ là bắt buộc', 400);
    if (!data.startTime || !data.endTime)
        throw new AppError('Thời gian bắt đầu và kết thúc là bắt buộc', 400);
    // Kiểm tra định dạng thời gian
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        throw new AppError('Định dạng thời gian không hợp lệ', 400);
    }
    // Kiểm tra startTime và endTime có hợp lệ
    // Start time phải trước end time và cả hai phải trong tương lai
    if (startTime >= endTime)
        throw new AppError('Thời gian bắt đầu phải trước thời gian kết thúc', 400);
    const now = new Date();
    if (startTime < now || endTime <= now) {
        throw new AppError('Thời gian bắt đầu và kết thúc phải trong tương lai', 400);
    }
    // Kiểm tra xem user và slot có tồn tại không
    const [user, slot] = await Promise.all([
        mongoose.model('User').findById(data.userId),
        mongoose.model('ParkingSlot').findById(data.parkingSlotId),
    ]);
    if (!user)
        throw new AppError('Không tìm thấy người dùng', 400);
    if (!slot)
        throw new AppError('Không tìm thấy chỗ đỗ', 404);
    // Kiểm tra trạng thái slot còn trống không
    // if (slot.status !== 'available') throw new AppError('Parking slot is not available', 400);
    return { startTime, endTime, user, slot };
};
// / Hàm validate dùng chung cho booking khách vãng lai
const validateBookingGuestInput = async (data) => {
    if (!data.userId)
        throw new AppError('User ID là bắt buộc', 400);
    if (!data.parkingSlotId)
        throw new AppError('Chỗ đỗ là bắt buộc', 400);
    // Kiểm tra xem user và slot có tồn tại không
    const [user, slot] = await Promise.all([
        mongoose.model('User').findById(data.userId),
        mongoose.model('ParkingSlot').findById(data.parkingSlotId),
    ]);
    if (!user)
        throw new AppError('Không tìm thấy người dùng', 400);
    if (!slot)
        throw new AppError('Không tìm thấy chỗ đỗ', 404);
    // Kiểm tra trạng thái slot còn trống không
    // if (slot.status !== 'available') throw new AppError('Parking slot is not available', 400);
    return { user, slot };
};
// Kiểm tra slot đã được đặt trùng thời gian chưa
const isSlotBooked = async (slotId, newStartTime, newEndTime) => {
    return await Booking.exists({
        parkingSlotId: slotId,
        status: { $in: ['pending', 'confirmed'] },
        $or: [{ startTime: { $lt: newEndTime }, endTime: { $gt: newStartTime } }],
    });
};
// Tạo booking cho khách vãng lai
export const createBookingForGuest = async (data) => {
    const startTime = new Date(); // Thời gian bắt đầu là hiện tại
    const endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000); // Thời gian kết thúc là 24 giờ sau
    // Validate input
    await validateBookingGuestInput(data);
    // Kiểm tra trùng lịch
    const booked = await isSlotBooked(data.parkingSlotId, startTime, endTime);
    if (booked)
        throw new AppError('Slot has already been booked for this time range', 400);
    // Cập nhật trạng thái slot
    await mongoose
        .model('ParkingSlot')
        .findByIdAndUpdate(data.parkingSlotId, { status: 'booked' });
    // Kiểm tra phương thức thanh toán
    const paymentMethod = 'pay-at-parking';
    // Tạo booking
    const booking = await Booking.create({
        userId: data.userId,
        parkingSlotId: data.parkingSlotId,
        startTime: startTime, // Thời gian bắt đầu là hiện tại
        endTime: endTime,
        paymentMethod,
        paymentStatus: 'unpaid',
        status: 'check-in',
        vehicleNumber: data.vehicleNumber || '',
        bookingType: 'hours', // Loại booking cho khách vãng lai
        discount: 0, // Không có giảm giá cho khách vãng lai
        totalPrice: 0, // Không có giá cho khách vãng lai
    });
    return booking;
};
export const createBooking = async (data) => {
    // Validate input
    const { startTime, endTime, slot } = await validateBookingInput(data);
    // Kiểm tra trùng lịch
    const booked = await isSlotBooked(data.parkingSlotId, startTime, endTime);
    if (booked)
        throw new AppError(`Slot đã được đặt trong khoảng thời gian này`, 400);
    // Kiểm tra phương thức thanh toán
    const paymentMethod = data.paymentMethod || 'pay-at-parking';
    const isAllowed = await isPaymentMethodAllowed(data.parkingSlotId, paymentMethod);
    if (!isAllowed)
        throw new AppError('Phương thức thanh toán không được phép cho bãi đỗ này', 400);
    await ParkingSlot.findByIdAndUpdate(data.parkingSlotId, {
        status: 'reserved',
    });
    // Tính toán giá cho booking tháng và năm
    const { price, discountPercent } = fee.calculateTotalPrice(data, slot);
    // Tạo booking
    const booking = await Booking.create({
        userId: data.userId,
        parkingSlotId: data.parkingSlotId,
        startTime,
        endTime,
        paymentMethod,
        status: 'pending',
        vehicleNumber: data.vehicleNumber || '',
        bookingType: data.bookingType, // 'hours', 'date', hoặc 'month'
        discount: discountPercent, // Lưu phần trăm giảm giá
        totalPrice: price, // Lưu tổng giá sau giảm
    });
    return booking;
};
export const handleBookingAfterCreate = async (bookingData) => {
    // Nếu khách thanh toán tại bãi, sinh ticket luôn
    if (bookingData.paymentMethod === 'pay-at-parking') {
        const ticket = await createTicket({
            bookingId: bookingData._id,
            userId: bookingData.userId,
            parkingSlotId: bookingData.parkingSlotId,
            vehicleNumber: bookingData.vehicleNumber,
            ticketType: bookingData.bookingType,
            startTime: bookingData.startTime,
            expiryDate: bookingData.endTime,
            paymentStatus: bookingData.paymentStatus,
        });
        return { ticket };
    }
    // Tạo hóa đơn nếu khách thanh toán trước (prepaid)
    if (bookingData.paymentMethod === 'prepaid') {
        const invoiceNumber = 'INV-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        const invoice = await InvoiceService.createInvoice({
            userId: bookingData.userId,
            invoiceNumber: invoiceNumber,
            bookingId: bookingData._id,
            amount: bookingData.totalPrice,
            status: 'unpaid',
            transactionId: `TXN-${Date.now()}`,
        });
        return { invoice };
    }
    return {};
};
// Lấy chi tiết một booking
export const getBookingById = async (id) => {
    const booking = await Booking.findById(id).populate('userId parkingSlotId');
    if (!booking) {
        throw new AppError('Không tìm thấy booking', 404);
    }
    return booking;
};
// Hủy booking
export const cancelBooking = async (id) => {
    return Booking.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true });
};
// Check out cho booking khách vãng lai
export const checkOutBookingForGuest = async (id) => {
    const booking = await Booking.findById(id);
    if (!booking)
        throw new AppError('Không tìm thấy booking', 404);
    const endTime = new Date();
    const slot = await mongoose
        .model('ParkingSlot')
        .findById(booking.parkingSlotId);
    const { price } = calculateTotalPrice({
        bookingType: 'guest',
        startTime: booking.startTime,
        endTime: endTime,
    }, slot);
    // Cập nhật trạng thái booking
    booking.status = 'completed';
    booking.endTime = endTime;
    booking.totalPrice = price;
    await booking.save();
    // Cập nhật trạng thái slot
    await mongoose
        .model('ParkingSlot')
        .findByIdAndUpdate(booking.parkingSlotId, { status: 'available' });
    return booking;
};
//# sourceMappingURL=booking.service.js.map