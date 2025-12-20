// services/responseTemplates.service.js - TỐI GIẢN CHO CHATBOT NHỎ
export const responseTemplates = {
    // ==================== TEMPLATE VĂN BẢN NGẮN GỌN ====================
    text: (content, options = {}) => ({
        type: 'text',
        content,
        ...options,
    }),
    // ==================== TEMPLATE DANH SÁCH BÃI XE TỐI GIẢN ====================
    parkingList: (parkingLots, location) => {
        const formattedLots = parkingLots.map((lot, index) => ({
            id: lot._id,
            name: lot.name,
            address: lot.address,
            price: `${lot.pricePerHour?.toLocaleString() || '15,000'} VND/giờ`,
            available: lot.availableSlots
                ? `${lot.availableSlots} chỗ trống`
                : 'Đang kiểm tra',
            distance: lot.distanceText || null,
        }));
        return {
            type: 'parking_list',
            content: `Tìm thấy ${parkingLots.length} bãi xe ở ${location}:`,
            data: formattedLots,
            buttons: [
                {
                    text: '🗺️ Xem trên bản đồ',
                    action: 'open_map',
                    data: {
                        lots: formattedLots,
                        location: location
                    },
                },
                {
                    text: '📋 Xem chi tiết',
                    action: 'view_details',
                }
            ],
        };
    },
    // ==================== TEMPLATE ĐƠN GIẢN KHÁC ====================
    bookingSuccess: (bookingData) => ({
        type: 'text',
        content: `🎉 **Đặt chỗ thành công!**\n\n📍 ${bookingData.parkingName}\n🚗 Chỗ số: ${bookingData.slotNumber}\n⏰ ${bookingData.durationHours} giờ\n💰 ${bookingData.totalPrice?.toLocaleString()} VND\n\nVui lòng đến bãi đúng giờ và quét mã QR.`,
        buttons: [
            { text: '📱 Xem vé', action: 'view_ticket' },
            { text: '🗺️ Chỉ đường', action: 'navigate' },
        ],
    }),
    requireLogin: () => ({
        type: 'text',
        content: '🔒 **Bạn cần đăng nhập để đặt chỗ**\n\nĐăng nhập ngay để đặt chỗ nhanh chóng và nhận ưu đãi.',
        buttons: [
            { text: '🔐 Đăng nhập', action: 'login' },
            { text: '🔍 Xem bãi xe', action: 'find_parking' },
        ],
    }),
    contactInfo: () => ({
        type: 'text',
        content: '📞 **Liên hệ hỗ trợ**\n\n• Hotline: 1800-1234\n• Email: support@gopark.vn\n• Giờ làm việc: 8:00 - 22:00',
        buttons: [
            { text: '📱 Gọi ngay', action: 'call', data: { phone: '18001234' } },
        ],
    }),
    // ==================== LỊCH SỬ BOOKING ĐƠN GIẢN ====================
    bookingHistory: (bookings) => {
        const activeCount = bookings.filter(b => ['confirmed', 'checked-in'].includes(b.status)).length;
        return {
            type: 'text',
            content: `📋 **Lịch sử đặt chỗ**\n\n🟢 Đang hoạt động: ${activeCount}\n🔵 Đã hoàn thành: ${bookings.length - activeCount}`,
            buttons: [
                { text: '📍 Đến bãi xe', action: 'navigate_to_parking', disabled: activeCount === 0 },
                { text: '📱 Check-in QR', action: 'show_checkin_qr', disabled: activeCount === 0 },
            ],
        };
    },
    // ==================== THANH TOÁN ĐƠN GIẢN ====================
    paymentOptions: (amount) => ({
        type: 'text',
        content: `💳 **Thanh toán ${amount.toLocaleString()} VND**\n\nChọn phương thức:`,
        buttons: [
            { text: '💳 VNPay QR', action: 'vnpay_qr' },
            { text: '📱 MoMo', action: 'momo_pay' },
            { text: '💵 Tiền mặt tại bãi', action: 'cash_payment' },
        ],
    }),
};
// ==================== HÀM TRẢ LỜI NHANH TỐI GIẢN ====================
export const quickResponses = {
    noResultsFound: () => ({
        type: 'text',
        content: '😔 **Không tìm thấy bãi xe**\n\nVui lòng thử tìm ở khu vực khác hoặc liên hệ hỗ trợ.',
        buttons: [
            { text: '🔍 Tìm khu vực khác', action: 'find_other_area' },
            { text: '📞 Gọi hỗ trợ', action: 'call_support' },
        ],
    }),
    guestWelcome: () => ({
        type: 'text',
        content: '👋 **Chào bạn!**\n\nTôi có thể giúp bạn tìm bãi xe, xem giá cả, và hỗ trợ đặt chỗ.\n\n*Đăng nhập để đặt chỗ nhanh hơn!*',
        buttons: [
            { text: '🔍 Tìm bãi xe', action: 'find_parking' },
            { text: '🔓 Đăng nhập', action: 'login' },
        ],
    }),
};
//# sourceMappingURL=responseTemplates.service.js.map