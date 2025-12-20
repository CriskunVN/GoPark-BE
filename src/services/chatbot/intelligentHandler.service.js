// services/intelligentHandler.service.js

import ParkingLot from '../../models/parkinglot.model.js';
import Booking from '../../models/booking.model.js';
import Vehicle from '../../models/vehicles.model.js';

/**
 * 🎯 XỬ LÝ CÂU HỎI TÌM BÃI XE THÔNG MINH
 * - Tìm theo vị trí GPS (ưu tiên cao nhất)
 * - Tìm theo tên thành phố
 * - Luôn trả về kết quả (có gợi ý nếu không tìm thấy)
 * 
 * 
 */




export async function handleFindParking(message, session) {
  const messageLower = message.toLowerCase();
  
  // 1. PHÂN TÍCH YÊU CẦU
  const requirements = extractParkingRequirements(messageLower);
  
  let query = {
    isActive: true
  };
  
  // 2. XÂY DỰNG QUERY
  // 2.1 Nếu có tọa độ GPS → Tìm theo khoảng cách
  if (session.context?.location?.coordinates) {
    const { lat, lng } = session.context.location.coordinates;
    
    query.location = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat]
        },
        $maxDistance: requirements.maxDistance || 5000 // 5km mặc định
      }
    };
  }
  // 2.2 Nếu có tên thành phố trong message
  else if (requirements.city) {
    query.address = { $regex: requirements.city, $options: 'i' };
  }
  // 2.3 Nếu có location trong session context
  else if (session.context?.location?.city) {
    query.address = { $regex: session.context.location.city, $options: 'i' };
  }
  
  // 2.4 Lọc theo GIÁ (nếu yêu cầu)
  if (requirements.priceRange) {
    if (requirements.priceRange === 'cheap') {
      query.pricePerHour = { $lte: 15000 };
    } else if (requirements.priceRange === 'medium') {
      query.pricePerHour = { $gte: 15000, $lte: 25000 };
    }
  }
  
  // 3. THỰC HIỆN TÌM KIẾM
  try {
    let parkingLots = await ParkingLot.find(query)
      .limit(5)
      .sort({ pricePerHour: 1 }) // Ưu tiên giá rẻ
      .lean();
    
    // 3.1 Tính khoảng cách nếu có GPS
    if (session.context?.location?.coordinates) {
      parkingLots = calculateDistances(
        parkingLots, 
        session.context.location.coordinates
      );
    }
    
    // 3.2 Đếm số slot trống
    for (const lot of parkingLots) {
      lot.availableSlots = await countAvailableSlots(lot._id);
    }
    
    // 4. TRẢ VỀ KẾT QUẢ
    if (parkingLots.length > 0) {
      return buildParkingListResponse(parkingLots, requirements, session);
    } else {
      // 4.1 KHÔNG TÌM THẤY → GỢI Ý BÃI GẦN NHẤT
      return await suggestNearestParking(session);
    }
    
  } catch (error) {
    console.error('❌ Lỗi tìm bãi xe:', error);
    return buildErrorResponse('Lỗi tìm kiếm', session);
  }
}

/**
 * 🧠 TRÍCH XUẤT YÊU CẦU TỪ MESSAGE
 * Phân tích: thành phố, giá, khoảng cách, đặc điểm
 */
