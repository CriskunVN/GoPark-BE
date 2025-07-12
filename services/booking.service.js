import Booking from '../models/booking.model.js';
import AppError from '../utils/appError.js';
import Ticket from '../models/ticket.models.js';
import { isPaymentMethodAllowed } from './paymentOption.service.js';
import mongoose from 'mongoose';

// Hàm validate dùng chung cho booking
const validateBookingInput = async (data) => {
  if (!data.userId) throw new AppError('User ID is required for booking', 400);
  if (!data.parkingSlotId) throw new AppError('Parking slot is required', 400);
  if (!data.startTime || !data.endTime)
    throw new AppError('Start time and end time are required', 400);

  // Kiểm tra định dạng thời gian
  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);
  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    throw new AppError('Invalid start or end time format', 400);
  }
  // Kiểm tra startTime và endTime có hợp lệ
  // Start time phải trước end time và cả hai phải trong tương lai
  if (startTime >= endTime)
    throw new AppError('Start time must be before end time', 400);
  const now = new Date();
  if (startTime < now || endTime <= now) {
    throw new AppError('Start time and end time must be in the future', 400);
  }
  // Kiểm tra xem user và slot có tồn tại không
  const [user, slot] = await Promise.all([
    mongoose.model('User').findById(data.userId),
    mongoose.model('ParkingSlot').findById(data.parkingSlotId),
  ]);
  if (!user) throw new AppError('User not found', 400);
  if (!slot) throw new AppError('Parking slot not found', 404);
  // Kiểm tra trạng thái slot còn trống không
  // if (slot.status !== 'available') throw new AppError('Parking slot is not available', 400);

  return { startTime, endTime, user, slot };
};

// / Hàm validate dùng chung cho booking khách vãng lai
const validateBookingGuestInput = async (data) => {
  if (!data.userId) throw new AppError('User ID is required for booking', 400);
  if (!data.parkingSlotId) throw new AppError('Parking slot is required', 400);

  // Kiểm tra xem user và slot có tồn tại không
  const [user, slot] = await Promise.all([
    mongoose.model('User').findById(data.userId),
    mongoose.model('ParkingSlot').findById(data.parkingSlotId),
  ]);
  if (!user) throw new AppError('User not found', 400);
  if (!slot) throw new AppError('Parking slot not found', 404);
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
  // Validate input
  await validateBookingGuestInput(data);
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000); // Sau 24 tiếng
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
    startTime: startTime,
    endTime: endTime,
    paymentMethod,
    paymentStatus: 'unpaid',
    status: 'pending',
    vehicleNumber: data.vehicleNumber || '',
  });

  return booking;
};

// Booking theo giờ
export const createBookingByHour = async (data) => {
  // Validate input
  const { startTime, endTime, slot } = await validateBookingInput(data);

  // Kiểm tra trùng lịch
  const booked = await isSlotBooked(data.parkingSlotId, startTime, endTime);
  if (booked)
    throw new AppError('Slot has already been booked for this time range', 400);

  // Kiểm tra phương thức thanh toán
  const paymentMethod = data.paymentMethod || 'pay-at-parking';
  const isAllowed = await isPaymentMethodAllowed(
    data.parkingSlotId,
    paymentMethod
  );
  if (!isAllowed)
    throw new AppError('Payment method not allowed for this parking lot', 400);

  // Tạo booking
  const booking = await Booking.create({
    userId: data.userId,
    parkingSlotId: data.parkingSlotId,
    startTime: startTime,
    endTime: endTime,
    paymentMethod,
    paymentStatus: paymentMethod === 'prepaid' ? 'paid' : 'unpaid',
    status: 'pending',
    vehicleNumber: data.vehicleNumber || '',
    bookingType: 'hour',
  });
  return booking;
};

// Booking theo ngày
export const createBookingByDate = async (data) => {
  // Validate input
  const { startTime, endTime, slot } = await validateBookingInput(data);

  // Kiểm tra trùng lịch
  const booked = await isSlotBooked(data.parkingSlotId, startTime, endTime);
  if (booked)
    throw new AppError('Slot has already been booked for this time range', 400);

  // Kiểm tra phương thức thanh toán
  const paymentMethod = data.paymentMethod || 'pay-at-parking';
  const isAllowed = await isPaymentMethodAllowed(
    data.parkingSlotId,
    paymentMethod
  );
  if (!isAllowed)
    throw new AppError('Payment method not allowed for this parking lot', 400);

  // Tạo booking
  const booking = await Booking.create({
    userId: data.userId,
    parkingSlotId: data.parkingSlotId,
    startTime: startTime,
    endTime: endTime,
    paymentMethod,
    paymentStatus: paymentMethod === 'prepaid' ? 'paid' : 'unpaid',
    status: 'pending',
    vehicleNumber: data.vehicleNumber || '',
    bookingType: 'date',
  });
  return booking;
};

// Lấy chi tiết một booking
export const getBookingById = async (id) => {
  const booking = await Booking.findById(id).populate('userId parkingSlotId');
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }
  return booking;
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

// Check out cho booking khách vãng lai
export const checkOutBookingForGuest = async (id) => {
  return Booking.findByIdAndUpdate(
    id,
    {
      status: 'completed',
      endTime: new Date(), // cập nhật endTime khi check-out
    },
    { new: true }
  );
};
