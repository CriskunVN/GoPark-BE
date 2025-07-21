import * as Factory from './handlerFactory.controller.js';
import ParkingSlot from '../models/parkingSlot.model.js';
import Booking from '../models/booking.model.js'; // Thêm import Booking
import catchAsync from '../utils/catchAsync.js';
import * as ParkingSlotService from '../services/parkingSlot.service.js';

// Lấy tất cả slot trong bãi đỗ theo thời gian
export const getSlotsAvailableByDate = catchAsync(async (req, res, next) => {
  const { startTime, endTime } = req.query;
  const { parkingLotId } = req.params;

  if (!startTime || !endTime) {
    return res.status(400).json({ message: 'Missing date query' });
  }

  // Lấy tất cả slot của bãi đỗ
  const slots = await ParkingSlot.find({ parkingLot: parkingLotId });

  // Lấy tất cả booking trong khoảng thời gian
  const bookings = await Booking.find({
    parkingSlotId: { $in: slots.map((slot) => slot._id) },
    $or: [{ startTime: { $lte: endTime }, endTime: { $gte: startTime } }],
    status: { $in: ['pending', 'confirmed'] },
  });

  // Gắn trạng thái cho slot dựa trên booking
  const slotsWithStatus = slots.map((slot) => {
    console.log(`Processing slot: ${slot}`);
    const slotBookings = bookings.filter(
      (booking) => booking.parkingSlotId.toString() === slot._id.toString()
    );
    const isBookedOrReserved = slotBookings.length > 0;
    return {
      ...slot.toObject(),
      status: isBookedOrReserved
        ? slot.status === 'booked'
          ? 'booked'
          : 'reserved'
        : 'available',
      bookings: slotBookings, // Gắn thông tin booking vào slot
    };
  });

  res.status(200).json({
    status: 'success',
    results: slotsWithStatus.length,
    data: { data: slotsWithStatus },
  });
});

// ... Các hàm khác giữ nguyên ...

// Lấy chi tiết booking của một slot
export const getSlotBookings = catchAsync(async (req, res, next) => {
  const { slotId } = req.params;
  const { startTime, endTime } = req.query;

  if (!startTime || !endTime) {
    return res.status(400).json({ message: 'Missing date query' });
  }

  const bookings = await Booking.find({
    parkingSlotId: slotId,
    $or: [{ startTime: { $lte: endTime }, endTime: { $gte: startTime } }],
  }).populate('userId', 'name email'); // Lấy thông tin user nếu cần

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: bookings,
  });
});

// Các hàm khác giữ nguyên
export const getAllParkingSlots = Factory.getAll(ParkingSlot);
export const createParkingSlot = catchAsync(async (req, res, next) => {
  const prepared = await ParkingSlotService.prepareParkingSlotData(req.body);
  const doc = await ParkingSlot.create(prepared);
  res.status(201).json({
    status: 'success',
    data: { data: doc },
  });
});
export const getParkingSlot = Factory.getOne(ParkingSlot);

export const deleteParkingSlot = catchAsync(async (req, res, next) => {
  await ParkingSlotService.deleteSlotAndSyncZone(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
export const updateParkingSlot = Factory.updateOne(ParkingSlot);

export const getSlotsBookedByDateForOwner = catchAsync(
  async (req, res, next) => {
    const { time } = req.query;
    const { parkingLotId } = req.params;
    if (!time) {
      return res.status(400).json({ message: 'Missing date query' });
    }
    const bookedSlots = await ParkingSlotService.getBookedSlotsForOwner(
      time,
      parkingLotId
    );
    res.status(200).json({
      status: 'success',
      results: bookedSlots.length,
      data: bookedSlots,
    });
  }
);
export const getSlotsAvailableByDateForOwner = catchAsync(
  async (req, res, next) => {
    const { time } = req.query;
    const { parkingLotId } = req.params;
    if (!time) {
      return res.status(400).json({ message: 'Missing date query' });
    }
    const availableSlots = await ParkingSlotService.getAvailableSlotsForOwner(
      time,
      parkingLotId
    );
    res.status(200).json({
      status: 'success',
      results: availableSlots.length,
      data: availableSlots,
    });
  }
);
