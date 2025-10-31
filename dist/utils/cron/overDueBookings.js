import cron from 'node-cron';
import Booking from '../../models/booking.model.js';
import ParkingSlot from '../../models/parkingSlot.model.js';
import Ticket from '../../models/ticket.models.js';
// Chạy mỗi 2 phút
cron.schedule('*/2 * * * *', async () => {
    const now = new Date();
    const timeExp = 15 * 60 * 1000; // Lấy thời gian hiện tại trừ đi 15 phút
    // Tìm các booking đã hết hạn (endTime + 15p < hiện tại) và có trạng thái 'check-in'
    const overDueBookings = await Booking.find({
        endTime: { $lte: now.getTime() - timeExp },
        status: { $in: ['check-in'] },
    });
    let cleanedCount = 0;
    for (const booking of overDueBookings) {
        // Cập nhật trạng thái booking thành over-due
        await Booking.findByIdAndUpdate(booking._id, { status: 'over-due' });
        // Cập nhật trạng thái slot thành 'Trống'
        const slotId = booking.parkingSlotId;
        await ParkingSlot.findByIdAndUpdate(slotId, { status: 'available' });
        cleanedCount++;
        // Cập nhật trạng thái ticket thành 'used'
        await Ticket.updateOne({
            bookingId: booking._id,
            status: { $in: ['active'] },
        }, { status: 'used' });
    }
    console.log(`[CRON] Cleaned ${cleanedCount} slot from booking exprired`);
    cleanedCount = 0; // Reset count for next run
});
//# sourceMappingURL=overDueBookings.js.map