function extractParkingRequirements(message) {
  const requirements = {
    city: null,
    priceRange: null,
    maxDistance: 5000,
    features: [],
    exactLocation: null
  };
  
  // Chi tiết hóa mapping thành phố
  const cityMapping = {
    // Hà Nội
    'hà nội': 'Hà Nội',
    'hanoi': 'Hà Nội',
    'hn': 'Hà Nội',
    'thủ đô': 'Hà Nội',
    'tphn': 'Hà Nội',
    
    // Đà Nẵng
    'đà nẵng': 'Đà Nẵng',
    'danang': 'Đà Nẵng',
    'dn': 'Đà Nẵng',
    'đà nẻng': 'Đà Nẵng',
    
    // Hồ Chí Minh
    'hồ chí minh': 'Hồ Chí Minh',
    'hcm': 'Hồ Chí Minh',
    'sài gòn': 'Hồ Chí Minh',
    'saigon': 'Hồ Chí Minh',
    'sg': 'Hồ Chí Minh',
    'tp.hcm': 'Hồ Chí Minh',
    
    // Các tỉnh thành khác
    'hải phòng': 'Hải Phòng',
    'haiphong': 'Hải Phòng',
    'cần thơ': 'Cần Thơ',
    'cantho': 'Cần Thơ',
    'nha trang': 'Nha Trang',
    'nhà trang': 'Nha Trang',
    'huế': 'Huế',
    'hue': 'Huế',
    'vũng tàu': 'Vũng Tàu',
    'vungtau': 'Vũng Tàu',
    'đà lạt': 'Đà Lạt',
    'dalat': 'Đà Lạt',
  };
  
  // Tìm thành phố trong message
  const messageLower = message.toLowerCase();
  for (const [key, value] of Object.entries(cityMapping)) {
    if (messageLower.includes(key)) {
      requirements.city = value;
      requirements.exactLocation = value;
      break;
    }
  }
  
  // Nếu không tìm thấy thành phố, thử tìm quận/huyện
  if (!requirements.city) {
    const districts = {
      'hoàn kiếm': 'Hà Nội',
      'ba đình': 'Hà Nội',
      'hai bà trưng': 'Hà Nội',
      'đống đa': 'Hà Nội',
      'cầu giấy': 'Hà Nội',
      'thanh xuân': 'Hà Nội',
      'hồ tây': 'Hà Nội',
      'sơn trà': 'Đà Nẵng',
      'ngũ hành sơn': 'Đà Nẵng',
      'hải châu': 'Đà Nẵng',
      'quận 1': 'Hồ Chí Minh',
      'quận 3': 'Hồ Chí Minh',
      'quận 5': 'Hồ Chí Minh',
      'quận 10': 'Hồ Chí Minh',
      'phú nhuận': 'Hồ Chí Minh',
      'gò vấp': 'Hồ Chí Minh',
      'tân bình': 'Hồ Chí Minh',
      'bình thạnh': 'Hồ Chí Minh',
    };
    
    for (const [key, value] of Object.entries(districts)) {
      if (messageLower.includes(key)) {
        requirements.city = value;
        requirements.exactLocation = key.charAt(0).toUpperCase() + key.slice(1);
        break;
      }
    }
  }
  
  return requirements;
}

/**
 * 📏 TÍNH KHOẢNG CÁCH TỪ VỊ TRÍ HIỆN TẠI
 */
function calculateDistances(parkingLots, userLocation) {
  return parkingLots.map(lot => {
    if (lot.location?.coordinates) {
      const distance = calculateHaversineDistance(
        userLocation.lat,
        userLocation.lng,
        lot.location.coordinates[1],
        lot.location.coordinates[0]
      );
      
      return {
        ...lot,
        distance: distance,
        distanceText: distance < 1 
          ? `${Math.round(distance * 1000)}m` 
          : `${distance.toFixed(1)}km`
      };
    }
    return lot;
  }).sort((a, b) => (a.distance || 999) - (b.distance || 999));
}

/**
 * 🌍 CÔNG THỨC HAVERSINE - Tính khoảng cách 2 tọa độ
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * 🔢 ĐÉM SỐ SLOT TRỐNG
 */
async function countAvailableSlots(parkingLotId) {
  try {
    // Giả sử bạn có model ParkingSlot
    // const count = await ParkingSlot.countDocuments({
    //   parkingLot: parkingLotId,
    //   status: 'available'
    // });
    
    // FALLBACK: Ước tính từ zones
    const lot = await ParkingLot.findById(parkingLotId).lean();
    if (lot?.zones?.length > 0) {
      return lot.zones.reduce((sum, zone) => sum + zone.count, 0);
    }
    
    return 10; // Giá trị mặc định
  } catch (error) {
    return 10;
  }
}

/**
 * 📝 XÂY DỰNG RESPONSE DANH SÁCH BÃI XE
 */
