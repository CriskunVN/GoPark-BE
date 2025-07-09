import catchAsync from '../utils/catchAsync.js';
import * as bookingService from '../services/booking.service.js';
import Booking from '../models/booking.model.js'
import * as Factory from './handlerFactory.controller.js'

// Tạo một booking mới
export const createBooking =  catchAsync(async (req, res, next) => {

    const bookingData = await bookingService.createBooking(req.body)    
    
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
export const getBookingById = Factory.getOne(Booking);

// Cập nhật thông tin một booking
export const updateBooking = Factory.updateOne(Booking);

// Xóa một booking
export const deleteBooking = Factory.deleteOne(Booking);
