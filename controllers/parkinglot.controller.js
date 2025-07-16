import ParkingLot from '../models/parkinglot.model.js';
import ParkingSlot from '../models/parkingSlot.model.js'; // Thêm import này
import catchAsync from '../utils/catchAsync.js';
import * as parkinglotService from '../services/parkinglot.service.js';
import AppError from '../utils/appError.js';

// [GET] Lấy tất cả bãi đỗ thuộc về chủ bãi hiện tại
export const getMyParkingLots = catchAsync(async (req, res, next) => {
  console.log('📤 [GET] /api/v1/parkinglots/my-parkinglots');
  console.log('👉 req.user.id:', req.user?.id);

  const parkingLots = await ParkingLot.find({ parkingOwner: req.user.id });

  res.status(200).json({
    status: 'success',
    results: parkingLots.length,
    data: parkingLots,
  });
});

// [POST] Tạo bãi đỗ mới
export const createParkingLot = catchAsync(async (req, res, next) => {
  const defaultLocation = {
    type: 'Point',
    coordinates: [105.854444, 21.028511], // Hà Nội
  };

  const location =
    req.body.location?.coordinates?.length === 2 &&
    typeof req.body.location.coordinates[0] === 'number' &&
    typeof req.body.location.coordinates[1] === 'number'
      ? req.body.location
      : defaultLocation;

  const parkingLot = await parkinglotService.createParkingLotWithSlots({
    ...req.body,
    parkingOwner: req.user.id,
    location,
  });

  res.status(201).json({
    status: 'success',
    message: 'Tạo bãi đỗ xe thành công',
    data: parkingLot,
  });
});

// [GET] Lấy bãi đỗ theo ID
export const getParkingLotById = catchAsync(async (req, res, next) => {
  const query = req.path.includes('/public')
    ? { _id: req.params.id }
    : { _id: req.params.id, parkingOwner: req.user.id };

  const lot = await ParkingLot.findOne(query);

  if (!lot) {
    return next(new AppError('Không tìm thấy bãi đỗ xe', 404));
  }

  res.status(200).json({
    status: 'success',
    data: lot,
  });
});

// [PATCH] Cập nhật bãi đỗ
export const updateParkingLot = catchAsync(async (req, res, next) => {
  try {
    const updatedLot = await ParkingLot.findOneAndUpdate(
      { _id: req.params.id, parkingOwner: req.user.id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedLot) {
      return next(new AppError('Không tìm thấy bãi đỗ xe của bạn', 404));
    }

    console.log('✅ Updated:', updatedLot);

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật thành công',
      data: updatedLot,
    });
  } catch (error) {
    return next(new AppError('Lỗi khi cập nhật bãi đỗ', 500));
  }
});

// [DELETE] Xóa vĩnh viễn
export const deleteParkingLot = catchAsync(async (req, res, next) => {
  const deletedLot = await ParkingLot.findOneAndDelete({
    _id: req.params.id,
    parkingOwner: req.user.id,
  });

  if (!deletedLot) {
    return next(new AppError('Không tìm thấy bãi đỗ xe của bạn', 404));
  }

  // Xóa tất cả slot thuộc về bãi đỗ vừa xóa
  await ParkingSlot.deleteMany({ parkingLot: req.params.id });

  res.status(204).json({
    status: 'success',
    message: 'Đã xóa vĩnh viễn bãi đỗ',
    data: null,
  });
});

// [PATCH] Xóa mềm (isActive = false)
export const softDeleteParkingLot = catchAsync(async (req, res, next) => {
  const updatedLot = await ParkingLot.findOneAndUpdate(
    { _id: req.params.id, parkingOwner: req.user.id },
    { isActive: false },
    { new: true }
  );

  if (!updatedLot) {
    return next(new AppError('Không tìm thấy bãi đỗ xe của bạn', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Đã xóa mềm bãi đỗ',
    data: updatedLot,
  });
});

// [GET] Lấy tất cả bãi đỗ theo thành phố (công khai)
export const getParkingLotsByCity = catchAsync(async (req, res, next) => {
  console.log('📤 [GET] /api/v1/parkinglots/city/:city');
  console.log('👉 req.params.city:', req.params.city);

  const parkingLots = await ParkingLot.find({
    address: { $regex: req.params.city, $options: 'i' },
    isActive: true,
  });

  res.status(200).json({
    status: 'success',
    results: parkingLots.length,
    data: parkingLots,
  });
});

// [GET] Lấy tất cả vị trí đỗ theo bãi đỗ (công khai)
export const getAllParkingSlotsByLotId = catchAsync(async (req, res, next) => {
  console.log('📤 [GET] /api/v1/parkinglots/:parkingLotId/slots');
  console.log('👉 req.params.parkingLotId:', req.params.parkingLotId);

  const parkingLot = await ParkingLot.findById(req.params.parkingLotId);
  if (!parkingLot) {
    return next(new AppError('Không tìm thấy bãi đỗ xe', 404));
  }

  const slots = await ParkingSlot.find({ parkingLot: req.params.parkingLotId });

  res.status(200).json({
    status: 'success',
    results: slots.length,
    data: { data: slots }, // Đảm bảo cấu trúc khớp với frontend
  });
});

// [GET] Lấy tất cả bãi đỗ (chỉ dành cho admin)
export const getAllParkingLots = catchAsync(async (req, res, next) => {
  console.log('📤 [GET] /api/v1/parkinglots');
  const parkingLots = await ParkingLot.find();

  res.status(200).json({
    status: 'success',
    results: parkingLots.length,
    data: parkingLots,
  });
});

// [GET] Lấy bãi đỗ theo ID với thống kê (công khai)
export const getOneParkingLot = catchAsync(async (req, res) => {
  const parkingLot = await parkinglotService.getParkingLotByIdWithStats(
    req.params.id
  );
  if (!parkingLot) {
    return res.status(404).json({ status: 'fail', message: 'Not found' });
  }
  res.status(200).json({
    status: 'success',
    data: { parkingLot },
  });
});
