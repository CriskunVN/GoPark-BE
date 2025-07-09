import ParkingLot from '../models/parkinglot.model.js';
import catchAsync from '../utils/catchAsync.js';
import * as Factory from './handlerFactory.controller.js';
import ParkingSlot from '../models/parkingSlot.model.js';
import * as ParkingLotService from '../services/parkinglot.service.js';

// get tất cả bãi đỗ xe
export const getAllParkingLots = Factory.getAll(ParkingLot);

// tạo bãi đỗ xe mới
export const createParkingLot = catchAsync(async (req, res, next) => {
  const newParkinglot = await ParkingLotService.createParkingLotWithSlots(
    req.body
  );

  res.status(201).json({
    status: 'success',
    messsage: 'Tạo bãi thành công',
    data: {
      data: newParkinglot,
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
