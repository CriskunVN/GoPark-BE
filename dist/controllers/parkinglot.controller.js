// controllers/parkinglot.controller.js
import ParkingLot from '../models/parkinglot.model.js';
import ParkingSlot from '../models/parkingSlot.model.js';
import catchAsync from '../utils/catchAsync.js';
import * as parkinglotService from '../services/parkinglot.service.js';
import AppError from '../utils/appError.js';
// [GET] Lấy tất cả bãi đỗ thuộc về chủ bãi hiện tại
export const getMyParkingLots = catchAsync(async (req, res, next) => {
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
    const location = req.body.location?.coordinates?.length === 2 &&
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
// [GET] Lấy bãi đỗ theo ID (public hoặc của owner)
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
// [PATCH] Cập nhật bãi đỗ (support nhiều ảnh)
export const updateParkingLot = catchAsync(async (req, res, next) => {
    try {
        // FE sẽ gửi image: [] đầy đủ (ảnh cũ + ảnh mới muốn giữ lại)
        const updatedLot = await ParkingLot.findOneAndUpdate({ _id: req.params.id, parkingOwner: req.user.id }, { $set: req.body }, // cập nhật tất cả field, image là array
        { new: true, runValidators: true });
        if (!updatedLot) {
            return next(new AppError('Không tìm thấy bãi đỗ xe của bạn', 404));
        }
        res.status(200).json({
            status: 'success',
            message: 'Cập nhật thành công',
            data: updatedLot,
        });
    }
    catch (error) {
        return next(new AppError('Lỗi khi cập nhật bãi đỗ', 500));
    }
});
// [DELETE] Xóa vĩnh viễn
export const deleteParkingLot = catchAsync(async (req, res, next) => {
    const deletedLot = await ParkingLot.findOneAndDelete({
        _id: req.params.id,
    });
    if (!deletedLot) {
        return next(new AppError('Không tìm thấy bãi đỗ xe của bạn', 404));
    }
    // Xóa tất cả slot thuộc bãi đỗ
    await ParkingSlot.deleteMany({ parkingLot: req.params.id });
    res.status(204).json({
        status: 'success',
        message: 'Đã xóa vĩnh viễn bãi đỗ',
        data: null,
    });
});
// [PATCH] Xóa mềm (isActive = false)
export const softDeleteParkingLot = catchAsync(async (req, res, next) => {
    const updatedLot = await ParkingLot.findOneAndUpdate({ _id: req.params.id, parkingOwner: req.user.id }, { isActive: false }, { new: true });
    if (!updatedLot) {
        return next(new AppError('Không tìm thấy bãi đỗ xe của bạn', 404));
    }
    res.status(200).json({
        status: 'success',
        message: 'Đã xóa mềm bãi đỗ',
        data: updatedLot,
    });
});
// [GET] Lấy bãi đỗ theo thành phố (public)
export const getParkingLotsByCity = catchAsync(async (req, res, next) => {
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
// [GET] Lấy tất cả vị trí đỗ theo bãi đỗ (public)
export const getAllParkingSlotsByLotId = catchAsync(async (req, res, next) => {
    const parkingLot = await ParkingLot.findById(req.params.parkingLotId);
    if (!parkingLot) {
        return next(new AppError('Không tìm thấy bãi đỗ xe', 404));
    }
    const slots = await ParkingSlot.find({ parkingLot: req.params.parkingLotId });
    res.status(200).json({
        status: 'success',
        results: slots.length,
        data: { data: slots },
    });
});
// [GET] Lấy tất cả bãi đỗ (admin)
export const getAllParkingLots = catchAsync(async (req, res, next) => {
    const parkingLots = await ParkingLot.find();
    res.status(200).json({
        status: 'success',
        results: parkingLots.length,
        data: parkingLots,
    });
});
// [GET] Lấy bãi đỗ theo ID + thống kê (public)
export const getOneParkingLot = catchAsync(async (req, res) => {
    const parkingLot = await parkinglotService.getParkingLotByIdWithStats(req.params.id);
    if (!parkingLot) {
        return res.status(404).json({ status: 'fail', message: 'Not found' });
    }
    res.status(200).json({
        status: 'success',
        data: { parkingLot },
    });
});
// [GET] Lấy danh sách user đã booking trong bãi đỗ (owner)
export const getUserBookingInParkingLot = catchAsync(async (req, res, next) => {
    const parkingLotId = req.params.id;
    const users = await parkinglotService.getUserBookingInParkingLot(parkingLotId);
    if (!users || users.length === 0) {
        return next(new AppError('Không tìm thấy user nào booking trong bãi đỗ này', 404));
    }
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: users,
    });
});
//# sourceMappingURL=parkinglot.controller.js.map