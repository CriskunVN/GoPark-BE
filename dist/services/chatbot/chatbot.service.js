import User from '../../models/user.model.js';
import Booking from '../../models/booking.model.js';
import ParkingLot from '../../models/parkinglot.model.js';
import ParkingSlot from '../../models/parkingSlot.model.js';
import Vehicle from '../../models/vehicles.model.js';
import ChatHistory from '../../models/chatHistory.model.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { handleFindParking, handleMyBookings, handleMyVehicles, handlePriceInfo, handleContactInfo, } from './intelligentHandler.service.js';
import { findMatchingPattern } from './fallbackResponses.service.js';
dotenv.config({ path: './config.env' });
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=';
// ==================== IN-MEMORY SESSION STORE ====================
// Đơn giản: lưu session trong RAM (có thể chuyển sang Redis sau)
const chatSessions = new Map(); // Map<sessionId, sessionData>
async function askGeminiAIWithContext(message, session) {
    try {
        console.log('🔧 [DEBUG] Gemini API call starting...');
        console.log('🔧 [DEBUG] API Key exists:', !!GEMINI_API_KEY);
        // THÊM KIỂM TRA API KEY
        if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '') {
            console.error('❌ [DEBUG] GEMINI_API_KEY is empty or missing!');
            return getSmartFallback(message, session);
        }
        // KIỂM TRA ĐỊNH DẠNG API KEY
        if (!GEMINI_API_KEY.startsWith('AIza')) {
            console.error('❌ [DEBUG] API Key format invalid. Should start with "AIza"');
        }
        const contextString = buildContextString(session);
        const prompt = `Bạn là trợ lý AI của GoPark - hệ thống đặt chỗ bãi đỗ xe.
HỘI THOẠI TRƯỚC: ${contextString}
NGƯỜI DÙNG: ${session.userId ? 'Đã đăng nhập' : 'Khách vãng lai'}

HÃY trả lời câu hỏi sau đây bằng tiếng Việt, ngắn gọn, thân thiện:
"${message}"`;
        console.log('🔧 [DEBUG] Prompt length:', prompt.length, 'chars');
        // ========== SỬA URL GỌI API ==========
        // CÁCH 1: Dùng URL đã có key
        const apiUrlWithKey = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${GEMINI_API_KEY}`;
        // HOẶC CÁCH 2: Dùng header Authorization
        // const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent";
        console.log('🔧 [DEBUG] Calling API... URL length:', apiUrlWithKey.length);
        // Gọi API với URL đã có key
        const response = await fetch(apiUrlWithKey, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Nếu dùng CÁCH 2, thêm header này:
                // 'Authorization': `Bearer ${GEMINI_API_KEY}`
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: prompt }],
                    },
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 200,
                    topP: 0.8,
                    topK: 40,
                },
                safetySettings: [
                    {
                        category: 'HARM_CATEGORY_HARASSMENT',
                        threshold: 'BLOCK_ONLY_HIGH',
                    },
                ],
            }),
        });
        // ========== XỬ LÝ RESPONSE ==========
        console.log('🔧 [DEBUG] Response status:', response.status, response.statusText);
        const responseText = await response.text();
        console.log('🔧 [DEBUG] Response text (first 500 chars):', responseText.substring(0, 500));
        if (!response.ok) {
            // Xử lý lỗi chi tiết
            let errorDetails = 'Không thể đọc error details';
            try {
                const errorJson = JSON.parse(responseText);
                errorDetails = JSON.stringify(errorJson, null, 2);
                // LOG CHI TIẾT LỖI
                console.error('❌ [DEBUG] Gemini API ERROR:', {
                    status: response.status,
                    message: errorJson.error?.message,
                    statusText: errorJson.error?.status,
                    details: errorJson.error?.details,
                });
            }
            catch (e) {
                errorDetails = responseText;
            }
            // Phân loại lỗi
            if (response.status === 400) {
                const errorMsg = errorDetails.toLowerCase();
                if (errorMsg.includes('api key not valid') ||
                    errorMsg.includes('invalid api key')) {
                    console.error('❌ API KEY KHÔNG HỢP LỆ!');
                    console.error('❌ Hãy kiểm tra:');
                    console.error('   1. API key có đúng không?');
                    console.error('   2. API key đã được enable chưa?');
                    console.error('   3. Vào Google Cloud Console > APIs & Services > Credentials');
                    console.error('   4. Enable "Generative Language API" trong Library');
                }
                throw new Error(`400 Bad Request: ${errorDetails.substring(0, 200)}`);
            }
            throw new Error(`API Error ${response.status}: ${errorDetails.substring(0, 300)}`);
        }
        // Parse JSON khi response OK
        let data;
        try {
            data = JSON.parse(responseText);
        }
        catch (parseError) {
            console.error('❌ [DEBUG] Failed to parse JSON:', parseError);
            throw new Error('Invalid JSON response');
        }
        console.log('🔧 [DEBUG] Response structure:', {
            hasCandidates: !!data.candidates,
            candidatesCount: data.candidates?.length || 0,
        });
        // Lấy text response
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!aiText) {
            console.error('❌ [DEBUG] No AI text in response:', JSON.stringify(data, null, 2));
            return 'Xin lỗi, tôi không nhận được phản hồi từ AI.';
        }
        console.log('✅ [DEBUG] AI Response received:', aiText.substring(0, 100) + '...');
        return aiText;
    }
    catch (error) {
        console.error('❌ [DEBUG] Gemini process error:', {
            message: error.message,
            stack: error.stack,
        });
        // Fallback
        return getSmartFallback(message, session);
    }
}
function getSmartFallback(message, session) {
    // Dùng intelligent fallback system
    const userInfo = {
        userId: session.userId,
        role: session.type,
        name: session.userName || 'bạn',
    };
    return findMatchingPattern(message, userInfo);
}
// ==================== SESSION MANAGEMENT ====================
export function createOrGetSession(sessionId, userId = null) {
    if (!chatSessions.has(sessionId)) {
        const sessionData = {
            id: sessionId,
            userId: userId,
            type: userId ? 'user' : 'guest',
            createdAt: new Date(),
            lastActivity: new Date(),
            context: {
                currentIntent: null,
                pendingData: {}, // Dữ liệu tạm thời (ví dụ: booking đang tạo)
                intentHistory: [], // Lịch sử 5 intent gần nhất
                entities: {}, // Thông tin trích xuất (ví dụ: location, time)
                conversationStack: [], // Stack cuộc hội thoại (cho multi-step)
            },
            messageCount: 0,
            tempData: {}, // Dữ liệu tạm thời sẽ xóa khi session end
        };
        chatSessions.set(sessionId, sessionData);
        console.log(`🆕 Tạo session mới: ${sessionId} (${sessionData.type})`);
    }
    // Cập nhật last activity
    const session = chatSessions.get(sessionId);
    session.lastActivity = new Date();
    session.messageCount++;
    return session;
}
export function updateSessionContext(sessionId, updates) {
    const session = chatSessions.get(sessionId);
    if (session) {
        Object.assign(session.context, updates);
        // Giữ lịch sử intent (max 5)
        if (updates.currentIntent) {
            session.context.intentHistory.unshift({
                intent: updates.currentIntent,
                timestamp: new Date(),
            });
            if (session.context.intentHistory.length > 5) {
                session.context.intentHistory.pop();
            }
        }
    }
    return session;
}
export function getSession(sessionId) {
    return chatSessions.get(sessionId);
}
export function clearSession(sessionId) {
    if (chatSessions.has(sessionId)) {
        console.log(`🧹 Xóa session: ${sessionId}`);
        // Lưu các thông tin quan trọng vào database trước khi xóa
        const session = chatSessions.get(sessionId);
        if (session.context.pendingData.bookingId) {
            console.log(`💾 Lưu pending booking: ${session.context.pendingData.bookingId}`);
            // Có thể lưu vào database ở đây
        }
        chatSessions.delete(sessionId);
        return true;
    }
    return false;
}
// Tự động dọn session cũ (mỗi 24h)
setInterval(() => {
    const now = new Date();
    const hours24 = 24 * 60 * 60 * 1000;
    for (const [sessionId, session] of chatSessions.entries()) {
        if (now - session.lastActivity > hours24) {
            console.log(`🕒 Xóa session cũ: ${sessionId}`);
            chatSessions.delete(sessionId);
        }
    }
}, 60 * 60 * 1000); // Kiểm tra mỗi giờ
// ==================== CONTEXT-AWARE INTENT DETECTION ====================
export async function detectIntent(message, sessionContext = null) {
    const messageLower = message.toLowerCase().trim();
    // Nếu có context trước đó, ưu tiên continue intent
    if (sessionContext?.currentIntent &&
        isRelatedToPrevious(messageLower, sessionContext)) {
        console.log(`🔄 Tiếp tục intent: ${sessionContext.currentIntent}`);
        return sessionContext.currentIntent;
    }
    // Intent với priority
    const intents = [
        {
            name: 'find_parking',
            patterns: [
                'tìm bãi',
                'tìm chỗ đỗ',
                'bãi gần',
                'còn chỗ không',
                'parking',
                'bãi xe',
                'đỗ xe',
                'chỗ trống',
                'bãi đỗ',
                'chỗ đậu',
            ],
            priority: 10,
        },
        {
            name: 'my_vehicles',
            patterns: ['xe của tôi', 'my vehicle', 'danh sách xe', 'xe đã lưu'],
            priority: 8,
        },
        {
            name: 'book_slot',
            patterns: [
                'đặt chỗ',
                'đặt bãi',
                'book',
                'giữ chỗ',
                'muốn đặt',
                'reserve',
                'booking',
                'chỗ đỗ',
            ],
            priority: 10,
        },
        {
            name: 'find_parking',
            patterns: [
                'tìm bãi',
                'tìm chỗ đỗ',
                'bãi gần',
                'còn chỗ không',
                'parking',
                'bãi xe',
                'đỗ xe',
                'chỗ trống',
            ],
            priority: 9,
        },
        {
            name: 'my_bookings',
            patterns: [
                'lịch sử đặt',
                'booking của tôi',
                'đã đặt',
                'my bookings',
                'đang đặt',
                'đặt trước đây',
            ],
            priority: 8,
        },
        {
            name: 'payment',
            patterns: [
                'thanh toán',
                'giá tiền',
                'bao nhiêu tiền',
                'phí đỗ',
                'payment',
                'tính tiền',
                'hóa đơn',
                'trả tiền',
            ],
            priority: 7,
        },
        {
            name: 'cancel',
            patterns: [
                'hủy đặt',
                'hủy booking',
                'cancel',
                'xóa đặt',
                'không đặt nữa',
                'dừng đặt',
            ],
            priority: 6,
        },
        {
            name: 'check_in',
            patterns: [
                'check-in',
                'tôi đã đến',
                'quét mã',
                'vào bãi',
                'scan qr',
                'mã qr',
                'checkin',
            ],
            priority: 6,
        },
        {
            name: 'help',
            patterns: [
                'hỗ trợ',
                'giúp đỡ',
                'help',
                'làm sao',
                'hướng dẫn',
                'sử dụng',
                'cách dùng',
            ],
            priority: 5,
        },
        {
            name: 'contact',
            patterns: [
                'liên hệ',
                'hotline',
                'số điện thoại',
                'email',
                'khiếu nại',
                'gặp nhân viên',
            ],
            priority: 4,
        },
        {
            name: 'time',
            patterns: [
                'mấy giờ',
                'giờ đóng',
                'giờ mở',
                '24/7',
                'hoạt động',
                'thời gian',
            ],
            priority: 3,
        },
        {
            name: 'price',
            patterns: [
                'giá cả',
                'bao nhiêu',
                'đắt không',
                'rẻ',
                'giảm giá',
                'khuyến mãi',
                'promotion',
            ],
            priority: 3,
        },
        {
            name: 'find_nearby_parking',
            patterns: ['gần đây', 'quanh đây', 'gần tôi', 'nearby', 'quanh tôi', 'quanh khu vực'],
            priority: 9,
        },
        {
            name: 'find_cheap_parking',
            patterns: ['rẻ nhất', 'giá rẻ', 'giá tốt', 'lọc giá rẻ', 'bãi rẻ', 'giá thấp'],
            priority: 8,
        },
        {
            name: 'find_parking_with_features',
            patterns: ['có camera', 'có bảo vệ', '24/7', 'che mưa', 'có mái che', 'an toàn'],
            priority: 7,
        }
    ];
    // Tìm intent với priority cao nhất
    let detectedIntent = null;
    let highestPriority = 0;
    for (const intent of intents) {
        for (const pattern of intent.patterns) {
            if (messageLower.includes(pattern) && intent.priority > highestPriority) {
                detectedIntent = intent.name;
                highestPriority = intent.priority;
                break;
            }
        }
        if (detectedIntent)
            break;
    }
    // ENTITY EXTRACTION (trích xuất thông tin từ tin nhắn)
    const entities = extractEntities(message);
    return {
        intent: detectedIntent || 'general_question',
        entities: entities,
        confidence: detectedIntent ? 0.9 : 0.3,
    };
}
function isRelatedToPrevious(message, context) {
    // Kiểm tra tin nhắn có liên quan đến intent trước không
    const previousIntent = context.currentIntent;
    if (!previousIntent)
        return false;
    // Mapping các từ khóa continue
    const continueKeywords = {
        book_slot: [
            'có',
            'được',
            'ok',
            'đồng ý',
            'tiếp tục',
            'xong',
            'đặt',
            'giờ',
            'xe',
            'thanh toán',
        ],
        find_parking: [
            'khác',
            'nữa',
            'tiếp',
            'khác đi',
            'nhiều hơn',
            'xa hơn',
            'rẻ hơn',
        ],
        payment: ['card', 'momo', 'vnpay', 'chuyển khoản', 'tiền mặt', 'qr'],
    };
    const keywords = continueKeywords[previousIntent] || [];
    return keywords.some((keyword) => message.includes(keyword));
}
function extractEntities(message) {
    const entities = {};
    const messageLower = message.toLowerCase();
    // Extract location
    const locations = {
        'hà nội': 'hanoi',
        hanoi: 'hanoi',
        'đà nẵng': 'danang',
        danang: 'danang',
        'hồ chí minh': 'hcm',
        hcm: 'hcm',
        'sài gòn': 'hcm',
        saigon: 'hcm',
    };
    for (const [keyword, code] of Object.entries(locations)) {
        if (messageLower.includes(keyword)) {
            entities.location = code;
            entities.locationName = keyword;
            break;
        }
    }
    // Extract time
    const timePatterns = [
        { regex: /(\d+)\s*giờ/, entity: 'hours' },
        { regex: /(\d+)\s*phút/, entity: 'minutes' },
        { regex: /(\d+)\s*ngày/, entity: 'days' },
        { regex: /sáng|chiều|tối|trưa/, entity: 'timeOfDay' },
    ];
    for (const pattern of timePatterns) {
        const match = messageLower.match(pattern.regex);
        if (match) {
            entities[pattern.entity] =
                pattern.entity === 'timeOfDay' ? match[0] : parseInt(match[1]);
        }
    }
    // Extract price range
    const priceMatch = messageLower.match(/(\d+)\s*(k|ngàn|nghìn|triệu)/);
    if (priceMatch) {
        let value = parseInt(priceMatch[1]);
        if (priceMatch[2].includes('triệu'))
            value *= 1000000;
        else if (priceMatch[2].includes('k') ||
            priceMatch[2].includes('ngàn') ||
            priceMatch[2].includes('nghìn')) {
            value *= 1000;
        }
        entities.priceRange = value;
    }
    return entities;
}
// ==================== CONTEXT-AWARE RESPONSE TEMPLATES ====================
const responseTemplates = {
    text: (content, options = {}) => ({
        type: 'text',
        content,
        ...options,
    }),
    parkingList: (parkingLots, context) => {
        const location = context.entities?.locationName || 'khu vực của bạn';
        return {
            type: 'parking_list',
            content: `Tìm thấy ${parkingLots.length} bãi xe ở ${location}:`,
            data: parkingLots.map((lot) => ({
                id: lot._id,
                name: lot.name,
                address: lot.address,
                price: `${lot.pricePerHour?.toLocaleString() || '15,000'} VND/giờ`,
                available: lot.availableSlots
                    ? `${lot.availableSlots} chỗ trống`
                    : 'Đang kiểm tra',
                hasPayment: lot.allowedPaymentMethods || ['prepaid', 'pay-at-parking'],
            })),
            buttons: [
                { text: '📍 Xem bản đồ', action: 'show_map' },
                { text: '💰 Giá thấp nhất', action: 'filter_price_low' },
                { text: '🎯 Gần nhất', action: 'filter_nearest' },
            ],
            context: {
                action: 'select_parking',
                data: { parkingLots },
            },
        };
    },
    bookingForm: (parkingLot, slot, context) => {
        const session = context.session;
        return {
            type: 'booking_form',
            content: `Bạn muốn đặt chỗ tại **${parkingLot.name}** - Chỗ số ${slot.slotNumber}`,
            data: {
                parkingLotId: parkingLot._id,
                parkingLotName: parkingLot.name,
                slotId: slot._id,
                slotNumber: slot.slotNumber,
                pricePerHour: parkingLot.pricePerHour || 15000,
                requiresLogin: !session?.userId,
            },
            steps: [
                { step: 1, title: 'Chọn thời gian', completed: false },
                { step: 2, title: 'Chọn xe', completed: false },
                { step: 3, title: 'Xác nhận', completed: false },
            ],
            buttons: [
                {
                    text: '⏰ Chọn giờ',
                    action: 'select_time',
                    data: { slotId: slot._id },
                },
                {
                    text: '🚗 Chọn xe',
                    action: 'select_vehicle',
                    disabled: !session?.userId,
                },
            ],
            context: {
                action: 'booking_in_progress',
                step: 1,
                data: { parkingLotId: parkingLot._id, slotId: slot._id },
            },
        };
    },
    requireLogin: () => ({
        type: 'text',
        content: `🔒 **Bạn cần đăng nhập để tiếp tục**\n\nVui lòng đăng nhập để:\n• Đặt chỗ nhanh chóng\n• Lưu thông tin xe\n• Xem lịch sử đặt chỗ\n• Nhận ưu đãi đặc biệt`,
        requiresLogin: true,
        buttons: [
            { text: '🔐 Đăng nhập ngay', action: 'login' },
            { text: '📋 Xem bãi xe trước', action: 'browse_parking' },
        ],
    }),
    continueBooking: (context) => {
        const step = context.step || 1;
        const steps = [
            {
                title: 'Chọn thời gian',
                question: 'Bạn muốn đặt từ mấy giờ đến mấy giờ?',
            },
            { title: 'Chọn xe', question: 'Bạn muốn đặt cho xe nào?' },
            { title: 'Xác nhận', question: 'Xác nhận đặt chỗ với thông tin trên?' },
        ];
        return {
            type: 'continue_prompt',
            content: `🔄 **Tiếp tục đặt chỗ**\n\nBước ${step}: ${steps[step - 1].title}\n${steps[step - 1].question}`,
            data: { step, totalSteps: steps.length },
            buttons: step === 1
                ? [
                    {
                        text: '⏰ 2 giờ (14:00-16:00)',
                        action: 'set_time',
                        data: { hours: 2 },
                    },
                    {
                        text: '⏰ 4 giờ (14:00-18:00)',
                        action: 'set_time',
                        data: { hours: 4 },
                    },
                    { text: '✏️ Nhập giờ khác', action: 'custom_time' },
                ]
                : step === 2
                    ? [
                        { text: '🚗 Xe của tôi', action: 'my_vehicles' },
                        { text: '➕ Thêm xe mới', action: 'add_vehicle' },
                    ]
                    : [
                        { text: '✅ Xác nhận đặt', action: 'confirm_booking' },
                        { text: '✏️ Sửa thông tin', action: 'edit_info' },
                    ],
        };
    },
};
// ==================== MAIN PROCESS FUNCTION WITH CONTEXT ====================
export async function processMessage(message, sessionId, userId = null) {
    console.log('🔍 Processing:', {
        message: message.substring(0, 100),
        sessionId,
        userId: userId || 'guest',
    });
    try {
        // 1. Quản lý session
        const session = createOrGetSession(sessionId, userId);
        // 2. Detect intent với context
        const intentResult = await detectIntent(message, session.context);
        const { intent, entities } = intentResult;
        // 3. Cập nhật context với intent mới và entities
        updateSessionContext(sessionId, {
            currentIntent: intent,
            entities: { ...session.context.entities, ...entities },
        });
        console.log('✅ Intent:', intent, 'Entities:', entities);
        // 4. Kiểm tra nếu đang trong multi-step flow
        if (session.context.conversationStack.length > 0) {
            const lastStep = session.context.conversationStack[session.context.conversationStack.length - 1];
            const stepResponse = await handleConversationStep(message, session, lastStep);
            if (stepResponse) {
                return prepareResponse(stepResponse, 'conversation_flow', intent, session);
            }
        }
        // 5. Xử lý theo intent với context
        let response;
        switch (intent) {
            case 'find_parking':
                response = await handleFindParking(message, session);
                break;
            case 'book_slot':
                response = await handleBookSlotWithContext(message, session);
                break;
            case 'my_bookings':
                if (!session.userId) {
                    response = responseTemplates.requireLogin();
                }
                else {
                    response = await handleMyBookings(session.userId);
                }
                break;
            case 'my_vehicles':
                if (!session.userId) {
                    response = responseTemplates.requireLogin();
                }
                else {
                    response = await handleMyVehicles(session.userId);
                }
                break;
            case 'payment':
                response = await handlePaymentWithContext(message, session);
                break;
            case 'find_cheap_parking': // THÊM CASE NÀY
                response = await handleFindCheapParking(message, session);
                break;
            case 'price':
                response = handlePriceInfo();
                break;
            case 'help':
                response = responseTemplates.text(`🚗 **Hướng dẫn sử dụng GoPark**\n\n1. Tìm bãi xe\n2. Chọn chỗ & giờ\n3. Thanh toán\n4. Check-in QR\n\nBạn cần hướng dẫn chi tiết phần nào?`);
                break;
            case 'contact':
                response = handleContactInfo();
                break;
            default:
                // Thử fallback trước, nếu không được mới dùng AI
                const fallbackResponse = findMatchingPattern(message, {
                    userId: session.userId,
                    role: session.type,
                    name: session.userName,
                });
                if (fallbackResponse.type !== 'text' ||
                    !fallbackResponse.content.includes('chưa hiểu')) {
                    response = fallbackResponse;
                }
                else {
                    // Dùng Gemini cho câu hỏi phức tạp
                    response = await askGeminiAIWithContext(message, session);
                }
        }
        // 6. Chuẩn bị và trả về response
        return prepareResponse(response, 'business_logic', intent, session);
    }
    catch (error) {
        console.error('❌ Error processing message:', error);
        return {
            source: 'error',
            response: responseTemplates.text('⚠️ Có lỗi xảy ra. Vui lòng thử lại sau.'),
            intent: 'error',
            sessionId,
            timestamp: new Date().toISOString(),
        };
    }
}
// ==================== HANDLERS WITH CONTEXT ====================
async function handleFindParkingWithContext(message, session) {
    const location = session.context.entities?.location || 'hanoi';
    const locationName = session.context.entities?.locationName || 'Hà Nội';
    const parkingLots = await ParkingLot.find({
        status: 'active',
        isActive: true,
        'address.city': { $regex: locationName, $options: 'i' },
    })
        .sort({ rating: -1 })
        .limit(5)
        .lean();
    // Tính available slots
    for (const lot of parkingLots) {
        lot.availableSlots = await ParkingSlot.countDocuments({
            parkingLot: lot._id,
            status: 'available',
        });
    }
    // Lưu vào session context để dùng cho các bước sau
    updateSessionContext(session.id, {
        pendingData: {
            ...session.context.pendingData,
            searchResults: parkingLots.map((l) => l._id),
            location: locationName,
        },
    });
    return responseTemplates.parkingList(parkingLots, session.context);
}
async function handleBookSlotWithContext(message, session) {
    // Kiểm tra đăng nhập
    if (!session.userId) {
        return responseTemplates.requireLogin();
    }
    // Nếu đang trong flow booking, tiếp tục
    if (session.context.pendingData.bookingStep) {
        return handleBookingStep(message, session);
    }
    // Extract parking ID từ message hoặc context
    let parkingId = null;
    // Tìm trong message
    const idMatch = message.match(/\b[0-9a-fA-F]{24}\b/);
    if (idMatch)
        parkingId = idMatch[0];
    // Nếu không có trong message, lấy từ search results trước đó
    if (!parkingId && session.context.pendingData.searchResults?.length > 0) {
        // Gợi ý các bãi xe đã tìm trước đó
        const parkingLots = await ParkingLot.find({
            _id: { $in: session.context.pendingData.searchResults.slice(0, 3) },
        }).lean();
        return {
            type: 'select_from_previous',
            content: `Bạn muốn đặt chỗ ở bãi xe nào trong các kết quả tìm kiếm trước?`,
            data: parkingLots.map((lot) => ({
                id: lot._id,
                name: lot.name,
                available: session.context.pendingData.availableSlots?.[lot._id] || '?',
            })),
            buttons: parkingLots.map((lot) => ({
                text: `📌 ${lot.name}`,
                action: 'select_parking',
                data: { parkingId: lot._id },
            })),
        };
    }
    // Nếu có parkingId, bắt đầu flow booking
    if (parkingId) {
        return await startBookingFlow(parkingId, session);
    }
    // Nếu không có thông tin, yêu cầu tìm bãi trước
    return responseTemplates.text('Bạn muốn đặt chỗ ở bãi xe nào? Hãy tìm bãi xe trước nhé!', {
        buttons: [
            { text: '🔍 Tìm bãi xe', action: 'find_parking' },
            { text: '📍 Bãi gần tôi', action: 'find_nearby' },
        ],
    });
}
async function startBookingFlow(parkingId, session) {
    const parkingLot = await ParkingLot.findById(parkingId).lean();
    if (!parkingLot) {
        return responseTemplates.text('Không tìm thấy bãi xe.');
    }
    const availableSlot = await ParkingSlot.findOne({
        parkingLot: parkingId,
        status: 'available',
    }).lean();
    if (!availableSlot) {
        return responseTemplates.text(`😔 **${parkingLot.name} đã hết chỗ trống**\n\nVui lòng chọn bãi xe khác.`, {
            buttons: [
                { text: '🔍 Tìm bãi khác', action: 'find_parking' },
                { text: '🕐 Thử giờ khác', action: 'try_different_time' },
            ],
        });
    }
    // Bắt đầu multi-step flow
    session.context.conversationStack.push({
        type: 'booking',
        step: 1,
        data: { parkingId, slotId: availableSlot._id },
    });
    updateSessionContext(session.id, {
        pendingData: {
            ...session.context.pendingData,
            bookingStep: 1,
            parkingId,
            slotId: availableSlot._id,
            parkingName: parkingLot.name,
            slotNumber: availableSlot.slotNumber,
        },
    });
    return responseTemplates.continueBooking(session.context);
}
async function handleBookingStep(message, session) {
    const step = session.context.pendingData.bookingStep || 1;
    switch (step) {
        case 1: // Chọn thời gian
            // Parse time từ message
            const timeMatch = message.match(/(\d+)\s*giờ/);
            const hours = timeMatch ? parseInt(timeMatch[1]) : 2; // Mặc định 2 giờ
            updateSessionContext(session.id, {
                pendingData: {
                    ...session.context.pendingData,
                    bookingStep: 2,
                    durationHours: hours,
                    startTime: new Date(),
                    endTime: new Date(Date.now() + hours * 60 * 60 * 1000),
                },
            });
            return responseTemplates.continueBooking(session.context);
        case 2: // Chọn xe
            const vehicles = await Vehicle.find({ userId: session.userId })
                .limit(5)
                .lean();
            if (vehicles.length === 0) {
                return {
                    type: 'text',
                    content: 'Bạn chưa có xe nào. Vui lòng thêm xe trước khi đặt chỗ.',
                    buttons: [
                        { text: '➕ Thêm xe mới', action: 'add_vehicle' },
                        { text: '🚗 Đặt không cần xe', action: 'skip_vehicle' },
                    ],
                };
            }
            // Lưu vehicles vào context để chọn
            updateSessionContext(session.id, {
                pendingData: {
                    ...session.context.pendingData,
                    vehicles: vehicles.map((v) => ({
                        id: v._id,
                        licensePlate: v.licensePlate,
                    })),
                },
            });
            return {
                type: 'select_vehicle',
                content: 'Chọn xe của bạn:',
                data: vehicles,
                buttons: vehicles.map((v) => ({
                    text: `🚗 ${v.licensePlate}`,
                    action: 'select_vehicle',
                    data: { vehicleId: v._id },
                })),
            };
        case 3: // Xác nhận
            // Tạo booking thật
            const bookingData = session.context.pendingData;
            const booking = await createActualBooking(bookingData, session.userId);
            // Xóa conversation stack và pending data
            session.context.conversationStack = [];
            session.context.pendingData = {};
            return {
                type: 'booking_success',
                content: `🎉 **Đặt chỗ thành công!**\n\n📍 ${bookingData.parkingName}\n🚗 Chỗ số: ${bookingData.slotNumber}\n⏰ ${bookingData.durationHours} giờ\n💰 ${booking.totalPrice.toLocaleString()} VND`,
                data: {
                    bookingId: booking._id,
                    qrCode: `/api/v1/tickets/${booking._id}/qr`,
                    checkInTime: bookingData.startTime,
                },
                buttons: [
                    { text: '📱 Xem vé', action: 'view_ticket' },
                    { text: '🗺️ Chỉ đường', action: 'navigate' },
                    { text: '⏰ Đặt nhắc nhở', action: 'set_reminder' },
                ],
            };
    }
}
export async function createActualBooking(bookingData, userId) {
    // Tính giá
    const parkingLot = await ParkingLot.findById(bookingData.parkingId);
    const pricePerHour = parkingLot.pricePerHour || 15000;
    const totalPrice = pricePerHour * (bookingData.durationHours || 2);
    // Tạo booking
    const booking = new Booking({
        userId,
        parkingSlotId: bookingData.slotId,
        startTime: bookingData.startTime || new Date(),
        endTime: bookingData.endTime || new Date(Date.now() + 2 * 60 * 60 * 1000),
        totalPrice,
        status: 'confirmed',
        paymentMethod: 'prepaid',
        paymentStatus: 'unpaid',
    });
    await booking.save();
    // Update slot status
    await ParkingSlot.findByIdAndUpdate(bookingData.slotId, { status: 'booked' });
    return booking;
}
// ==================== GEMINI AI WITH CONTEXT ====================
function buildContextString(session) {
    if (!session.context.intentHistory.length)
        return 'Chưa có hội thoại trước';
    const recentIntents = session.context.intentHistory
        .slice(0, 3)
        .map((h) => `- ${h.intent} (${new Date(h.timestamp).toLocaleTimeString()})`)
        .join('\n');
    return `Người dùng đã hỏi về:\n${recentIntents}`;
}
// ==================== UTILITY FUNCTIONS ====================
function prepareResponse(response, source, intent, session) {
    return {
        source,
        response,
        intent,
        sessionId: session.id,
        context: {
            currentIntent: intent,
            nextStep: response.context?.action,
            requiresAction: !!response.buttons?.length,
        },
        timestamp: new Date().toISOString(),
        sessionInfo: {
            messageCount: session.messageCount,
            type: session.type,
            userId: session.userId,
        },
    };
}
// ==================== GET USER INFO ====================
export async function getUserInfo(userId) {
    if (!userId) {
        return { role: 'guest', name: 'Khách' };
    }
    const user = await User.findById(userId).select('userName email role').lean();
    return user
        ? {
            role: user.role,
            name: user.userName,
            email: user.email,
        }
        : {
            role: 'guest',
            name: 'User không tồn tại',
        };
}
// ==================== GET ACTIVE SESSIONS COUNT ====================
export function getActiveSessionsCount() {
    const activeThreshold = 30 * 60 * 1000; // 30 phút
    const now = new Date();
    let activeCount = 0;
    for (const session of chatSessions.values()) {
        if (now - new Date(session.lastActivity) < activeThreshold) {
            activeCount++;
        }
    }
    return activeCount;
}
//# sourceMappingURL=chatbot.service.js.map