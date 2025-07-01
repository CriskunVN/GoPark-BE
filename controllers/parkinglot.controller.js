import ParkingLot from '../models/parkinglot.model.js';
import * as Factory from './handlerFactory.controller.js';

// get tất cả bãi đỗ xe
export const getAllParkingLots = Factory.getAll(ParkingLot);

// tạo bãi đỗ xe mới
export const createParkingLot = Factory.createOne(ParkingLot);

// get bãi đỗ bằng id
export const getParkingLot = Factory.getOne(ParkingLot);

// update bãi đỗ theo id
export const updateParkingLot = Factory.updateOne(ParkingLot);

// delete bãi đỗ theo id
export const deleteParkingLot = Factory.deleteOne(ParkingLot);

// xóa mềm bãi đỗ
export const softDeleteParkingLot = Factory.softDeleteOne(ParkingLot);