function buildParkingListResponse(parkingLots, requirements, session) {
  const location = requirements.city || session.context?.location?.city || 'khu vực của bạn';
  
  // Lấy tọa độ user
  let userLat = null;
  let userLng = null;
  
  if (session.context?.location?.coordinates) {
    userLat = session.context.location.coordinates.lat;
    userLng = session.context.location.coordinates.lng;
  } else if (requirements.city) {
    // Map tọa độ mặc định cho thành phố
    const cityCoordinates = {
      'Hà Nội': { lat: 21.0285, lng: 105.8542 },
      'Đà Nẵng': { lat: 16.0544, lng: 108.2022 },
      'Hồ Chí Minh': { lat: 10.8231, lng: 106.6297 },
      'Hải Phòng': { lat: 20.8449, lng: 106.6881 },
      'Cần Thơ': { lat: 10.0452, lng: 105.7469 },
    };
    
    const coords = cityCoordinates[location] || { lat: 16.0544, lng: 108.2022 };
    userLat = coords.lat;
    userLng = coords.lng;
  }
  
  // Tạo URL bản đồ thông minh
  let mapUrl = '';
  if (parkingLots.length > 0 && userLat && userLng) {
    const arriving = new Date().toISOString();
    const leaving = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // +1 giờ
    
    // Chuyển tên thành phố sang URL encoding
    const encodedCity = encodeURIComponent(location);
    
    mapUrl = `/CitiMap?city=${encodedCity}&arriving=${encodeURIComponent(arriving)}&leaving=${encodeURIComponent(leaving)}&isNearby=${!requirements.city}&userLat=${userLat}&userLon=${userLng}`;
    
    // Thêm parking IDs nếu có
    if (parkingLots.length <= 3) {
      const parkingIds = parkingLots.map(l => l._id).join(',');
      mapUrl += `&parkingIds=${parkingIds}`;
    }
  }
  
  // Format message
  let content = `🎯 **Tìm thấy ${parkingLots.length} bãi xe tại ${location}**\n\n`;
  
  parkingLots.forEach((lot, index) => {
    content += `${index + 1}. **${lot.name}**\n`;
    content += `   📍 ${lot.address}\n`;
    content += `   💰 ${lot.pricePerHour?.toLocaleString() || '15,000'} VND/giờ\n`;
    
    if (lot.distanceText) {
      content += `   📏 Cách ${lot.distanceText}\n`;
    }
    
    if (lot.rating) {
      content += `   ⭐ ${lot.rating}/5\n`;
    }
    
    content += `   🅿️ ${lot.availableSlots || '?'} chỗ trống\n\n`;
  });
  
  content += `📍 *Đang hiển thị ${parkingLots.length} bãi gần nhất*`;
  
  return {
    type: 'parking_list',
    content: content,
    data: parkingLots,
    buttons: [
      {
        text: '🗺️ Xem bản đồ',
        action: 'open_citimap',
        data: { 
          url: mapUrl,
          city: location,
          userLat: userLat,
          userLng: userLng,
          parkingLots: parkingLots.map(l => ({
            id: l._id,
            name: l.name,
            lat: l.location?.coordinates?.[1],
            lng: l.location?.coordinates?.[0]
          }))
        }
      },
      {
        text: '🎯 Đặt chỗ ngay',
        action: 'book_parking',
        data: { parkingId: parkingLots[0]._id }
      },
      {
        text: '💰 Lọc giá rẻ',
        action: 'filter_cheap'
      },
      {
        text: '📍 Chỉ bãi gần',
        action: 'filter_nearby'
      }
    ],
    quickInfo: [
      `Bãi rẻ nhất: ${Math.min(...parkingLots.map(l => l.pricePerHour || 15000)).toLocaleString()} VND/giờ`,
      parkingLots[0].distanceText ? `Gần nhất: ${parkingLots[0].distanceText}` : null,
      `Tổng chỗ trống: ${parkingLots.reduce((sum, lot) => sum + (lot.availableSlots || 0), 0)}`
    ].filter(Boolean)
  };
}

/**
 * 🔄 GỢI Ý BÃI XE GẦN NHẤT KHI KHÔNG TÌM THẤY
 */
