import ParkingSlot from '../models/parkingSlot.model.js';
import ParkingLot from '../models/parkinglot.model.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import Booking from '../models/booking.model.js';

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

  const activeBookings = await Booking.find({
      parkingSlotId: slot._id,
      status: { $nin: ['cancelled', 'completed'] }, // lấy booking chưa hủy hoặc hoàn thành
    });
  
    if (activeBookings.length > 0) {
      throw new AppError(
          `Không thể xóa slot này. Còn ${activeBookings.length} booking đang hoạt động`,
          400
        );
    }

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

// Lấy tất cả slot còn trống trong khoảng thời gian nhất định
export const getSlotsAvailable = async (startTime, endTime, parkingLotId) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new AppError('Thời gian không hợp lệ', 400);
  }

  // 1. Lấy tất cả slot thuộc bãi đỗ
  const allSlots = await ParkingSlot.find({ parkingLot: parkingLotId });

  // 1.1 Lấy ID của tất cả slot
  const allSlotIds = allSlots.map((slot) => slot._id);

  // 2. Tìm booking giao nhau với khoảng thời gian này
  const activeBookings = await Booking.find({
    parkingSlotId: { $in: allSlotIds },
    startTime: { $lt: end },
    endTime: { $gt: start },
    status: { $in: ['pending', 'confirmed'] },
  }).select('parkingSlotId');

  // Lấy danh sách ID của các slot đã giao nhau với khoảng thời gian query
  const occupiedSlotIds = activeBookings.map((b) => b.parkingSlotId.toString());

  // 3. Trả lại slot chưa bị giao nhau
  const availableSlots = allSlots.filter(
    (slot) => !occupiedSlotIds.includes(slot._id.toString())
  );

  return availableSlots;
};

export const getBookedSlotsForOwner = async (time, parkingLotId) => {
  const timeCheck = new Date(time);
  if (isNaN(timeCheck.getTime())) {
    throw new AppError('Thời gian không hợp lệ', 400);
  }

  // 1. Lấy tất cả slot thuộc bãi đỗ
  const allSlots = await ParkingSlot.find({ parkingLot: parkingLotId });

  // 1.1 Lấy ID của tất cả slot
  const allSlotIds = allSlots.map((slot) => slot._id);

  // 2. Tìm booking giao nhau với khoảng thời gian này
  const activeBookings = await Booking.find({
    parkingSlotId: { $in: allSlotIds },
    startTime: { $lt: timeCheck },
    endTime: { $gt: timeCheck },
    status: { $in: ['pending', 'confirmed'] },
  }).select('parkingSlotId');

  // Lấy danh sách ID của các slot đã giao nhau với khoảng thời gian query
  const occupiedSlotIds = activeBookings.map((b) => b.parkingSlotId.toString());

  // 3. Trả lại slot chưa bị giao nhau
  const bookedSlots = allSlots.filter((slot) =>
    occupiedSlotIds.includes(slot._id.toString())
  );

  return bookedSlots;
};

export const getAvailableSlotsForOwner = async (time, parkingLotId) => {
  const timeCheck = new Date(time);
  if (isNaN(timeCheck.getTime())) {
    throw new AppError('Thời gian không hợp lệ', 400);
  }

  // 1. Lấy tất cả slot thuộc bãi đỗ
  const allSlots = await ParkingSlot.find({ parkingLot: parkingLotId });

  // 1.1 Lấy ID của tất cả slot
  const allSlotIds = allSlots.map((slot) => slot._id);

  // 2. Tìm booking giao nhau với khoảng thời gian này
  const activeBookings = await Booking.find({
    parkingSlotId: { $in: allSlotIds },
    startTime: { $lt: timeCheck },
    endTime: { $gt: timeCheck },
    status: { $in: ['pending', 'confirmed'] },
  }).select('parkingSlotId');

  // Lấy danh sách ID của các slot đã giao nhau với khoảng thời gian query
  const occupiedSlotIds = activeBookings.map((b) => b.parkingSlotId.toString());

  // 3. Trả lại slot chưa bị giao nhau
  const availableSlots = allSlots.filter(
    (slot) => !occupiedSlotIds.includes(slot._id.toString())
  );

  return availableSlots;
};
