import catchAsync from '../utils/catchAsync.js';
import * as bookingService from '../services/booking.service.js';
import Booking from '../models/booking.model.js';
import * as Factory from './handlerFactory.controller.js';
import { createTicket } from './ticket.controller.js';

// Tạo booking cho khách vãng lai
export const createBookingForGuest = catchAsync(async (req, res, next) => {
  const booking = await bookingService.createBookingForGuest(req.body);

  const ticket = await createTicket({
    bookingId: booking._id,
    userId: booking.userId,
    parkingSlotId: booking.parkingSlotId,
    vehicleNumber: booking.vehicleNumber,
    ticketType: booking.bookingType === 'hour' ? 'hourly' : 'daily',
    startTime: booking.startTime,
    expiryDate: booking.endTime,
    paymentStatus: booking.paymentStatus,
  });

  res.status(201).json({
    status: 'success',
    data: {
      booking: booking,
      ticket: ticket,
    },
  });
});

// Tạo một booking mới
export const createBookingByHour = catchAsync(async (req, res, next) => {
  const bookingData = await bookingService.createBookingByHour(req.body);
  // Tạo vé cho booking nếu khách thanh toán tại bãi
  if (bookingData.paymentMethod === 'pay-at-parking') {
    await createTicket({
      bookingId: bookingData._id,
      userId: bookingData.userId,
      parkingSlotId: bookingData.parkingSlotId,
      vehicleNumber: bookingData.vehicleNumber,
      ticketType: bookingData.bookingType === 'hour' ? 'hourly' : 'daily',
      startTime: bookingData.startTime,
      expiryDate: bookingData.endTime,
      paymentStatus: bookingData.paymentStatus,
    });
  }

  res.status(201).json({
    status: 'success',
    data: {
      booking: bookingData,
    },
  });
});

export const createBookingByDate = catchAsync(async (req, res, next) => {
  const bookingData = await bookingService.createBookingByDate(req.body);

  // Tạo vé cho booking nếu khách thanh toán tại bãi
  if (bookingData.paymentMethod === 'pay-at-parking') {
    await createTicket({
      bookingId: bookingData._id,
      userId: bookingData.userId,
      parkingSlotId: bookingData.parkingSlotId,
      vehicleNumber: bookingData.vehicleNumber,
      ticketType: bookingData.bookingType === 'hour' ? 'hourly' : 'daily',
      expiryDate: bookingData.endTime,
      paymentStatus: bookingData.paymentStatus,
    });
  }

  res.status(201).json({
    status: 'success',
    data: {
      booking: bookingData,
    },
  });
});

// Lấy tất cả bookings
export const getAllBookings = Factory.getAll(Booking);

// Lấy thông tin một booking theo ID
export const getBookingById = catchAsync(async (req, res, next) => {
  const booking = await bookingService.getBookingById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      booking,
    },
  });
});

// Hủy một booking
export const cancelBooking = catchAsync(async (req, res, next) => {
  const booking = await bookingService.cancelBooking(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      booking,
    },
  });
});

// checkin booking
export const checkinBooking = catchAsync(async (req, res, next) => {
  const booking = await bookingService.checkInBooking(req.params.id);
  return booking;
});

// checkout booking
export const checkoutBooking = catchAsync(async (req, res, next) => {
  const booking = await bookingService.checkOutBooking(req.params.id);
  return booking;
});

// Cập nhật thông tin một booking
export const updateBooking = Factory.updateOne(Booking);

// Xóa một booking
export const deleteBooking = Factory.deleteOne(Booking);
