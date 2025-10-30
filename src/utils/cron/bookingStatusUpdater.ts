import cron from 'node-cron';
import Booking from '../../models/booking.model.js';
import ParkingSlot from '../../models/parkingSlot.model.js';

// CRON
cron.schedule('*/2 * * * *', async () => {
  try {
    console.log('[CRON] Running booking status update...');
    const result = await updateSlotStatusToBooked();
    if (result.updatedCount > 0) {
      console.log(
        `[CRON] Updated ${result.updatedCount} bookings to 'booked' status.`
      );
    }
  } catch (err) {
    console.error('[CRON] Error updating booking status:', err);
  }
});

// Hàm cập nhật status slot sang 'booked' khi đến startTime của booking
const updateSlotStatusToBooked = async () => {
  const now = new Date();
  // Tìm các booking có startTime <= hiện tại và status là 'pending'
  const checkinBookings = await Booking.find({
    status: { $in: ['pending'] },
    startTime: { $lte: now },
  });

  let updatedCount = 0;
  for (const booking of checkinBookings) {
    // Cập nhật status của booking thành 'checked-in'
    booking.status = 'confirmed';
    await booking.save();

    // Cập nhật status của slot thành 'booked'
    // Nếu parkingSlotId là mảng, lặp qua từng slot
    const slotIds = Array.isArray(booking.parkingSlotId)
      ? booking.parkingSlotId
      : [booking.parkingSlotId];
    for (const slotId of slotIds) {
      const res = await ParkingSlot.findByIdAndUpdate(slotId, {
        status: 'booked',
      });
      if (res) updatedCount++;
    }
  }
  return { updatedCount };
};
