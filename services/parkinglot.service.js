import ParkingLot from '../models/parkinglot.model.js';
import ParkingSlot from '../models/parkingSlot.model.js';
import AppError from '../utils/appError.js';

export const createParkingLotWithSlots = async (body) => {
  const { name, zones, location } = body;

  if (!name || !zones || !Array.isArray(zones) || zones.length === 0) {
    throw new AppError('Thiếu name hoặc zones không hợp lệ', 400);
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
    throw new AppError(
      'Tọa độ location không hợp lệ (lng: -180~180, lat: -90~90)',
      400
    );
  }

  // Tạo bãi đỗ xe mới
  const newLot = await ParkingLot.create(body);

  // Tạo các slot dựa trên zones
  let slotsToCreate = [];

  zones.forEach((zoneInfo) => {
    const { zone, count } = zoneInfo;
    for (let i = 1; i <= count; i++) {
      slotsToCreate.push({
        parkingLot: newLot._id,
        slotNumber: `${zone}${i}`,
        zone: zone,
        status: 'available',
        expiresAt: null,
      });
    }
  });

  const createdSlots = await ParkingSlot.insertMany(slotsToCreate);

  return {
    parkingLot: newLot,
    slots: createdSlots,
  };
};

export const getParkingLotWithPineline = async () => {
  const doc = await ParkingLot.aggregate([
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
              cond: { $eq: ['$$slot.status', 'available'] },
            },
          },
        },
      },
    },
    // {
    //   $project: {
    //     slots: 0, // ẩn danh sách slot
    //   },
    // },
  ]);

  return doc;
};
