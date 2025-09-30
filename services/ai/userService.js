import User from "../../models/user.model.js";
import Vehicle from "../../models/vehicles.model.js";
import Booking from "../../models/booking.model.js";
import ParkingLot from "../../models/parkinglot.model.js";
import mongoose from 'mongoose';

// Import các hàm thống kê từ statisticsFunctions.js
import { getUserStats, getOwnerRevenue, getAdminStats } from "./functions/statisticsFunctions.js";

export async function getUserInfo(userId) {
  console.log(`🔍 getUserInfo called with userId: ${userId}`);
  try {
    if (!userId || typeof userId !== 'string' || userId.length < 10) {
      return {
        role: 'guest',
        name: 'Khách vãng lai',
        userId: null,
        contextInfo: 'Chỉ có thể xem thông tin cơ bản về bãi xe. Vui lòng đăng nhập để sử dụng đầy đủ tính năng.',
        availableActions: ['search_parking_lots']
      };
    }

    const user = await User.findById(userId);
    if (!user) {
      return {
        role: 'guest',
        name: 'User không tồn tại',
        userId: null,
        contextInfo: 'Vui lòng đăng nhập lại để có trải nghiệm tốt hơn',
        availableActions: ['search_parking_lots']
      };
    }

    let contextInfo = '';
    let availableActions = [];

    switch (user.role) {
      case 'user':
        try {
          const userStats = await getUserStats(userId);
          contextInfo = `Khách hàng có ${userStats.vehicleCount} xe, ${userStats.bookingCount} lượt đặt chỗ, ${userStats.activeBookings} đặt chỗ đang hoạt động.`;
        } catch (statsError) {
          console.error('❌ Error getting user stats:', statsError);
          contextInfo = 'Khách hàng - đang tải thông tin...';
        }
        availableActions = ['get_user_stats', 'get_user_vehicles', 'search_parking_lots', 'get_user_bookings'];
        break;

      case 'parking_owner':
        try {
          const ownerStats = await getOwnerRevenue(userId);
          contextInfo = `Chủ bãi xe quản lý ${ownerStats.parkingLotCount} bãi, tổng doanh thu ${ownerStats.totalRevenue?.toLocaleString() || 0}đ.`;
        } catch (statsError) {
          console.error('❌ Error getting owner stats:', statsError);
          contextInfo = 'Chủ bãi xe - đang tải thông tin...';
        }
        availableActions = ['get_owner_revenue', 'search_parking_lots'];
        break;

      case 'admin':
        try {
          const adminStats = await getAdminStats(userId);
          contextInfo = `Quản trị viên - Hệ thống có ${adminStats.totalUsers} người dùng, ${adminStats.totalParkingLots} bãi xe.`;
        } catch (statsError) {
          console.error('❌ Error getting admin stats:', statsError);
          contextInfo = 'Quản trị viên - đang tải thông tin...';
        }
        availableActions = ['get_admin_stats', 'search_parking_lots'];
        break;

      default:
        contextInfo = 'User với quyền hạn cơ bản.';
        availableActions = ['search_parking_lots'];
    }

    return {
      role: user.role,
      name: user.userName,
      email: user.email,
      userId: userId,
      contextInfo,
      availableActions
    };
  } catch (error) {
    console.error('❌ Lỗi getUserInfo:', error);
    console.error('❌ Stack trace:', error.stack);
    return {
      role: 'guest',
      name: 'Lỗi hệ thống',
      userId: null,
      contextInfo: 'Không thể xác định thông tin người dùng. Vui lòng thử lại sau.',
      availableActions: ['search_parking_lots'],
      error: error.message
    };
  }
}