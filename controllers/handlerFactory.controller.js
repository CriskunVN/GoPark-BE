import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import APIFeatures from '../utils/apiFeatures.js';
import ParkingLot from '../models/parkinglot.model.js';
import ParkingSlot from '../models/parkingSlot.model.js';

// Hàm này sẽ trả về một hàm bất đồng bộ (async function) để xử lý các yêu cầu CRUD cho mô hình cụ thể
// Ví dụ: createOne(User) sẽ trả về một hàm để tạo người dùng mới, tạo ra một hàm để lấy người dùng theo ID, v.v.
// Tác dụng của hàm này là để giảm thiểu mã lặp lại trong các controller

export const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // Kiểm tra xem mô hình có phải là User không, nếu có thì kiểm tra email đã tồn tại chưa
    if (Model.modelName === 'User') {
      const existingUser = await Model.findOne({ email: req.body.email });
      if (existingUser) {
        return next(new AppError('User with this email already exists', 409));
      }
    }
    // Tạo một tài liệu mới từ mô hình với dữ liệu từ yêu cầu
    const doc = await Model.create(req.body);

    // Nếu là tạo thêm slot thì update count zone tương ứng trong ParkingLot
    if (Model.modelName === 'ParkingSlot') {
      const { parkingLot, slotNumber } = req.body;
      // slotNumber dạng "A6" => zone = "A", number = 6
      const match = /^([A-Za-z]+)(\d+)$/.exec(slotNumber);
      if (match) {
        const zoneName = match[1];
        const slotNum = parseInt(match[2], 10);
        // Tìm ParkingLot
        const lot = await ParkingLot.findById(parkingLot);
        if (lot) {
          const zones = lot.zones || [];
          const zoneIdx = zones.findIndex((z) => z.zone === zoneName);
          if (zoneIdx !== -1) {
            // Nếu đã có zone, cập nhật count nếu cần
            if (zones[zoneIdx].count < slotNum) {
              zones[zoneIdx].count = slotNum;
              await ParkingLot.findByIdAndUpdate(parkingLot, { zones });
            }
          } else {
            // Nếu chưa có zone, thêm mới
            zones.push({ zone: zoneName, count: slotNum });
            await ParkingLot.findByIdAndUpdate(parkingLot, { zones });
          }
        }
      }
    }

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

export const getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    let doc = '';
    if (Model.modelName !== 'ParkingLot') {
      doc = await Model.findById(req.params.id);
    } else {
      // tương tự như sub-query để lấy các thông tin của bãi xe và số lượng trống không cần phải tham chiếu
      doc = await ParkingLot.aggregate([
        {
          $lookup: {
            from: 'parkingslots',
            localField: '_id',
            foreignField: 'parkingLot',
            as: 'slots',
          },
        },
        {
          $addFields: {
            totalSlots: { $size: '$slots' },
            emptySlots: {
              $size: {
                $filter: {
                  input: '$slots',
                  as: 'slot',
                  cond: { $eq: ['$$slot.status', 'Trống'] },
                },
              },
            },
          },
        },
        {
          $project: {
            slots: 0, // ẩn danh sách slot
          },
        },
      ]);
    }

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

export const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    if (Model.modelName === 'ParkingLot') {
      // Xóa toàn bộ slot liên quan
      await ParkingSlot.deleteMany({ parkingLot: req.params.id });
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

// Xóa mềm: cập nhật isActive = false
export const softDeleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true, runValidators: true }
    );
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

export const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();
    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });
