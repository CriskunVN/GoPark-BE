import catchAsync from '../utils/catchAsync.js';
import * as bookingService from '../services/booking.service.js';
import Booking from '../models/booking.model.js'
import * as Factory from './handlerFactory.controller.js'

// Tạo một booking mới
export const createBookingByHour =  catchAsync(async (req, res, next) => {

    const bookingData = await bookingService.createBookingByHour(req.body)    
    
    res.status(201).json({
        status: 'success',
        data: {
            booking: bookingData,
        },
    });
 });

export const createBookingByDate =  catchAsync(async (req, res, next) => { 
    const bookingData = await bookingService.createBookingByDate(req.body)    
    
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
    res.status(200).json({
        status: 'success',
        data: {
            booking,
        },
    });
 });

// checkout booking
export const checkoutBooking = catchAsync(async (req, res, next) => {
    const booking = await bookingService.checkOutBooking(req.params.id);
    res.status(200).json({
        status: 'success',
        data: {
            booking,
        },
    });
});
// Cập nhật thông tin một booking
export const updateBooking = Factory.updateOne(Booking);

// Xóa một booking
export const deleteBooking = Factory.deleteOne(Booking);