async function suggestNearestParking(session) {
  try {
    // Tìm 3 bãi xe bất kỳ đang hoạt động
    const suggestions = await ParkingLot.find({ isActive: true })
      .limit(3)
      .sort({ pricePerHour: 1 })
      .lean();
    
    if (suggestions.length === 0) {
      return {
        type: 'text',
        content: '😔 **Rất tiếc, không tìm thấy bãi xe phù hợp**\n\nVui lòng:\n• Thử tìm ở khu vực khác\n• Liên hệ hotline: 1800-1234',
        buttons: [
          { text: '📞 Gọi hỗ trợ', action: 'call_support' }
        ]
      };
    }
    
    let content = '🔍 **Không tìm thấy bãi xe chính xác**\n\n';
    content += '💡 Gợi ý một số bãi xe tốt:\n\n';
    
    suggestions.forEach((lot, index) => {
      content += `${index + 1}. **${lot.name}**\n`;
      content += `   📍 ${lot.address}\n`;
      content += `   💰 ${lot.pricePerHour?.toLocaleString()} VND/giờ\n\n`;
    });
    
    return {
      type: 'parking_list',
      content: content,
      data: suggestions,
      buttons: [
        { text: '🔍 Tìm lại', action: 'find_parking' },
        { text: '📍 Cho phép vị trí', action: 'enable_location' }
      ]
    };
    
  } catch (error) {
    return buildErrorResponse('Lỗi gợi ý', session);
  }
}

/**
 * ❌ XÂY DỰNG ERROR RESPONSE
 */
function buildErrorResponse(errorType, session) {
  return {
    type: 'text',
    content: `⚠️ **${errorType}**\n\nVui lòng thử lại hoặc liên hệ hỗ trợ.`,
    buttons: [
      { text: '🔄 Thử lại', action: 'retry' },
      { text: '📞 Hotline', action: 'call_support' }
    ]
  };
}

/**
 * 📋 XEM BOOKING CỦA USER
 */
export async function handleMyBookings(userId) {
  try {
    const bookings = await Booking.find({ userId })
      .populate('parkingSlotId')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    if (bookings.length === 0) {
      return {
        type: 'text',
        content: '📋 **Bạn chưa có booking nào**\n\nHãy tìm bãi xe và đặt chỗ ngay!',
        buttons: [
          { text: '🔍 Tìm bãi xe', action: 'find_parking' }
        ]
      };
    }
    
    const active = bookings.filter(b => ['confirmed', 'checked-in'].includes(b.status));
    const past = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));
    
    let content = `📋 **Lịch sử đặt chỗ**\n\n`;
    content += `🟢 Đang hoạt động: ${active.length}\n`;
    content += `🔵 Đã hoàn thành: ${past.length}\n\n`;
    
    if (active.length > 0) {
      content += `**Booking đang hoạt động:**\n`;
      active.slice(0, 3).forEach((b, i) => {
        content += `${i + 1}. Chỗ ${b.parkingSlotId?.slotNumber || 'N/A'}\n`;
        content += `   ${new Date(b.startTime).toLocaleString('vi-VN')}\n`;
        content += `   💰 ${b.totalPrice?.toLocaleString()} VND\n\n`;
      });
    }
    
    return {
      type: 'booking_history',
      content: content,
      data: { active, past },
      buttons: [
        { text: '🎫 Xem QR code', action: 'show_qr', disabled: active.length === 0 },
        { text: '🗺️ Chỉ đường', action: 'navigate', disabled: active.length === 0 }
      ]
    };
    
  } catch (error) {
    console.error('❌ Lỗi lấy booking:', error);
    return buildErrorResponse('Lỗi lấy booking', null);
  }
}

/**
 * 🚗 XEM XE CỦA USER
 */
export async function handleMyVehicles(userId) {
  try {
    const vehicles = await Vehicle.find({ userId }).lean();
    
    if (vehicles.length === 0) {
      return {
        type: 'text',
        content: '🚗 **Bạn chưa thêm xe nào**\n\nThêm xe để đặt chỗ nhanh hơn!',
        buttons: [
          { text: '➕ Thêm xe', action: 'add_vehicle' }
        ]
      };
    }
    
    let content = `🚗 **Xe của bạn (${vehicles.length})**\n\n`;
    
    vehicles.forEach((v, i) => {
      content += `${i + 1}. **${v.licensePlate}**\n`;
      content += `   ${v.vehicleType || 'Ô tô'}\n\n`;
    });
    
    return {
      type: 'vehicle_list',
      content: content,
      data: vehicles,
      buttons: [
        { text: '➕ Thêm xe mới', action: 'add_vehicle' },
        { text: '✏️ Sửa xe', action: 'edit_vehicle' }
      ]
    };
    
  } catch (error) {
    return buildErrorResponse('Lỗi lấy danh sách xe', null);
  }
}

/**
 * ℹ️ XEM BẢNG GIÁ
 */
