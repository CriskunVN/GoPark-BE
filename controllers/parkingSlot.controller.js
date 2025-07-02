import * as Factory from './handlerFactory.controller.js';
import ParkingSlot from '../models/parkingSlot.model.js';

// Lấy toàn bộ slot trong Bãi đỗ có thể lọc theo trạng thái "Trống , Đã Đặt , Đặt Trước"
export const getAllParkingSlots = Factory.getAll(ParkingSlot);

// Tạo slot mới
export const createParkingSlot = Factory.createOne(ParkingSlot);
