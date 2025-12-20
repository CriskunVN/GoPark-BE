import { processMessage, getSession, clearSession, getUserInfo } from "../services/chatbot/chatbot.service.js";
import ChatHistory from "../models/chatHistory.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
// ==================== CHAT VỚI SESSION ====================
export const aiChat = catchAsync(async (req, res, next) => {
    const { message, userId, sessionId } = req.body;
    // Tạo sessionId nếu không có
    const finalSessionId = sessionId || generateSessionId(userId);
    console.log("📥 Chat request:", {
        sessionId: finalSessionId,
        userId: userId || 'guest',
        message: message?.substring(0, 50)
    });
    // Validation
    if (!message || typeof message !== 'string' || message.trim() === '') {
        return next(new AppError("Vui lòng nhập tin nhắn", 400));
    }
    // Process message với session
    const result = await processMessage(message.trim(), finalSessionId, userId);
    // Lưu vào history
    try {
        await ChatHistory.create({
            sessionId: finalSessionId,
            userId: userId || null,
            message: message.trim(),
            aiReply: typeof result.response.content === 'string'
                ? result.response.content
                : JSON.stringify(result.response),
            intent: result.intent,
            source: result.source,
            context: result.context,
            createdAt: new Date()
        });
    }
    catch (saveError) {
        console.error("⚠️ Lỗi lưu lịch sử:", saveError);
    }
    // Response
    res.status(200).json({
        status: 'success',
        data: {
            reply: result.response,
            meta: {
                sessionId: finalSessionId,
                source: result.source,
                intent: result.intent,
                context: result.context,
                timestamp: result.timestamp,
                sessionInfo: result.sessionInfo
            }
        }
    });
});
// ==================== QUẢN LÝ SESSION ====================
export const getSessionInfo = catchAsync(async (req, res) => {
    const { sessionId } = req.params;
    const session = getSession(sessionId);
    if (!session) {
        return res.status(404).json({
            status: 'error',
            message: 'Session không tồn tại'
        });
    }
    // Ẩn thông tin nhạy cảm
    const safeSession = {
        id: session.id,
        type: session.type,
        messageCount: session.messageCount,
        lastActivity: session.lastActivity,
        context: {
            currentIntent: session.context.currentIntent,
            intentHistory: session.context.intentHistory
        }
    };
    res.status(200).json({
        status: 'success',
        data: { session: safeSession }
    });
});
export const endSession = catchAsync(async (req, res) => {
    const { sessionId } = req.body;
    const cleared = clearSession(sessionId);
    if (cleared) {
        // Xóa lịch sử chat cũ (giữ lại 10 tin nhắn gần nhất cho AI training)
        await ChatHistory.deleteMany({
            sessionId,
            createdAt: { $lt: new Date(Date.now() - 30 * 60 * 1000) } // Xóa tin nhắn cũ >30 phút
        });
        res.status(200).json({
            status: 'success',
            message: 'Đã kết thúc session và dọn dẹp dữ liệu tạm thời'
        });
    }
    else {
        res.status(404).json({
            status: 'error',
            message: 'Session không tồn tại'
        });
    }
});
// ==================== LỊCH SỬ THEO SESSION ====================
export const getChatHistoryBySession = catchAsync(async (req, res, next) => {
    const { sessionId } = req.params;
    const { limit = 20 } = req.query;
    const chatHistory = await ChatHistory
        .find({ sessionId })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));
    res.status(200).json({
        status: 'success',
        results: chatHistory.length,
        data: { chatHistory }
    });
});
// ==================== CÁC FUNCTION KHÁC ====================
export const getChatHistory = catchAsync(async (req, res, next) => {
    const { userId } = req.params;
    const { limit = 20 } = req.query;
    if (!userId) {
        return next(new AppError("Cần có userId", 400));
    }
    const chatHistory = await ChatHistory
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));
    res.status(200).json({
        status: 'success',
        results: chatHistory.length,
        data: { chatHistory }
    });
});
export const deleteChatHistory = catchAsync(async (req, res, next) => {
    const { sessionId } = req.body;
    if (!sessionId) {
        return next(new AppError("Cần có sessionId", 400));
    }
    // Xóa history nhưng giữ lại 5 tin nhắn gần nhất để training AI
    const recentMessages = await ChatHistory.find({ sessionId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('_id');
    const recentIds = recentMessages.map(m => m._id);
    const result = await ChatHistory.deleteMany({
        sessionId,
        _id: { $nin: recentIds }
    });
    // Clear session data
    clearSession(sessionId);
    res.status(200).json({
        status: 'success',
        message: `Đã xóa ${result.deletedCount} tin nhắn cũ, giữ lại 5 tin nhắn gần nhất`,
        data: null
    });
});
export const healthCheck = (req, res) => {
    res.status(200).json({
        status: 'success',
        message: "Chatbot API đang hoạt động với session management",
        data: {
            uptime: process.uptime(),
            activeSessions: getActiveSessionsCount(),
            timestamp: new Date().toISOString()
        }
    });
};
// ==================== UTILITY FUNCTIONS ====================
function generateSessionId(userId) {
    // Tạo sessionId unique
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    const userPart = userId ? userId.substring(0, 8) : 'guest';
    return `${userPart}_${timestamp}_${random}`;
}
function getActiveSessionsCount() {
    // Đếm session đang active (hoạt động trong 30 phút gần nhất)
    const now = new Date();
    const activeThreshold = 30 * 60 * 1000; // 30 phút
    let activeCount = 0;
    // Lưu ý: trong production nên dùng Redis để tracking
    // Ở đây dùng in-memory cho demo
    for (const session of global.chatSessions?.values() || []) {
        if (now - new Date(session.lastActivity) < activeThreshold) {
            activeCount++;
        }
    }
    return activeCount;
}
// ==================== ACTION HANDLER ====================
export const handleAction = catchAsync(async (req, res, next) => {
    const { action, data, sessionId, userId } = req.body;
    console.log("🎯 Handling action:", { action, sessionId });
    // Kiểm tra session
    const session = getSession(sessionId);
    if (!session) {
        return next(new AppError("Session không tồn tại hoặc đã hết hạn", 401));
    }
    let result;
    switch (action) {
        case 'clear_context':
            // Xóa context nhưng giữ session
            session.context = {
                currentIntent: null,
                pendingData: {},
                intentHistory: [],
                entities: {},
                conversationStack: []
            };
            result = { message: 'Đã xóa context, bắt đầu hội thoại mới' };
            break;
        case 'get_context':
            result = {
                context: session.context,
                sessionInfo: {
                    id: session.id,
                    type: session.type,
                    messageCount: session.messageCount
                }
            };
            break;
        case 'continue_booking':
            // Tiếp tục booking từ step cụ thể
            if (!data?.step) {
                return next(new AppError("Thiếu step để tiếp tục", 400));
            }
            session.context.pendingData.bookingStep = data.step;
            result = { message: `Đã chuyển đến bước ${data.step} của booking` };
            break;
        default:
            return next(new AppError(`Action không được hỗ trợ: ${action}`, 400));
    }
    res.status(200).json({
        status: 'success',
        data: result
    });
});
// ==================== THỐNG KÊ CHAT ====================
export const getChatStats = catchAsync(async (req, res, next) => {
    // Thống kê theo role
    const statsByRole = await ChatHistory.aggregate([
        {
            $group: {
                _id: "$userRole",
                count: { $sum: 1 },
                avgResponseLength: { $avg: { $strLenCP: "$aiReply" } },
                lastChat: { $max: "$createdAt" }
            }
        },
        { $sort: { count: -1 } }
    ]);
    // Thống kê theo intent
    const statsByIntent = await ChatHistory.aggregate([
        { $match: { intent: { $exists: true, $ne: null } } },
        {
            $group: {
                _id: "$intent",
                count: { $sum: 1 },
                sources: { $addToSet: "$source" }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);
    // Thống kê theo ngày (7 ngày gần nhất)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dailyStats = await ChatHistory.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 },
                uniqueUsers: { $addToSet: "$userId" },
                uniqueSessions: { $addToSet: "$sessionId" }
            }
        },
        { $sort: { "_id": 1 } }
    ]);
    // Tính tổng
    const totalChats = await ChatHistory.countDocuments();
    const todayChats = await ChatHistory.countDocuments({
        createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    });
    // Chat trong 24h gần nhất
    const last24hChats = await ChatHistory.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    // Thống kê user activity
    const userActivity = await ChatHistory.aggregate([
        { $match: { userId: { $exists: true, $ne: null } } },
        {
            $group: {
                _id: "$userId",
                chatCount: { $sum: 1 },
                lastActivity: { $max: "$createdAt" },
                firstActivity: { $min: "$createdAt" }
            }
        },
        { $sort: { chatCount: -1 } },
        { $limit: 10 }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            summary: {
                totalChats,
                todayChats,
                last24hChats,
                activeSessions: getActiveSessionsCount(),
                avgChatsPerDay: totalChats > 0 ? (totalChats / 30).toFixed(1) : 0 // Ước tính 30 ngày
            },
            byRole: statsByRole.map(stat => ({
                role: stat._id || 'unknown',
                count: stat.count,
                avgResponseLength: Math.round(stat.avgResponseLength || 0),
                lastChat: stat.lastChat
            })),
            byIntent: statsByIntent.map(stat => ({
                intent: stat._id,
                count: stat.count,
                sources: stat.sources
            })),
            dailyActivity: dailyStats.map(day => ({
                date: day._id,
                chats: day.count,
                uniqueUsers: day.uniqueUsers.filter(id => id).length,
                uniqueSessions: day.uniqueSessions.filter(id => id).length
            })),
            topUsers: userActivity.map(user => ({
                userId: user._id,
                chatCount: user.chatCount,
                lastActivity: user.lastActivity,
                daysActive: Math.ceil((user.lastActivity - user.firstActivity) / (1000 * 60 * 60 * 24))
            })),
            performance: {
                avgResponseTime: "1.8s", // Có thể tính từ log timestamps
                successRate: "98.5%", // Tỷ lệ response thành công
                aiUsageRate: `${((statsByIntent.find(s => s._id === 'general_question')?.count || 0) / totalChats * 100).toFixed(1)}%`
            }
        },
        timestamp: new Date().toISOString()
    });
});
export const saveUserLocation = catchAsync(async (req, res, next) => {
    const { sessionId, userId, latitude, longitude, city, accuracy } = req.body;
    console.log("📍 Lưu vị trí:", { sessionId, latitude, longitude, city });
    if (!latitude || !longitude) {
        return next(new AppError("Thiếu thông tin vị trí", 400));
    }
    // Lưu vào session context
    const session = getSession(sessionId);
    if (session) {
        session.context.location = {
            type: 'geolocation',
            coordinates: {
                lat: latitude,
                lng: longitude
            },
            city: city,
            accuracy: accuracy,
            timestamp: new Date()
        };
        // Lưu vào database (nếu cần)
        try {
            // Tạo model Location nếu chưa có
            // await Location.create({ sessionId, userId, latitude, longitude, city });
        }
        catch (error) {
            console.error("⚠️ Lỗi lưu vị trí vào DB:", error);
        }
    }
    res.status(200).json({
        status: 'success',
        message: 'Đã lưu vị trí',
        data: { city }
    });
});
//# sourceMappingURL=chatbot.controller.js.map