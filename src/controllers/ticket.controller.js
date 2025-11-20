import Ticket from '../models/ticket.models.js';
import * as bookingService from '../services/booking.service.js';
import catchAsync from '../utils/catchAsync.js';
import * as ticketService from '../services/ticket.service.js';

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
export const getAllTickets = catchAsync(async (req, res) => {
  const tickets = await Ticket.find();
  res.status(200).json({ status: 'success', data: { tickets } });
});

// Hàm lấy vé theo ID
export const getTicketById = catchAsync(async (req, res) => {
  const { ticketId } = req.params;
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    return res
      .status(404)
      .json({ status: 'fail', message: 'Ticket not found' });
  }

  res.status(200).json({ status: 'success', data: { ticket } });
});

// checkin booking
export const checkin = catchAsync(async (req, res) => {
  const { ticketId } = req.params;
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    return res
      .status(404)
      .json({ status: 'fail', message: 'Ticket not found' });
  }

  const updateBooking = await ticketService.checkInBooking(ticket.bookingId);

  res.status(200).json({
    status: 'success',
    data: { booking: updateBooking },
  });
});

// checkout booking
export const checkout = catchAsync(async (req, res) => {
  const { ticketId } = req.params;
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    return res
      .status(404)
      .json({ status: 'fail', message: 'Ticket not found' });
  }

  const updateBooking = await ticketService.checkOutBooking(ticket.bookingId);

  res.status(200).json({
    status: 'success',
    data: { booking: updateBooking },
  });
});
