import Booking from '../models/booking.model.js';
import ParkingSlot from '../models/parkingSlot.model.js';
import User from '../models/user.model.js';
import catchAsync from '../utils/catchAsync.js';
import * as bookingService from '../services/booking.service.js';

// Tạo một booking mới
export const createBooking =  catchAsync(async (req, res, next) => {

    const bookingData = bookingService.createBooking(req.body)    
    
    res.status(201).json({
        status: 'success',
        data: {
            booking: bookingData,
        },
    });
 });