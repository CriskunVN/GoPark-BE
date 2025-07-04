import ParkingSlot from '../models/parkingSlot.model.js';
import ParkingLot from '../models/parkinglot.model.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

// thêm slot và đồng bộ trong parkingLot
export const prepareParkingSlotData = async (data) => {
  const { parkingLot, zone } = data;

  if (!parkingLot || !zone) {
    throw new AppError('Thiếu parkingLot hoặc zone khi tạo slot', 400);
  }

  // Sinh slotNumber nếu chưa có
  if (!data.slotNumber) {
    const count = await ParkingSlot.countDocuments({ parkingLot, zone });
    data.slotNumber = `${zone}${count + 1}`;
  }

  // Tách số thứ tự từ slotNumber, ví dụ: A5 => 5
  const match = /\d+$/.exec(data.slotNumber);
  if (!match) {
    throw new AppError('slotNumber không đúng định dạng (VD: A1, B3)', 400);
  }

  const slotNum = parseInt(match[0], 10);

  // Đồng bộ zones trong ParkingLot
  const lot = await ParkingLot.findById(parkingLot);
  if (!lot) {
    throw new AppError('Không tìm thấy bãi đỗ xe', 404);
  }

  const zones = lot.zones || [];
  const zoneIdx = zones.findIndex((z) => z.zone === zone);

  if (zoneIdx !== -1) {
    if (zones[zoneIdx].count < slotNum) {
      zones[zoneIdx].count = slotNum;
    }
  } else {
    zones.push({ zone, count: slotNum });
  }

  // Cập nhật ParkingLot nếu có thay đổi
  await ParkingLot.findByIdAndUpdate(parkingLot, { zones });

  return data;
};

// Xóa slot cuối và đồng bộ ParkingLot
export const deleteSlotAndSyncZone = async (slotId) => {
  const slot = await ParkingSlot.findById(slotId);
  if (!slot) throw new AppError('Slot không tồn tại', 404);

  const { parkingLot, zone } = slot;

  // Xóa slot
  await ParkingSlot.findByIdAndDelete(slotId);

  // Lấy lại tất cả các slot còn lại trong zone
  const remainingSlots = await ParkingSlot.find({ parkingLot, zone });

  let newCount = 0;
  if (remainingSlots.length > 0) {
    // Tìm số lớn nhất trong slotNumber, ví dụ: A5 → 5
    newCount = remainingSlots.length;
  }

  // Cập nhật lại ParkingLot
  const lot = await ParkingLot.findById(parkingLot);
  if (lot) {
    const zones = lot.zones || [];
    const zoneIdx = zones.findIndex((z) => z.zone === zone);

    if (zoneIdx !== -1) {
      zones[zoneIdx].count = newCount;

      await ParkingLot.findByIdAndUpdate(parkingLot, { zones });
    }
  }
};
