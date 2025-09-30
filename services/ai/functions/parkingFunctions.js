// functions/parkingFunctions.js
import ParkingLot from "../../../models/parkinglot.model.js";
import ParkingSlot from "../../../models/parkingSlot.model.js";
import Booking from "../../../models/booking.model.js";

export async function searchParkingLots(parameters) {
  try {
    const { location, maxPrice, features, limit = 5 } = parameters;
    
    console.log(`🔍 Searching parking lots:`, { location, maxPrice, features, limit });

    // Tạo query cơ bản
    let query = { isActive: true };
    
    // Tìm theo location (địa chỉ)
    if (location) {
      query.address = { $regex: location, $options: 'i' };
    }
    
    // Filter theo giá
    if (maxPrice) {
      query.pricePerHour = { $lte: maxPrice };
    }

    const parkingLots = await ParkingLot.find(query)
      .limit(parseInt(limit))
      .select('name address pricePerHour zones avtImage image allowedPaymentMethods')
      .lean();

    // Thêm thông tin available slots cho mỗi bãi xe
    const lotsWithAvailability = await Promise.all(
      parkingLots.map(async (lot) => {
        const totalSlots = lot.zones.reduce((sum, zone) => sum + zone.count, 0);
        
        // Đếm số slot đang được book
        const bookedSlots = await Booking.countDocuments({
          parkingSlotId: { $in: await ParkingSlot.find({ parkingLot: lot._id }).select('_id') },
          status: { $in: ['pending', 'confirmed'] }
        });

        return {
          ...lot,
          totalSlots,
          availableSlots: Math.max(0, totalSlots - bookedSlots),
          isAvailable: totalSlots - bookedSlots > 0
        };
      })
    );

    return lotsWithAvailability;
  } catch (error) {
    console.error('❌ Error in searchParkingLots:', error);
    throw new Error('Không thể tìm kiếm bãi xe');
  }
}

export async function getParkingDetails(parkingLotId) {
  try {
    console.log(`📋 Getting details for parking lot: ${parkingLotId}`);
    
    const parkingLot = await ParkingLot.findById(parkingLotId)
      .populate('parkingOwner', 'userName email')
      .lean();

    if (!parkingLot) {
      throw new Error('Không tìm thấy bãi xe');
    }

    // Lấy thông tin slots
    const slots = await ParkingSlot.find({ parkingLot: parkingLotId });
    
    // Thống kê availability
    const availableSlots = slots.filter(slot => slot.status === 'available').length;
    const totalSlots = slots.length;

    return {
      ...parkingLot,
      slots: {
        total: totalSlots,
        available: availableSlots,
        booked: totalSlots - availableSlots
      },
      zones: parkingLot.zones || []
    };
  } catch (error) {
    console.error('❌ Error in getParkingDetails:', error);
    throw new Error('Không thể lấy thông tin bãi xe');
  }
}

export async function checkAvailability(parkingLotId, startTime, duration) {
  try {
    console.log(`⏰ Checking availability:`, { parkingLotId, startTime, duration });
    
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000); // duration in hours

    // Lấy tất cả slots của bãi xe
    const slots = await ParkingSlot.find({ parkingLot: parkingLotId });
    
    // Kiểm tra slots nào available trong khoảng thời gian này
    const availableSlots = await Promise.all(
      slots.map(async (slot) => {
        const conflictingBookings = await Booking.countDocuments({
          parkingSlotId: slot._id,
          status: { $in: ['pending', 'confirmed'] },
          $or: [
            { startTime: { $lt: end }, endTime: { $gt: start } }
          ]
        });

        return {
          slotId: slot._id,
          slotNumber: slot.slotNumber,
          zone: slot.zone,
          pricePerHour: slot.pricePerHour,
          isAvailable: conflictingBookings === 0
        };
      })
    );

    const availableCount = availableSlots.filter(slot => slot.isAvailable).length;
    
    return {
      parkingLotId,
      startTime: start,
      endTime: end,
      duration,
      availableSlots: availableCount,
      totalSlots: slots.length,
      slots: availableSlots
    };
  } catch (error) {
    console.error('❌ Error in checkAvailability:', error);
    throw new Error('Không thể kiểm tra tình trạng chỗ trống');
  }
}