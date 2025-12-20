// services/fallbackResponses.service.js - TỐI GIẢN

export const fallbackPatterns = {
  greeting: {
    patterns: ['chào', 'hello', 'hi', 'xin chào'],
    response: (userInfo) => ({
      type: 'text',
      content: `👋 **Chào ${userInfo.name || 'bạn'}!**\n\nTôi có thể giúp bạn tìm bãi xe, xem giá, và đặt chỗ.`,
      buttons: [
        { text: '🔍 Tìm bãi xe', action: 'find_parking' },
        { text: '💰 Xem giá', action: 'view_price' },
      ]
    })
  },

  findParking: {
    patterns: ['tìm bãi', 'bãi xe', 'đỗ xe', 'parking'],
    response: (userInfo) => ({
      type: 'text',
      content: '🔍 **Tìm bãi xe**\n\nBạn muốn tìm ở khu vực nào? (VD: Hà Nội, Đà Nẵng, gần tôi)',
      buttons: [
        { text: '📍 Gần tôi', action: 'find_nearby' },
        { text: '🏙️ Hà Nội', action: 'msg:tìm bãi xe ở Hà Nội' },
        { text: '🏖️ Đà Nẵng', action: 'msg:tìm bãi xe ở Đà Nẵng' },
      ]
    })
  },

  price: {
    patterns: ['giá', 'bao nhiêu tiền', 'phí đỗ', 'bảng giá'],
    response: () => ({
      type: 'text',
      content: '💰 **Bảng giá**\n\n• Trung tâm: 20,000-30,000 VND/giờ\n• Ngoại thành: 10,000-20,000 VND/giờ\n\n*Đặt trước online giảm 10%*',
      buttons: [
        { text: '🔍 Tìm bãi giá rẻ', action: 'find_cheap_parking' },
      ]
    })
  },

  booking: {
    patterns: ['đặt chỗ', 'booking', 'reserve'],
    response: (userInfo) => {
      if (!userInfo.userId) {
        return {
          type: 'text',
          content: '🔒 **Cần đăng nhập**\n\nĐăng nhập để đặt chỗ nhanh chóng.',
          buttons: [
            { text: '🔐 Đăng nhập', action: 'login' },
            { text: '🔍 Xem bãi trước', action: 'find_parking' },
          ]
        };
      }
      return {
        type: 'text',
        content: '📝 **Đặt chỗ**\n\n1. Tìm bãi xe\n2. Chọn thời gian\n3. Chọn xe\n4. Thanh toán',
        buttons: [
          { text: '🔍 Tìm bãi ngay', action: 'find_parking' },
        ]
      };
    }
  },

  contact: {
    patterns: ['liên hệ', 'hotline', 'hỗ trợ', 'contact'],
    response: () => ({
      type: 'text',
      content: '📞 **Hỗ trợ**\n\n• Hotline: 1800-1234\n• Email: support@gopark.vn\n• Giờ: 8:00-22:00',
      buttons: [
        { text: '📱 Gọi ngay', action: 'call_support', data: { phone: '18001234' } },
      ]
    })
  },
  cheapParking: {
    patterns: ['rẻ nhất', 'giá rẻ', 'giá tốt', 'lọc giá rẻ'],
    response: (userInfo) => ({
      type: 'text',
      content: '💰 **Tìm bãi xe giá rẻ nhất**\n\nTôi sẽ tìm bãi xe với giá tốt nhất cho bạn. Bạn muốn tìm ở khu vực nào?',
      buttons: [
        { text: '🏙️ Hà Nội', action: 'msg:tìm bãi xe giá rẻ ở Hà Nội' },
        { text: '🏖️ Đà Nẵng', action: 'msg:tìm bãi xe giá rẻ ở Đà Nẵng' },
        { text: '📍 Gần tôi', action: 'msg:tìm bãi xe giá rẻ gần tôi' },
      ]
    })
  },
  
  contactDetails: {
    patterns: ['email', 'sdt', 'facebook', 'fb', 'liên lạc'],
    response: () => ({
      type: 'text',
      content: '📞 **Thông tin liên hệ trực tiếp**\n\n• **Email:** nguyen229396@gmail.com\n• **SĐT:** 0387 762 696\n• **Facebook:** facebook.com/taynguyen.ha.9',
      buttons: [
        { text: '📧 Gửi email', action: 'send_email', data: { email: 'nguyen229396@gmail.com' } },
        { text: '📱 Gọi ngay', action: 'call_now', data: { phone: '0387762696' } },
      ]
    })
  },
  
  bookingGuide: {
    patterns: ['hướng dẫn đặt', 'cách đặt chỗ', 'làm sao đặt'],
    response: () => ({
      type: 'text',
      content: '📋 **Hướng dẫn đặt chỗ nhanh**\n\n1. Đăng ký tài khoản\n2. Thêm xe trong Thông tin cá nhân\n3. Tìm bãi đỗ\n4. Chọn vị trí & thời gian\n5. Thanh toán online',
      buttons: [
        { text: '📝 Đăng ký ngay', action: 'register' },
        { text: '🔍 Tìm bãi xe', action: 'find_parking' },
      ]
    })
  },
  nearbyParking: {
  patterns: ['gần tôi', 'gần đây', 'quanh đây', 'gần vị trí', 'near me', 'nearby'],
  response: (userInfo) => ({
    type: 'text',
    content: '📍 **Tìm bãi xe gần bạn**\n\nTôi cần vị trí của bạn để tìm bãi xe gần nhất.',
    buttons: [
      { text: '📍 Cho phép vị trí', action: 'enable_location', primary: true },
      { text: '🏙️ Tìm ở Hà Nội', action: 'msg:tìm bãi xe ở Hà Nội' },
      { text: '🏖️ Tìm ở Đà Nẵng', action: 'msg:tìm bãi xe ở Đà Nẵng' },
    ]
  })
},

paymentMethods: {
  patterns: ['thanh toán', 'trả tiền', 'payment', 'momo', 'vnpay', 'chuyển khoản'],
  response: () => ({
    type: 'text',
    content: '💳 **Phương thức thanh toán**\n\n• **VNPay QR Code** (Khuyến khích)\n• **MoMo** (Ví điện tử)\n• **Chuyển khoản ngân hàng**\n• **Tiền mặt tại bãi**\n\n⚡ *Thanh toán online được giảm 10%*',
    buttons: [
      { text: '💳 Thanh toán ngay', action: 'make_payment' },
      { text: '📱 Tải app MoMo', action: 'download_momo' },
    ]
  })
},
  contactDetails: {
  patterns: ['email', 'sdt', 'facebook', 'fb', 'liên lạc', 'zalo', 'số điện thoại'],
  response: () => ({
    type: 'text',
    content: '📞 **Thông tin liên hệ trực tiếp**\n\n' +
             '• **Email cá nhân:** nguyen229396@gmail.com\n' +
             '• **SĐT cá nhân:** 0387 762 696\n' +
             '• **Facebook cá nhân:** facebook.com/taynguyen.ha.9\n' +
             '• **Zalo:** 0387 762 696\n\n' +
             '• **Hotline hỗ trợ:** 1800-1234 (miễn phí)\n' +
             '• **Email hỗ trợ:** support@gopark.vn',
    buttons: [
      { text: '📧 Gửi email cá nhân', action: 'send_email', data: { email: 'nguyen229396@gmail.com' } },
      { text: '📱 Gọi ngay', action: 'call_now', data: { phone: '0387762696' } },
      { text: '👤 Facebook', action: 'open_facebook' },
      { text: '📞 Hotline hỗ trợ', action: 'call_support', data: { phone: '18001234' } },
    ]
  })
},

bookingGuide: {
  patterns: ['hướng dẫn đặt', 'cách đặt chỗ', 'làm sao đặt', 'đặt như thế nào', 'hướng dẫn sử dụng'],
  response: (userInfo) => {
    const isGuest = !userInfo.userId;
    const hasVehicle = userInfo.hasVehicle; // Cần truyền từ context
    
    let content = '📋 **Hướng dẫn đặt chỗ nhanh trên GoPark**\n\n';
    let buttons = [];
    
    if (isGuest) {
      content += '1. **Đăng ký tài khoản** (miễn phí)\n';
      content += '2. **Thêm thông tin xe** trong mục Thông tin cá nhân\n';
      content += '3. **Tìm bãi đỗ** theo vị trí/giá cả\n';
      content += '4. **Chọn vị trí & thời gian**\n';
      content += '5. **Thanh toán online** an toàn\n\n';
      content += '🎁 *Ưu đãi: Giảm 10% khi đặt online*';
      
      buttons = [
        { text: '📝 Đăng ký ngay', action: 'register' },
        { text: '🔍 Xem bãi xe trước', action: 'find_parking' },
      ];
    } else if (!hasVehicle) {
      content += '✅ **Bạn đã có tài khoản!**\n\n';
      content += '1. **Thêm thông tin xe** trong mục Thông tin cá nhân\n';
      content += '2. **Tìm bãi đỗ** theo vị trí/giá cả\n';
      content += '3. **Chọn vị trí & thời gian**\n';
      content += '4. **Thanh toán online** an toàn\n\n';
      content += '🚗 *Thêm xe để đặt chỗ nhanh hơn*';
      
      buttons = [
        { text: '🚗 Thêm xe ngay', action: 'add_vehicle' },
        { text: '🔍 Tìm bãi xe', action: 'find_parking' },
      ];
    } else {
      content += '🎉 **Bạn đã sẵn sàng đặt chỗ!**\n\n';
      content += '1. **Tìm bãi đỗ** theo vị trí/giá cả\n';
      content += '2. **Chọn vị trí & thời gian**\n';
      content += '3. **Chọn xe của bạn**\n';
      content += '4. **Thanh toán online**\n\n';
      content += '⚡ *Đặt chỗ chỉ trong 1 phút*';
      
      buttons = [
        { text: '🔍 Tìm bãi xe ngay', action: 'find_parking' },
        { text: '📋 Xem xe của tôi', action: 'my_vehicles' },
      ];
    }
    
    return {
      type: 'text',
      content: content,
      buttons: buttons
    };
  }
},
};

export function findMatchingPattern(message, userInfo) {
  const messageLower = message.toLowerCase().trim();
  
  for (const [key, pattern] of Object.entries(fallbackPatterns)) {
    if (pattern.requireAuth && !userInfo.userId) continue;
    
    const matched = pattern.patterns.some(p => messageLower.includes(p));
    if (matched) {
      return pattern.response(userInfo);
    }
  }
  
  // Default fallback
  return {
    type: 'text',
    content: '🤔 **Xin lỗi, tôi chưa hiểu**\n\nBạn có thể hỏi về:\n• Tìm bãi xe\n• Bảng giá\n• Đặt chỗ\n• Liên hệ hỗ trợ',
    buttons: [
      { text: '🔍 Tìm bãi xe', action: 'find_parking' },
      { text: '💰 Xem giá', action: 'view_price' },
      { text: '📞 Hỗ trợ', action: 'call_support' },
    ]
  };
}