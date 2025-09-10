import { askGeminiAI, getUserInfo } from "../services/chatbot.service.js";
import ChatHistory from "../models/chatHistory.model.js";
import catchAsync from "../utils/catchAsync.js"; // Sử dụng catchAsync có sẵn
import AppError from "../utils/appError.js"; // Sử dụng AppError có sẵn
// Controller chính xử lý chat với AI
export const aiChat = catchAsync(async (req, res, next) => {
    // Lấy dữ liệu từ request
    const { message, userId } = req.body;
    console.log("📥 Nhận request chatbot:", {
        message: message?.substring(0, 50) + '...',
        userId: userId || 'guest'
    });
    // Validation cơ bản
    if (!message || typeof message !== 'string' || message.trim() === '') {
        return next(new AppError("Vui lòng nhập tin nhắn", 400));
    }
    const cleanMessage = message.trim();
    // Gọi AI để lấy phản hồi (có cá nhân hóa)
    const aiReply = await askGeminiAI(cleanMessage, userId);
    // Lấy thông tin user để lưu vào database
    const userInfo = await getUserInfo(userId);
    // Lưu lịch sử chat vào database
    try {
        await ChatHistory.create({
            userId: userId || null,
            message: cleanMessage,
            aiReply: aiReply,
            userRole: userInfo.role,
            createdAt: new Date()
        });
        console.log("✅ Đã lưu lịch sử chat");
    }
    catch (saveError) {
        console.error("⚠️ Lỗi lưu lịch sử:", saveError);
        // Không dừng xử lý, vẫn trả về response
    }
    // Trả về response thành công
    res.status(200).json({
        status: 'success',
        data: {
            reply: {
                role: "assistant",
                content: aiReply
            },
            userInfo: {
                role: userInfo.role,
                name: userInfo.name
            }
        },
        timestamp: new Date().toISOString()
    });
    console.log("✅ Chatbot phản hồi thành công");
});
// Controller lấy lịch sử chat của user
export const getChatHistory = catchAsync(async (req, res, next) => {
    const { userId } = req.params;
    const { limit = 10 } = req.query;
    // Validation userId
    if (!userId) {
        return next(new AppError("Cần có userId để lấy lịch sử", 400));
    }
    // Lấy lịch sử chat gần nhất
    const chatHistory = await ChatHistory
        .find({ userId })
        .sort({ createdAt: -1 }) // Sắp xếp mới nhất trước
        .limit(parseInt(limit));
    res.status(200).json({
        status: 'success',
        results: chatHistory.length,
        data: {
            chatHistory
        }
    });
});
// Controller xóa lịch sử chat
export const deleteChatHistory = catchAsync(async (req, res, next) => {
    const { userId } = req.params;
    if (!userId) {
        return next(new AppError("Cần có userId để xóa lịch sử", 400));
    }
    // Xóa tất cả lịch sử của user
    const result = await ChatHistory.deleteMany({ userId });
    res.status(200).json({
        status: 'success',
        message: `Đã xóa ${result.deletedCount} tin nhắn`,
        data: null
    });
});
// Controller health check
export const healthCheck = (req, res) => {
    res.status(200).json({
        status: 'success',
        message: "Chatbot API đang hoạt động",
        data: {
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        }
    });
};
// Controller lấy thống kê chat (optional - cho admin)
export const getChatStats = catchAsync(async (req, res, next) => {
    // Thống kê tổng quan về chat
    const stats = await ChatHistory.aggregate([
        {
            $group: {
                _id: "$userRole",
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        }
    ]);
    const totalChats = await ChatHistory.countDocuments();
    const todayChats = await ChatHistory.countDocuments({
        createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
    });
    res.status(200).json({
        status: 'success',
        data: {
            totalChats,
            todayChats,
            chatsByRole: stats
        }
    });
});
//# sourceMappingURL=chatbot.controller.js.map