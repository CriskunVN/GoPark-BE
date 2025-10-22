import catchAsync from '../utils/catchAsync.js';
import * as bookingService from '../services/booking.service.js';
import Booking from '../models/booking.model.js';
import * as Factory from './handlerFactory.controller.js';
import * as ticketService from '../services/ticket.service.js';
import * as invoiceService from '../services/invoice.service.js';
// Tạo booking cho khách vãng lai
export const createBookingForGuest = catchAsync(async (req, res, next) => {
    const bookingData = await bookingService.createBookingForGuest(req.body);
    const ticket = await ticketService.createTicket({
        bookingId: bookingData._id,
        userId: bookingData.userId,
        parkingSlotId: bookingData.parkingSlotId,
        vehicleNumber: bookingData.vehicleNumber,
        ticketType: 'guest', // Loại vé cho khách vãng lai
        status: 'active', // Trạng thái vé khi tạo cho khách vãng lai
        startTime: bookingData.startTime,
        expiryDate: bookingData.endTime,
        paymentStatus: bookingData.paymentStatus,
    });
    res.status(201).json({
        status: 'success',
        data: {
            booking: bookingData,
            ticket: ticket,
        },
    });
});
export const createBookingOnline = catchAsync(async (req, res, next) => {
    try {
        const bookingData = await bookingService.createBooking(req.body);
        const bookingResult = await bookingService.handleBookingAfterCreate(bookingData);
        res.status(201).json({
            status: 'success',
            data: { booking: bookingData, ...bookingResult },
        });
    }
    catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
});
// Lấy tất cả bookings
export const getAllBookings = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find()
        .populate({
        path: 'userId',
        select: 'userName email phoneNumber',
    })
        .populate({
        path: 'parkingSlotId',
        select: 'slotNumber zone',
        populate: {
            path: 'parkingLot',
            select: 'name address image',
        },
    })
        .sort({ createdAt: -1 });
    res.status(200).json({
        status: 'success',
        results: bookings.length,
        data: bookings,
    });
});
// Lấy bookings của user hiện tại
export const getMyBookings = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({ userId: req.user.id })
        .populate({
        path: 'parkingSlotId',
        select: 'slotNumber zone',
        populate: {
            path: 'parkingLot',
            select: 'name address image',
        },
    })
        .sort({ createdAt: -1 });
    res.status(200).json({
        status: 'success',
        results: bookings.length,
        data: bookings,
    });
});
// Keep the existing factory export as backup
export const getAllBookingsFactory = Factory.getAll(Booking);
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
export const checkinBooking = catchAsync(async (bookingId) => {
    const booking = await bookingService.getBookingById(bookingId);
    if (booking.paymentStatus !== 'paid') {
        throw new AppError('Payment required before check-in', 400);
    }
    const updateBooking = await bookingService.checkInBooking(bookingId);
    return updateBooking;
});
// checkout booking
export const checkoutBooking = catchAsync(async (bookingId) => {
    const booking = await bookingService.checkOutBooking(bookingId);
    return booking;
});
// Cập nhật thông tin một booking
export const updateBooking = Factory.updateOne(Booking);
// Xóa một booking
export const deleteBooking = Factory.deleteOne(Booking);
// Thanh toán tại bãi
export const payAtParking = catchAsync(async (req, res, next) => {
    const booking = await bookingService.getBookingById(req.params.id);
    if (!booking)
        throw new AppError('Booking not found', 404);
    // Cập nhật trạng thái thanh toán
    booking.paymentStatus = 'paid';
    await booking.save();
    // tạo hóa đơn
    const invoice = await invoiceService.createInvoice({
        bookingId: booking._id,
        invoiceNumber: `INV-${Date.now()}`,
        userId: booking.userId,
        amount: booking.totalPrice,
        paymentMethod: 'cash',
        status: 'paid', // Trạng thái hóa đơn ban đầu
        transactionId: `TXN-${Date.now()}`, // Mã giao dịch duy nhất
    });
    res.status(200).json({
        status: 'success',
        data: { booking },
    });
});
// // Callback sau khi thanh toán thành công
// export const paymentCallback = catchAsync(async (req, res, next) => {
//   const booking = await bookingService.getBookingById(req.params.id);
//   if (!booking) throw new AppError('Booking not found', 404);
//   // Cập nhật trạng thái thanh toán
//   booking.paymentStatus = 'paid';
//   await booking.save();
//   // Nếu là thanh toán trước (prepaid), sinh ticket sau khi thanh toán
//   if (
//     booking.paymentMethod === 'prepaid' ||
//     booking.paymentMethod === 'pay-at-parking'
//   ) {
//     const ticket = await createTicket({
//       bookingId: booking._id,
//       userId: booking.userId,
//       parkingSlotId: booking.parkingSlotId,
//       vehicleNumber: booking.vehicleNumber,
//       ticketType: booking.bookingType,
//       startTime: booking.startTime,
//       expiryDate: booking.endTime,
//       paymentStatus: booking.paymentStatus,
//     });
//     return res.status(200).json({
//       status: 'success',
//       data: { booking, ticket },
//     });
//   }
//   // Nếu không cần sinh ticket, chỉ trả về booking
//   res.status(200).json({
//     status: 'success',
//     data: { booking },
//   });
// });
//# sourceMappingURL=booking.controller.js.map