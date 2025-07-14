import Ticket from '../models/ticket.models.js';
import AppError from '../utils/appError.js';
import * as bookingService from './booking.service.js';

export const checkInTicket = async (ticketId) => {
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) throw new AppError('Ticket not found', 404);
  // nếu vé đặt theo giờ hoặc ngày thì checkin để cập nhật status vé vì
  if (ticket.ticketType === 'guest') {
    if (ticket.status !== 'pending')
      throw new AppError('Ticket has already been checked in', 400);
  }

  ticket.status = 'active'; // hoặc 'checked-in'
  ticket.checkInTime = new Date(); // nếu có trường này
  // lưu vào db lịch sử  checkin => làm sau

  await ticket.save();
  await bookingService.checkInBooking(ticket.bookingId); // Cập nhật trạng thái booking nếu cần

  return ticket;
};

export const checkOutTicket = async (ticketId) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw new AppError('Ticket not found', 404);

  // Kiểm tra checkout vé khách vãng lai
  if (ticket.ticketType === 'guest') {
    if (ticket.status !== 'active') {
      if (ticket.status !== 'pending') {
        throw new AppError('Ticket has already been checked out', 400);
      }
      throw new AppError('Ticket is not active', 400);
    }
    // Cập nhật trạng thái vé khách vãng lai
    ticket.status = 'used'; // hoặc 'checked-out'
    // Cập nhật trạng thái booking cho khách vàng lai vì khách
    await bookingService.checkOutBookingForGuest(ticket.bookingId);
  }

  // Cập nhật trạng thái vé và thời gian checkout
  ticket.checkoutTime = new Date(); // nếu có trường này
  await ticket.save();

  // lưu vào db lịch sử checkout => làm sau

  return ticket;
};
