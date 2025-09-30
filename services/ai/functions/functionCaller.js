import { AVAILABLE_FUNCTIONS, ROLE_PERMISSIONS } from './functionDefinitions.js';
import * as parkingFunctions from './parkingFunctions.js';
import * as bookingFunctions from './bookingFunctions.js';
import * as vehicleFunctions from './vehicleFunctions.js';
import * as statisticsFunctions from './statisticsFunctions.js';

export async function callFunction(functionName, parameters, userRole = 'guest') {
  console.log(`📞 Calling function: ${functionName}`, {
    parameters: parameters,
    userRole: userRole
  });

  // Check permission
  if (!ROLE_PERMISSIONS[userRole]?.includes(functionName)) {
    return {
      success: false,
      error: "Bạn không có quyền thực hiện chức năng này"
    };
  }

  // Validate function exists
  const functionDef = AVAILABLE_FUNCTIONS[functionName];
  if (!functionDef) {
    return {
      success: false,
      error: `Function ${functionName} không tồn tại`
    };
  }

  // Check required parameters
  for (const [key, param] of Object.entries(functionDef.parameters)) {
    if (param.required && !parameters[key]) {
      return {
        success: false,
        error: `Thiếu thông tin bắt buộc: ${param.description}`
      };
    }
  }

  try {
    let result;
    switch (functionName) {
      case 'search_parking_lots':
        result = await parkingFunctions.searchParkingLots(parameters);
        break;

      case 'get_parking_details':
        result = await parkingFunctions.getParkingDetails(parameters.parkingLotId);
        break;

      case 'check_parking_availability':
        result = await parkingFunctions.checkAvailability(
          parameters.parkingLotId,
          parameters.startTime,
          parameters.duration
        );
        break;

      case 'create_booking':
        if (!parameters.userId) {
          return {
            success: false,
            error: "Vui lòng đăng nhập để đặt chỗ"
          };
        }
        result = await bookingFunctions.createBooking(parameters);
        break;

      case 'get_user_bookings':
        if (!parameters.userId) {
          return {
            success: false,
            error: "Vui lòng đăng nhập để xem lịch sử"
          };
        }
        result = await bookingFunctions.getUserBookings(
          parameters.userId, 
          parameters.status, 
          parameters.limit
        );
        break;

      case 'get_user_vehicles':
        if (!parameters.userId) {
          return {
            success: false,
            error: "Vui lòng đăng nhập để xem thông tin xe"
          };
        }
        result = await vehicleFunctions.getUserVehicles(parameters.userId);
        break;

      case 'get_parking_revenue':
        if (!parameters.userId) {
          return {
            success: false,
            error: "Thiếu thông tin user"
          };
        }
        result = await statisticsFunctions.getParkingRevenue(
          parameters.userId,
          parameters.parkingLotId,
          parameters.timeRange
        );
        break;

      case 'get_system_stats':
        result = await statisticsFunctions.getSystemStats(
          parameters.userId,
          parameters.statType,
          parameters.timeRange
        );
        break;

      default:
        return {
          success: false,
          error: `Function ${functionName} chưa được implement`
        };
    }

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error(`❌ Error in ${functionName}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
   try {
    let result;
    switch (functionName) {
      // ... các case hiện có
      
      case 'get_user_stats':
        if (!parameters.userId) {
          return {
            success: false,
            error: "Vui lòng đăng nhập để xem thống kê"
          };
        }
        result = await statisticsFunctions.getUserStats(parameters.userId);
        break;

      case 'get_owner_revenue':
        if (!parameters.userId) {
          return {
            success: false,
            error: "Thiếu thông tin user"
          };
        }
        result = await statisticsFunctions.getOwnerRevenue(parameters.userId);
        break;

      case 'get_admin_stats':
        if (!parameters.userId) {
          return {
            success: false, 
            error: "Thiếu thông tin user"
          };
        }
        result = await statisticsFunctions.getAdminStats(parameters.userId);
        break;

      default:
        return {
          success: false,
          error: `Function ${functionName} chưa được implement`
        };
    }

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error(`❌ Error in ${functionName}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}