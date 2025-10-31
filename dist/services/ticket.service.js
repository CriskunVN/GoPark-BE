import Ticket from '../models/ticket.models.js';
import AppError from '../utils/appError.js';
import Booking from '../models/booking.model.js';
import * as fee from '../services/fee.service.js';
import * as bookingService from '../services/booking.service.js';
// Check-in
export const checkInBooking = async (id) => {
    // Lấy booking và cập nhật trạng thái
    const booking = await Booking.findByIdAndUpdate(id, { status: 'check-in' }, { new: true });
    if (!booking)
        throw new AppError('Không tìm thấy booking', 404);
    if (booking.paymentStatus !== 'paid') {
        throw new AppError('Yêu cầu thanh toán trước khi check-in', 400);
    }
    // Cập nhật ticket checkinTime
    await Ticket.findOneAndUpdate({ bookingId: booking._id }, { checkInTime: new Date() }, { new: true });
    return booking;
};
// Check-out
export const checkOutBooking = async (id) => {
    const booking = await bookingService.getBookingById(id);
    if (!booking)
        throw new AppError('Không tìm thấy booking', 404);
    // check nếu booking đã quá hạn
    if (booking.status === 'over-due') {
        // Tính phí phát sinh
        const now = new Date();
        // Thời gian kết thúc với 15 phút
        const endTimeWithGrace = new Date(booking.endTime).getTime() + 15 * 60 * 1000;
        // Tính số phút quá hạn
        const overtimeMinutes = Math.ceil((now.getTime() - endTimeWithGrace) / 60000);
        const overtimeFee = fee.calculateOverdueFee(overtimeMinutes);
        // Cập nhật booking
        booking.overDueInfo = {
            overDueStart: endTimeWithGrace,
            overDueEnd: now,
            overDueMinutes: overtimeMinutes,
            overDueFee: overtimeFee,
        };
        await booking.save();
        // Cập nhật ticket checkinTime
        await Ticket.findOneAndUpdate({ bookingId: booking._id }, {
            checkoutTime: now,
        }, { new: true });
        // TODO : Lưu lịch sử vào ParkingHistory
        // await ParkingHistory.create({
        //   bookingId: booking._id,
        //   slotId: booking.parkingSlotId,
        //   userId: booking.userId,
        //   ownerId: slot.ownerId,
        //   type: 'checkout',
        //   timestamp: now,
        //   durationMinutes: overtimeMinutes,
        //   fee: booking.totalAmount,
        //   method: 'manual',
        // });
    }
    return booking;
};
export const createTicket = async (ticketData) => {
    const ticket = await Ticket.create(ticketData);
    return ticket;
};
//# sourceMappingURL=ticket.service.js.map