import ParkingLot from '../models/parkinglot.model.js';
import ParkingSlot from '../models/parkingSlot.model.js';
import Booking from '../models/booking.model.js';
import AppError from '../utils/appError.js';
import mongoose from 'mongoose';
export const createParkingLotWithSlots = async (body) => {
    const { name, zones, location } = body;
    if (!name || !zones || !Array.isArray(zones) || zones.length === 0) {
        throw new AppError('Thiếu name hoặc zones không hợp lệ', 400);
    }
    // Validate location
    const [lng, lat] = location.coordinates;
    if (typeof lng !== 'number' ||
        typeof lat !== 'number' ||
        lng < -180 ||
        lng > 180 ||
        lat < -90 ||
        lat > 90) {
        throw new AppError('Tọa độ location không hợp lệ (lng: -180~180, lat: -90~90)', 400);
    }
    // Tạo bãi đỗ xe mới
    const newLot = await ParkingLot.create(body);
    console.log('✅ Created parking lot:', newLot);
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
    await ParkingSlot.insertMany(slotsToCreate);
    return {
        newLot,
    };
};
export const getParkingLotByIdWithStats = async (id) => {
    const doc = await ParkingLot.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
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
        // { $project: { slots: 0 } },
    ]);
    return doc[0] || null;
};
export const getUserBookingInParkingLot = async (parkingLotId) => {
    // 1. Lấy tất cả slot thuộc bãi đỗ này
    const slots = await ParkingSlot.find({ parkingLot: parkingLotId }).select('_id');
    const slotIds = slots.map((slot) => slot._id);
    // 2. Lấy tất cả booking trong các slot này
    const bookings = await Booking.find({
        parkingSlotId: { $in: slotIds },
    });
    if (!bookings || bookings.length === 0) {
        throw new AppError('Không tìm thấy booking nào trong bãi đỗ này', 404);
    }
    // lấy user trong các booking để trả về
    const userIds = bookings.map((booking) => booking.userId);
    const users = await mongoose.model('User').find({ _id: { $in: userIds } });
    return users;
};
//# sourceMappingURL=parkinglot.service.js.map