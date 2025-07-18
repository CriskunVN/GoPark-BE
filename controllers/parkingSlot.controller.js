import * as Factory from './handlerFactory.controller.js';
import ParkingSlot from '../models/parkingSlot.model.js';
import catchAsync from '../utils/catchAsync.js';
import * as ParkingSlotService from '../services/parkingSlot.service.js';

// Lấy toàn bộ slot trong Bãi đỗ có thể lọc theo trạng thái "Trống , Đã Đặt , Đặt Trước"
export const getAllParkingSlots = Factory.getAll(ParkingSlot);

// Tạo slot mới
export const createParkingSlot = catchAsync(async (req, res, next) => {
  const prepared = await ParkingSlotService.prepareParkingSlotData(req.body);
  const doc = await ParkingSlot.create(prepared);

  res.status(201).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});

// Get one slot
export const getParkingSlot = Factory.getOne(ParkingSlot);

// Xóa 1 slot
export const deleteParkingSlot = catchAsync(async (req, res, next) => {
  await ParkingSlotService.deleteSlotAndSyncZone(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Update 1 slot
export const updateParkingSlot = Factory.updateOne(ParkingSlot);

// lấy các slot theo ngày
export const getSlotsAvailableByDate = catchAsync(async (req, res, next) => {
  const { startTime, endTime } = req.query;
  const { parkingLotId } = req.params;

  if (!startTime || !endTime) {
    return res.status(400).json({ message: 'Missing date query' });
  }

  const availableSlots = await ParkingSlotService.getSlotsAvailable(
    startTime,
    endTime,
    parkingLotId
  );

  res.status(200).json({
    status: 'success',
    results: availableSlots.length,
    data: availableSlots,
  });
});
