import Ticket from '../models/ticket.models.js';
import * as bookingService from '../services/booking.service.js';
import catchAsync from '../utils/catchAsync.js';

// Hàm tạo một vé mới
export const createTicket = catchAsync(async (bookingData) => {
  const ticket = await Ticket.create(bookingData);
  return ticket;
});

// Hàm lấy tất cả vé
export const getAllTickets = catchAsync(async () => {});

// Hàm lấy vé theo ID
export const getTicketById = catchAsync(async (ticketId) => {});

// Hàm cập nhật vé theo ID
export const updateTicketById = catchAsync(async (ticketId, updateData) => {});

// Hàm xóa vé theo ID
export const deleteTicketById = catchAsync(async (ticketId) => {});

// Hàm hủy vé theo ID

// Hàm lấy vé theo trạng thái
export const getTicketsByStatus = catchAsync(async (status) => {
  return await Ticket.find({ status });
});

// Hàm lấy vé theo người dùng
export const getTicketsByUserId = catchAsync(async (userId) => {
  return await Ticket.find({ userId });
});

// Checkin ticket
export const checkinTicket = catchAsync(async (ticketId) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw new AppError('Ticket not found', 404);
  if (ticket.status !== 'pending')
    throw new AppError('Ticket has already been checked in', 400);

  ticket.status = 'active'; // hoặc 'checked-in'
  ticket.checkInTime = new Date(); // nếu có trường này
  await ticket.save();

  await bookingService.checkInBooking(ticket.bookingId); // Cập nhật trạng thái booking nếu cần

  res.status(200).json({
    status: 'success',
    data: {
      ticket,
    },
  });
});

// Checkout ticket
export const checkoutTicket = catchAsync(async (ticketId) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw new AppError('Ticket not found', 404);
  if (ticket.status !== 'active') {
    if (ticket.status !== 'pending') {
      throw new AppError('Ticket has already been checked out', 400);
    }
    throw new AppError('Ticket is not active', 400);
  }
  // Cập nhật trạng thái vé và thời gian checkout
  ticket.checkoutTime = new Date(); // nếu có trường này
  ticket.status = 'used'; // hoặc 'checked-out'
  ticket.checkoutTime = new Date(); // nếu có trường này
  await ticket.save();

  await bookingService.checkOutBooking(ticket.bookingId); // Cập nhật trạng thái booking nếu cần
  res.status(200).json({
    status: 'success',
    data: {
      ticket,
    },
  });
});
