export const AVAILABLE_FUNCTIONS = {
  search_parking_lots: {
    description: "Tìm kiếm bãi đỗ xe theo khu vực",
    parameters: {
      location: {
        type: "string",
        description: "Địa điểm cần tìm (ví dụ: Hải Châu, Thanh Khê)",
        required: true
      },
      maxPrice: {
        type: "number",
        description: "Giá tối đa (VND/giờ)",
        required: false
      },
      features: {
        type: "array",
        description: "Tính năng cần có (camera, bảo vệ, mái che)",
        required: false
      },
      limit: {
        type: "number",
        description: "Số lượng kết quả trả về",
        default: 5
      }
    }
  },

  get_user_bookings: {
    description: "Lấy lịch sử đặt chỗ của người dùng",
    parameters: {
      userId: {
        type: "string",
        description: "ID của người dùng",
        required: true
      },
      status: {
        type: "string",
        description: "Trạng thái booking (pending, confirmed, completed, cancelled)",
        required: false
      },
      limit: {
        type: "number",
        description: "Số lượng kết quả trả về",
        default: 5
      }
    }
  },

  get_user_vehicles: {
    description: "Lấy thông tin xe của người dùng",
    parameters: {
      userId: {
        type: "string",
        description: "ID của người dùng",
        required: true
      }
    }
  },

  create_booking: {
    description: "Tạo đơn đặt chỗ mới",
    parameters: {
      userId: {
        type: "string",
        description: "ID của người dùng",
        required: true
      },
      parkingLotId: {
        type: "string",
        description: "ID bãi đỗ xe",
        required: true
      },
      vehicleNumber: {
        type: "string",
        description: "Biển số xe",
        required: true
      },
      startTime: {
        type: "string",
        description: "Thời gian bắt đầu (ISO string)",
        required: true
      },
      duration: {
        type: "number",
        description: "Số giờ đặt",
        required: true
      }
    }
  },

  get_parking_revenue: {
    description: "Lấy thống kê doanh thu bãi xe",
    parameters: {
      userId: {
        type: "string",
        description: "ID chủ bãi xe",
        required: true
      },
      parkingLotId: {
        type: "string",
        description: "ID bãi xe cụ thể (optional)",
        required: false
      },
      timeRange: {
        type: "string",
        description: "Khoảng thời gian (day, week, month, year)",
        default: "month"
      }
    }
  },

  check_parking_availability: {
    description: "Kiểm tra tình trạng chỗ trống",
    parameters: {
      parkingLotId: {
        type: "string",
        required: true
      },
      startTime: {
        type: "string",
        required: true
      },
      duration: {
        type: "number",
        required: true
      }
    }
  },
   get_user_stats: {
    description: "Lấy thống kê tổng quan của người dùng",
    parameters: {
      userId: {
        type: "string",
        description: "ID của người dùng",
        required: true
      }
    }
  },

  get_owner_revenue: {
    description: "Lấy thống kê doanh thu cho chủ bãi xe",
    parameters: {
      userId: {
        type: "string", 
        description: "ID chủ bãi xe",
        required: true
      }
    }
  },

  get_admin_stats: {
    description: "Lấy thống kê hệ thống cho admin",
    parameters: {
      userId: {
        type: "string",
        description: "ID admin",
        required: true
      }
    }
  }
};

export const ROLE_PERMISSIONS = {
  guest: ["search_parking_lots", "get_parking_details"],
  user: ["search_parking_lots", "get_parking_details", "get_user_stats", "get_user_vehicles", "get_user_bookings"],
  parking_owner: ["search_parking_lots", "get_parking_details", "get_owner_revenue", "get_user_bookings"],
  admin: ["search_parking_lots", "get_parking_details", "get_user_stats", "get_admin_stats", "get_user_bookings"]
};