// functions/bookingFunctions.js
import Booking from "../../../models/booking.model.js";
import ParkingSlot from "../../../models/parkingSlot.model.js";
import ParkingLot from "../../../models/parkinglot.model.js";

export async function createBooking(parameters) {
  try {
    const { userId, parkingLotId, vehicleNumber, startTime, duration } = parameters;
    
    console.log(`📅 Creating booking:`, { userId, parkingLotId, vehicleNumber, startTime, duration });

    // Tìm available slot
    const availableSlot = await ParkingSlot.findOne({
      parkingLot: parkingLotId,
      status: 'available'
    });

    if (!availableSlot) {
      throw new Error('Hiện không có chỗ trống trong bãi xe này');
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000);

    // Kiểm tra conflict
    const conflictingBooking = await Booking.findOne({
      parkingSlotId: availableSlot._id,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } }
      ]
    });

    if (conflictingBooking) {
      throw new Error('Chỗ đỗ này đã được đặt trong khoảng thời gian bạn chọn');
    }

    // Tính giá
    const totalPrice = availableSlot.pricePerHour * duration;

    // Tạo booking
    const booking = await Booking.create({
      userId,
      parkingSlotId: availableSlot._id,
      startTime: start,
      endTime: end,
      vehicleNumber,
      totalPrice,
      status: 'pending',
      paymentStatus: 'unpaid'
    });

    // Update slot status
    availableSlot.status = 'booked';
    await availableSlot.save();

    // Lấy thông tin bãi xe để trả về
    const parkingLot = await ParkingLot.findById(parkingLotId);

    return {
      booking: {
        _id: booking._id,
        parkingLotName: parkingLot?.name || 'N/A',
        vehicleNumber: booking.vehicleNumber,
        startTime: booking.startTime,
        endTime: booking.endTime,
        totalPrice: booking.totalPrice,
        status: booking.status
      }
    };
  } catch (error) {
    console.error('❌ Error in createBooking:', error);
    throw new Error(`Không thể tạo booking: ${error.message}`);
  }
}

export async function getUserBookings(userId, status, limit = 5) {
  try {
    console.log(`📋 Getting bookings for user: ${userId}`, { status, limit });
    
    let query = { userId };
    
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('parkingSlotId')
      .populate({
        path: 'parkingSlotId',
        populate: {
          path: 'parkingLot',
          select: 'name address'
        }
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    const formattedBookings = bookings.map(booking => ({
      _id: booking._id,
      parkingLotName: booking.parkingSlotId?.parkingLot?.name || 'N/A',
      parkingLotAddress: booking.parkingSlotId?.parkingLot?.address || 'N/A',
      vehicleNumber: booking.vehicleNumber,
      startTime: booking.startTime,
      endTime: booking.endTime,
      totalPrice: booking.totalPrice,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      bookingType: booking.bookingType
    }));

    return {
      bookings: formattedBookings,
      total: formattedBookings.length
    };
  } catch (error) {
    console.error('❌ Error in getUserBookings:', error);
    throw new Error('Không thể lấy lịch sử booking');
  }
}

export async function cancelBooking(bookingId, userId) {
  try {
    console.log(`❌ Canceling booking: ${bookingId} for user: ${userId}`);
    
    const booking = await Booking.findOne({ _id: bookingId, userId });
    
    if (!booking) {
      throw new Error('Không tìm thấy booking');
    }

    if (booking.status === 'cancelled') {
      throw new Error('Booking đã được hủy trước đó');
    }

    if (booking.status === 'completed') {
      throw new Error('Không thể hủy booking đã hoàn thành');
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Free up the parking slot
    await ParkingSlot.findByIdAndUpdate(booking.parkingSlotId, {
      status: 'available'
    });

    return {
      success: true,
      message: 'Đã hủy booking thành công',
      bookingId: booking._id
    };
  } catch (error) {
    console.error('❌ Error in cancelBooking:', error);
    throw new Error(`Không thể hủy booking: ${error.message}`);
  }
}