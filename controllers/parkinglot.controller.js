import ParkingLot from '../models/parkinglot.model.js';
import catchAsync from '../utils/catchAsync.js';
import * as Factory from './handlerFactory.controller.js';
import ParkingSlot from '../models/parkingSlot.model.js';

// get tất cả bãi đỗ xe
export const getAllParkingLots = Factory.getAll(ParkingLot);

// tạo bãi đỗ xe mới
export const createParkingLotWithSlots = catchAsync(async (req, res, next) => {
  const { name, zones, location } = req.body;

  if (!name || !zones || !Array.isArray(zones) || zones.length === 0) {
    return res
      .status(400)
      .json({ message: 'Thiếu name hoặc zones không hợp lệ' });
  }

  // Validate location

  const [lng, lat] = location.coordinates;
  if (
    typeof lng !== 'number' ||
    typeof lat !== 'number' ||
    lng < -180 ||
    lng > 180 ||
    lat < -90 ||
    lat > 90
  ) {
    return res.status(400).json({
      status: 'fail',
      message: 'Tọa độ location không hợp lệ (lng: -180~180, lat: -90~90)',
    });
  }

  // Tạo bãi đỗ xe mới
  const newLot = await ParkingLot.create(req.body);

  // Tạo các slot dựa trên zones
  let slotsToCreate = [];

  zones.forEach((zoneInfo) => {
    const { zone, count } = zoneInfo;
    for (let i = 1; i <= count; i++) {
      slotsToCreate.push({
        parkingLot: newLot._id,
        slotNumber: `${zone}${i}`,
        status: 'Trống',
        expiresAt: null,
      });
    }
  });

  const createdSlots = await ParkingSlot.insertMany(slotsToCreate);

  res.status(201).json({
    message: `${newLot.name} đã được tạo với ${createdSlots.length} slot.`,
    data: {
      parkingLot: newLot,
      slots: createdSlots,
    },
  });
});

// get bãi đỗ bằng id
export const getParkingLot = Factory.getOne(ParkingLot);

// update bãi đỗ theo id
export const updateParkingLot = Factory.updateOne(ParkingLot);

// delete bãi đỗ theo id
export const deleteParkingLot = Factory.deleteOne(ParkingLot);

// xóa mềm bãi đỗ
export const softDeleteParkingLot = Factory.softDeleteOne(ParkingLot);