export function handlePriceInfo() {
  return {
    type: 'text',
    content: `💰 **Bảng giá đỗ xe GoPark**\n\n` +
             `📍 **Trung tâm thành phố:**\n` +
             `   • 20,000 - 30,000 VND/giờ\n` +
             `   • 150,000 - 200,000 VND/ngày\n\n` +
             `📍 **Ngoại thành:**\n` +
             `   • 10,000 - 20,000 VND/giờ\n` +
             `   • 80,000 - 120,000 VND/ngày\n\n` +
             `🎁 **Ưu đãi:**\n` +
             `   • Gói tháng: Giảm 20%\n` +
             `   • Đặt trước: Giảm 10%`,
    buttons: [
      { text: '🔍 Tìm bãi giá rẻ', action: 'find_cheap_parking' }
    ]
  };
}

/**
 * 📞 THÔNG TIN LIÊN HỆ
 */
export function handleContactInfo() {
  return {
    type: 'text',
    content: `📞 **Liên hệ GoPark**\n\n` +
             `🔥 Hotline: **1800-1234** (miễn phí)\n` +
             `📧 Email: support@gopark.vn\n` +
             `💬 Zalo OA: @GoParkVN\n` +
             `🕐 Giờ làm việc: 8:00 - 22:00`,
    buttons: [
      { text: '📱 Gọi ngay', action: 'call_support', data: { phone: '18001234' } }
    ]
  };
}

export async function handleFindCheapParking(message, session) {
  const messageLower = message.toLowerCase();
  
  // Xác định thành phố
  let city = "Hà Nội";
  if (messageLower.includes("đà nẵng")) city = "Đà Nẵng";
  if (messageLower.includes("hồ chí minh") || messageLower.includes("hcm") || messageLower.includes("sài gòn")) city = "Hồ Chí Minh";
  
  try {
    // Tìm 3 bãi rẻ nhất trong thành phố
    const cheapParkingLots = await ParkingLot.find({
      isActive: true,
      address: { $regex: city, $options: 'i' }
    })
    .sort({ pricePerHour: 1 }) // Sắp xếp giá tăng dần
    .limit(3)
    .lean();
    
    if (cheapParkingLots.length === 0) {
      return {
        type: 'text',
        content: `😔 **Không tìm thấy bãi xe giá rẻ ở ${city}**\n\nVui lòng thử tìm ở khu vực khác.`,
        buttons: [
          { text: 'Tìm ở Hà Nội', action: 'msg:tìm bãi xe ở Hà Nội' },
          { text: 'Tìm ở Đà Nẵng', action: 'msg:tìm bãi xe ở Đà Nẵng' },
        ]
      };
    }
    
    // Đếm slot trống
    for (const lot of cheapParkingLots) {
      lot.availableSlots = await countAvailableSlots(lot._id);
    }
    
    let content = `💰 **Top ${cheapParkingLots.length} bãi xe giá rẻ nhất ở ${city}**\n\n`;
    
    cheapParkingLots.forEach((lot, index) => {
      content += `${index + 1}. **${lot.name}**\n`;
      content += `   📍 ${lot.address}\n`;
      content += `   💰 ${lot.pricePerHour?.toLocaleString() || '15,000'} VND/giờ\n`;
      content += `   🅿️ ${lot.availableSlots || '?'} chỗ trống\n\n`;
    });
    
    content += `*Giá đã bao gồm thuế VAT*`;
    
    return {
      type: 'parking_list',
      content: content,
      data: cheapParkingLots,
      buttons: [
        {
          text: '🎯 Đặt chỗ ngay',
          action: 'book_parking',
          data: { parkingId: cheapParkingLots[0]._id },
          icon: '🎯'
        },
        {
          text: '🗺️ Xem bản đồ',
          action: 'open_citimap',
          data: { 
            city: city,
            parkingData: cheapParkingLots 
          },
          icon: '🗺️'
        },
        {
          text: '📋 Xem tất cả',
          action: 'view_all_parking',
          icon: '📋'
        }
      ]
    };
    
  } catch (error) {
    console.error('❌ Lỗi tìm bãi giá rẻ:', error);
    return {
      type: 'text',
      content: '⚠️ **Có lỗi xảy ra**\n\nVui lòng thử lại sau.',
      buttons: [
        { text: 'Thử lại', action: 'retry' },
      ]
    };
  }
}
