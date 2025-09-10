import cron from 'node-cron';
import Booking from '../../models/booking.model.js';
import ParkingSlot from '../../models/parkingSlot.model.js';
import Ticket from '../../models/ticket.models.js';

// Chạy mỗi 2 phút
cron.schedule('*/60 * * * *', async () => {
  const now = new Date();

  // Tìm các booking đã hết hạn (endTime < hiện tại) và chưa cancelled
  const expiredBookings = await Booking.find({
    endTime: { $lt: now },
    status: { $nin: ['completed', 'cancelled'] },
  });

  let cleanedCount = 0;
  for (const booking of expiredBookings) {
    // Cập nhật trạng thái booking thành completed
    await Booking.findByIdAndUpdate(booking._id, { status: 'completed' });

    // Cập nhật trạng thái slot thành 'Trống'
    const slotId = booking.parkingSlotId;
    await ParkingSlot.findByIdAndUpdate(slotId, { status: 'available' });
    cleanedCount++;

    // Cập nhật trạng thái ticket thành 'used'
    await Ticket.updateOne(
      {
        bookingId: booking._id,
        $or: [{ status: 'active' }, { status: 'pending' }],
      },
      { status: 'used' }
    );
  }

  console.log(`[CRON] Cleaned ${cleanedCount} slot from booking exprired`);
  cleanedCount = 0; // Reset count for next run
});
