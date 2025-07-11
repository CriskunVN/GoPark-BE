import cron from 'node-cron';
import ParkingSlot from '../models/parkingSlot.model.js';

// 5p quét 1 lần
// cron.schedule('*/5 * * * *', async () => {
cron.schedule('* * * * *', async () => {
  const now = new Date();
  const expiredSlots = await ParkingSlot.updateMany(
    { expiresAt: { $ne: null, $lt: now } },
    { $set: { status: 'Trống', expiresAt: null } }
  );
  console.log(`[CRON] Đã làm trống ${expiredSlots.modifiedCount} slot hết hạn`);
});
