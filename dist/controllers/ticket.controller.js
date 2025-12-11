import Ticket from '../models/ticket.models.js';
import * as bookingService from '../services/booking.service.js';
import catchAsync from '../utils/catchAsync.js';
import * as ticketService from '../services/ticket.service.js';
import Booking from '../models/booking.model.js';
import ParkingSlot from '../models/parkingSlot.model.js';
import User from '../models/user.model.js';
// Hàm tạo một vé mới
export const createTicket = catchAsync(async (req, res) => {
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
// Hàm cập nhật vé theo ID
export const updateTicketById = catchAsync(async (ticketId, updateData) => { });
// Hàm xóa vé theo ID
export const deleteTicketById = catchAsync(async (ticketId) => { });
// Hàm hủy vé theo ID
// Hàm lấy vé theo trạng thái
export const getTicketsByStatus = catchAsync(async (status) => {
    return await Ticket.find({ status });
});
// Hàm lấy vé theo ID
export const getTicketbyId = catchAsync(async (req, res) => {
    const { ticketId } = req.params;
    const ticket = await Ticket.findById(ticketId);
    res.status(200).json({
        status: 'success',
        data: {
            ticket,
        },
    });
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
// Hàm lấy danh sách vé theo id bãi đỗ xe
export const getTicketsByParkingLotId = catchAsync(async (req, res) => {
    const { parkingLotId } = req.params;
    const { vehicleNumber, ticketType, status, date, keyword } = req.query;
    // 1. Tìm tất cả các ParkingSlot thuộc về parkingLotId
    const slots = await ParkingSlot.find({ parkingLot: parkingLotId }).select('_id');
    const slotIds = slots.map((slot) => slot._id);
    if (slotIds.length === 0) {
        return res.status(200).json({
            status: 'success',
            data: { tickets: [] },
        });
    }
    // 2. Tìm tất cả các Booking
    let bookingQuery = { parkingSlotId: { $in: slotIds } };
    // Lọc theo ngày (Overlap logic)
    if (date) {
        const queryDate = new Date(date);
        const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));
        bookingQuery = {
            ...bookingQuery,
            $or: [
                {
                    startTime: { $lte: endOfDay },
                    endTime: { $gte: startOfDay },
                },
            ],
        };
    }
    const bookings = await Booking.find(bookingQuery).select('_id');
    const bookingIds = bookings.map((booking) => booking._id);
    if (bookingIds.length === 0) {
        return res.status(200).json({
            status: 'success',
            data: { tickets: [] },
        });
    }
    // 3. Xây dựng Ticket Query
    let ticketQuery = { bookingId: { $in: bookingIds } };
    if (status) {
        ticketQuery.status = status;
    }
    if (ticketType) {
        ticketQuery.ticketType = ticketType;
    }
    // Tìm kiếm theo từ khóa (Biển số HOẶC Tên khách hàng HOẶC SĐT)
    if (keyword) {
        // 3a. Tìm User matches keyword
        const users = await User.find({
            $or: [
                { userName: { $regex: keyword, $options: 'i' } },
                { phoneNumber: { $regex: keyword, $options: 'i' } },
                { email: { $regex: keyword, $options: 'i' } },
            ],
        }).select('_id');
        const userIds = users.map((u) => u._id);
        // 3b. Query Ticket theo userId OR vehicleNumber
        ticketQuery = {
            ...ticketQuery,
            $or: [
                { vehicleNumber: { $regex: keyword, $options: 'i' } },
                { userId: { $in: userIds } },
            ],
        };
    }
    else if (vehicleNumber) {
        // Fallback nếu chỉ truyền vehicleNumber riêng lẻ
        ticketQuery.vehicleNumber = { $regex: vehicleNumber, $options: 'i' };
    }
    // 4. Tìm Ticket và populate thông tin
    const tickets = await Ticket.find(ticketQuery)
        .populate('userId', 'userName phoneNumber email')
        .populate({
        path: 'bookingId',
        select: 'startTime endTime parkingSlotId totalPrice',
        populate: { path: 'parkingSlotId', select: 'slotNumber zone' },
    });
    res.status(200).json({
        status: 'success',
        results: tickets.length,
        data: {
            tickets,
        },
    });
});
//# sourceMappingURL=ticket.controller.js.map