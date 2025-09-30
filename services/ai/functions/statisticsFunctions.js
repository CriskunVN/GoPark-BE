// functions/statisticsFunctions.js
import Booking from "../../../models/booking.model.js";
import Vehicle from "../../../models/vehicles.model.js";
import ParkingLot from "../../../models/parkinglot.model.js";
import User from "../../../models/user.model.js";

export async function getUserStats(userId) {
  try {
    console.log(`📊 Getting user stats for: ${userId}`);
    
    const [bookingCount, vehicleCount, activeBookings, totalSpent] = await Promise.all([
      // Tổng số booking
      Booking.countDocuments({ userId }),
      
      // Số lượng xe đã đăng ký
      Vehicle.countDocuments({ userId }),
      
      // Booking đang active
      Booking.countDocuments({ 
        userId, 
        status: { $in: ['pending', 'confirmed'] } 
      }),
      
      // Tổng chi tiêu (từ các booking completed)
      Booking.aggregate([
        { 
          $match: { 
            userId: mongoose.Types.ObjectId(userId),
            status: 'completed'
          } 
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalPrice' }
          }
        }
      ])
    ]);

    return {
      bookingCount,
      vehicleCount, 
      activeBookings,
      totalSpent: totalSpent.length > 0 ? totalSpent[0].total : 0
    };
  } catch (error) {
    console.error('❌ Error in getUserStats:', error);
    throw new Error('Không thể lấy thống kê người dùng');
  }
}

export async function getOwnerRevenue(userId) {
  try {
    console.log(`💰 Getting owner revenue for: ${userId}`);
    
    // Lấy tất cả bãi xe của chủ này
    const parkingLots = await ParkingLot.find({ parkingOwner: userId });
    const parkingLotIds = parkingLots.map(lot => lot._id);
    
    // Lấy doanh thu từ các booking trong bãi xe của chủ
    const revenueStats = await Booking.aggregate([
      {
        $lookup: {
          from: 'parkingslots',
          localField: 'parkingSlotId',
          foreignField: '_id',
          as: 'parkingSlot'
        }
      },
      {
        $unwind: '$parkingSlot'
      },
      {
        $match: {
          'parkingSlot.parkingLot': { $in: parkingLotIds }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    return {
      parkingLotCount: parkingLots.length,
      totalRevenue: revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0,
      totalBookings: revenueStats.length > 0 ? revenueStats[0].totalBookings : 0,
      completedBookings: revenueStats.length > 0 ? revenueStats[0].completedBookings : 0
    };
  } catch (error) {
    console.error('❌ Error in getOwnerRevenue:', error);
    throw new Error('Không thể lấy thống kê doanh thu');
  }
}

export async function getAdminStats(userId) {
  try {
    console.log(`👑 Getting admin stats for: ${userId}`);
    
    // Verify user is actually admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      throw new Error('Không có quyền admin');
    }

    const [totalUsers, totalOwners, totalParkingLots, totalBookings, revenueStats] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'parking_owner' }),
      ParkingLot.countDocuments(),
      Booking.countDocuments(),
      Booking.aggregate([
        {
          $match: { status: 'completed' }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalPrice' }
          }
        }
      ])
    ]);

    return {
      totalUsers,
      totalOwners, 
      totalParkingLots,
      totalBookings,
      totalRevenue: revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0
    };
  } catch (error) {
    console.error('❌ Error in getAdminStats:', error);
    throw new Error('Không thể lấy thống kê hệ thống');
  }
}

// Giữ lại functions cũ để tương thích
export async function getParkingRevenue(userId, parkingLotId, timeRange) {
  // Implementation cũ...
}

export async function getSystemStats(userId, statType, timeRange) {
  // Implementation cũ...
}