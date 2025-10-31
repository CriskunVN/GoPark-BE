import Ticket from '../models/ticket.models.js';
import * as bookingService from '../services/booking.service.js';
import catchAsync from '../utils/catchAsync.js';
import * as ticketService from '../services/ticket.service.js';
// Hàm tạo một vé mới
export const createTicket = catchAsync(async (bookingData) => {
    const ticket = await ticketService.createTicket(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            ticket,
        },
    });
});
// Hàm lấy tất cả vé
export const getAllTickets = catchAsync(async () => { });
// Hàm lấy vé theo ID
export const getTicketById = catchAsync(async (ticketId) => { });
// Hàm cập nhật vé theo ID
export const updateTicketById = catchAsync(async (ticketId, updateData) => { });
// Hàm xóa vé theo ID
export const deleteTicketById = catchAsync(async (ticketId) => { });
// Hàm hủy vé theo ID
// Hàm lấy vé theo trạng thái
export const getTicketsByStatus = catchAsync(async (status) => {
    return await Ticket.find({ status });
});
// Hàm lấy vé theo người dùng
export const getTicketsByUserId = catchAsync(async (userId) => {
    return await Ticket.find({ userId });
});
// checkin booking
export const checkin = catchAsync(async (req, res, next) => {
    const { ticketId } = req.params;
    const ticket = await Ticket.findById(ticketId);
    const updateBooking = await ticketService.checkInBooking(ticket.bookingId);
    return res.status(200).json({
        status: 'success',
        data: { booking: updateBooking },
    });
});
// checkout booking
export const checkout = catchAsync(async (req, res, next) => {
    const { ticketId } = req.params;
    const ticket = await Ticket.findById(ticketId);
    const updateBooking = await ticketService.checkOutBooking(ticket.bookingId);
    return res.status(200).json({
        status: 'success',
        data: { booking: updateBooking },
    });
});
//# sourceMappingURL=ticket.controller.js.map