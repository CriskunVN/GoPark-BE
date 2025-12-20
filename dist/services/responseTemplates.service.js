// các mẫu trả lời chatbot dựa trên vai trò người dùng
export const responseTemplates = {
    // ==================== TEMPLATE VĂN BẢN ====================
    text: (content, options = {}) => ({
        type: 'text',
        content,
        ...options
    }),
    // ==================== TEMPLATE DANH SÁCH BÃI XE ====================
    parkingList: (parkingLots, location, options = {}) => {
        const formattedLots = parkingLots.map((lot, index) => ({
            id: lot._id,
            name: lot.name,
            address: lot.address,
            price: `${lot.pricePerHour?.toLocaleString() || '15,000'} VND/giờ`,
            rating: lot.rating ? `⭐ ${lot.rating.toFixed(1)}` : 'Chưa có đánh giá',
            available: lot.availableSlots ? `${lot.availableSlots} chỗ trống` : 'Đang kiểm tra',
            distance: lot.distance ? `${lot.distance.toFixed(1)} km` : null,
            image: lot.images?.[0] || lot.image?.[0] || null,
            hasPayment: lot.allowedPaymentMethods || ['prepaid', 'pay-at-parking']
        }));
        return {
            type: 'parking_list',
            content: `Tìm thấy ${parkingLots.length} bãi xe ở ${location}:`,
            data: formattedLots,
            buttons: [
                { text: '📍 Xem trên bản đồ', action: 'show_map', data: { lots: formattedLots } },
                { text: '💰 Lọc theo giá thấp', action: 'filter_price_low' },
                { text: '⭐ Lọc theo đánh giá', action: 'filter_rating_high' },
                { text: '🎯 Gần tôi nhất', action: 'filter_nearest' }
            ],
            quickReplies: [
                'Bãi xe rẻ nhất',
                'Bãi xe nhiều chỗ trống',
                'Bãi xe 24/7',
                'Có camera an ninh'
            ],
            ...options
        };
    },
    // ==================== TEMPLATE FORM ĐẶT CHỖ ====================
    bookingForm: (parkingLot, availableSlot, userId) => {
        const basePrice = parkingLot.pricePerHour || 15000;
        return {
            type: 'booking_form',
            content: `Bạn muốn đặt chỗ tại **${parkingLot.name}**`,
            data: {
                parkingLotId: parkingLot._id,
                parkingLotName: parkingLot.name,
                slotId: availableSlot._id,
                slotNumber: availableSlot.slotNumber,
                zone: availableSlot.zone,
                pricePerHour: basePrice,
                address: parkingLot.address,
                estimatedPrice: `${(basePrice * 2).toLocaleString()} VND (2 giờ)`,
                paymentMethods: parkingLot.allowedPaymentMethods || ['prepaid', 'pay-at-parking'],
                requiresLogin: !userId,
                userId: userId
            },
            steps: [
                { step: 1, title: 'Chọn thời gian', completed: false },
                { step: 2, title: 'Chọn xe', completed: false },
                { step: 3, title: 'Thanh toán', completed: false }
            ],
            buttons: [
                {
                    text: '⏰ Chọn giờ',
                    action: 'select_time',
                    data: {
                        slotId: availableSlot._id,
                        minHours: 1,
                        maxHours: 24
                    }
                },
                {
                    text: '🚗 Chọn xe của tôi',
                    action: 'select_vehicle',
                    data: { userId }
                },
                {
                    text: '📋 Xem chi tiết bãi',
                    action: 'view_parking_detail',
                    data: { parkingLotId: parkingLot._id }
                }
            ]
        };
    },
    // ==================== TEMPLATE XÁC NHẬN ĐẶT CHỖ ====================
    confirmBooking: (bookingDetails) => ({
        type: 'confirm_booking',
        content: `🎯 **Xác nhận đặt chỗ**\n\n📍 **Bãi xe:** ${bookingDetails.parkingLotName}\n🚗 **Chỗ số:** ${bookingDetails.slotNumber}\n⏰ **Thời gian:** ${bookingDetails.startTime} - ${bookingDetails.endTime}\n💰 **Tổng tiền:** ${bookingDetails.totalAmount.toLocaleString()} VND`,
        data: bookingDetails,
        buttons: [
            {
                text: '✅ Xác nhận đặt ngay',
                action: 'confirm_booking_now',
                data: {
                    slotId: bookingDetails.slotId,
                    startTime: bookingDetails.startTime,
                    endTime: bookingDetails.endTime,
                    vehicleId: bookingDetails.vehicleId,
                    paymentMethod: 'prepaid'
                }
            },
            {
                text: '✏️ Sửa thời gian',
                action: 'edit_time'
            },
            {
                text: '🚗 Đổi xe',
                action: 'change_vehicle'
            },
            {
                text: '❌ Hủy',
                action: 'cancel_booking_process'
            }
        ]
    }),
    // ==================== TEMPLATE LỊCH SỬ BOOKING ====================
    bookingHistory: (bookings, userId) => {
        const activeBookings = bookings.filter(b => ['confirmed', 'checked-in'].includes(b.status));
        const pastBookings = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));
        return {
            type: 'booking_history',
            content: `📋 **Lịch sử đặt chỗ của bạn**\n\n🟢 Đang hoạt động: ${activeBookings.length}\n🔵 Đã hoàn thành: ${pastBookings.length}`,
            data: {
                active: activeBookings.map(b => ({
                    id: b._id,
                    parkingLot: b.parkingLotId?.name || 'Unknown',
                    slot: b.parkingSlotId?.slotNumber || 'N/A',
                    time: `${new Date(b.startTime).toLocaleString('vi-VN')}`,
                    status: b.status,
                    amount: b.totalPrice ? `${b.totalPrice.toLocaleString()} VND` : 'Chưa thanh toán',
                    canCheckIn: b.status === 'confirmed',
                    canCancel: b.status === 'confirmed'
                })),
                past: pastBookings.map(b => ({
                    id: b._id,
                    parkingLot: b.parkingLotId?.name || 'Unknown',
                    time: new Date(b.startTime).toLocaleDateString('vi-VN'),
                    status: b.status,
                    amount: b.totalPrice ? `${b.totalPrice.toLocaleString()} VND` : 'Miễn phí'
                }))
            },
            buttons: [
                { text: '📍 Đến bãi xe', action: 'navigate_to_parking', disabled: activeBookings.length === 0 },
                { text: '📱 Check-in QR', action: 'show_checkin_qr', disabled: activeBookings.length === 0 },
                { text: '📊 Xem chi tiết', action: 'view_booking_details' }
            ]
        };
    },
    // ==================== TEMPLATE THANH TOÁN ====================
    paymentOptions: (amount, bookingId, paymentMethods = ['prepaid', 'pay-at-parking']) => ({
        type: 'payment_options',
        content: `💳 **Thanh toán ${amount.toLocaleString()} VND**\n\nChọn phương thức thanh toán:`,
        data: {
            amount,
            bookingId,
            currency: 'VND'
        },
        options: [
            {
                id: 'vnpay',
                name: 'VNPay QR Code',
                icon: 'qr',
                description: 'Quét QR thanh toán ngay',
                available: paymentMethods.includes('prepaid')
            },
            {
                id: 'momo',
                name: 'Ví MoMo',
                icon: 'wallet',
                description: 'Thanh toán qua ví điện tử',
                available: paymentMethods.includes('prepaid')
            },
            {
                id: 'cash',
                name: 'Tiền mặt tại bãi',
                icon: 'cash',
                description: 'Thanh toán khi đến bãi',
                available: paymentMethods.includes('pay-at-parking')
            },
            {
                id: 'bank',
                name: 'Chuyển khoản ngân hàng',
                icon: 'bank',
                description: 'Chuyển khoản qua Internet Banking',
                available: paymentMethods.includes('prepaid')
            }
        ],
        buttons: [
            { text: '💳 Thanh toán ngay', action: 'process_payment', primary: true },
            { text: '📧 Gửi hóa đơn email', action: 'send_invoice_email' },
            { text: '🕐 Thanh toán sau', action: 'pay_later' }
        ]
    }),
    // ==================== TEMPLATE THÔNG BÁO ====================
    notification: (title, message, type = 'info') => ({
        type: 'notification',
        content: message,
        data: {
            title,
            type, // 'success', 'error', 'warning', 'info'
            timestamp: new Date().toISOString()
        },
        buttons: type === 'error' ? [
            { text: '🔄 Thử lại', action: 'retry' },
            { text: '📞 Liên hệ hỗ trợ', action: 'contact_support' }
        ] : []
    }),
    // ==================== TEMPLATE LIÊN HỆ ====================
    contactInfo: () => ({
        type: 'contact_info',
        content: `📞 **Liên hệ hỗ trợ GoPark**\n\n• Hotline: 1800-1234 (Miễn phí)\n• Email: support@gopark.vn\n• Zalo OA: @GoParkSupport\n• Giờ làm việc: 8:00 - 22:00 hàng ngày`,
        buttons: [
            { text: '📱 Gọi ngay', action: 'call', data: { phone: '18001234' } },
            { text: '📧 Gửi email', action: 'email', data: { email: 'support@gopark.vn' } },
            { text: '🗺️ Đến trụ sở', action: 'navigate', data: { address: 'Hà Nội, Việt Nam' } },
            { text: '💬 Chat với CSKH', action: 'live_chat' }
        ]
    }),
    // ==================== TEMPLATE HƯỚNG DẪN ====================
    tutorial: (step = 1) => {
        const steps = [
            {
                title: 'Bước 1: Tìm bãi xe',
                content: 'Nhập vị trí hoặc cho phép định vị để tìm bãi xe gần bạn',
                image: 'https://example.com/step1.jpg'
            },
            {
                title: 'Bước 2: Chọn chỗ & giờ',
                content: 'Chọn chỗ đỗ phù hợp và thời gian bạn muốn đặt',
                image: 'https://example.com/step2.jpg'
            },
            {
                title: 'Bước 3: Thanh toán',
                content: 'Thanh toán online hoặc chọn thanh toán tại bãi',
                image: 'https://example.com/step3.jpg'
            },
            {
                title: 'Bước 4: Check-in',
                content: 'Đến bãi và quét QR code để vào bãi',
                image: 'https://example.com/step4.jpg'
            }
        ];
        return {
            type: 'tutorial',
            content: `🚗 **Hướng dẫn sử dụng GoPark**\n\n${steps[step - 1].title}\n${steps[step - 1].content}`,
            data: {
                currentStep: step,
                totalSteps: steps.length,
                steps: steps
            },
            buttons: [
                { text: '⬅️ Trước', action: 'prev_step', disabled: step === 1 },
                { text: step === steps.length ? '🎉 Bắt đầu' : 'Tiếp ➡️', action: step === steps.length ? 'start_booking' : 'next_step' },
                { text: '📖 Xem tất cả', action: 'view_all_steps' }
            ]
        };
    }
};
// ==================== HÀM TRẢ LỜI NHANH ====================
export const quickResponses = {
    // Phản hồi cho intent không tìm thấy bãi xe
    noParkingFound: (location) => `Không tìm thấy bãi xe nào ở ${location}. Bạn có thể thử:\n• Mở rộng phạm vi tìm kiếm\n• Thử tìm ở khu vực khác\n• Liên hệ hỗ trợ để được tư vấn`,
    // Yêu cầu đăng nhập
    requireLogin: () => `🔒 **Bạn cần đăng nhập để sử dụng tính năng này**\n\nVui lòng đăng nhập để:\n• Đặt chỗ nhanh chóng\n• Lưu thông tin xe\n• Xem lịch sử đặt chỗ\n• Nhận ưu đãi đặc biệt`,
    // Không có chỗ trống
    noSlotsAvailable: (parkingLotName) => `😔 **${parkingLotName} hiện đã hết chỗ trống**\n\nBạn có thể:\n• Thử đặt ở bãi xe khác gần đó\n• Đặt trước cho khung giờ sau\n• Đặt chỗ theo tháng (nếu có)`,
    // Booking thành công
    bookingSuccess: (bookingId, parkingLotName, slotNumber) => `🎉 **Đặt chỗ thành công!**\n\n📍 Bãi xe: ${parkingLotName}\n🚗 Chỗ số: ${slotNumber}\n📱 Mã booking: ${bookingId}\n\nVui lòng đến bãi xe đúng giờ và quét mã QR để check-in.`,
    // Lỗi hệ thống
    systemError: () => `⚠️ **Có lỗi xảy ra**\n\nHệ thống đang gặp sự cố tạm thời. Vui lòng:\n1. Thử lại sau ít phút\n2. Liên hệ hotline: 1800-1234\n3. Sử dụng tính năng đặt chỗ thủ công`
};
//# sourceMappingURL=responseTemplates.service.js.map