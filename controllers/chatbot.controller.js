import { askGeminiAI, getUserInfo } from "../services/chatbot.service.js";
import ChatHistory from "../models/chatHistory.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

export const aiChat = catchAsync(async (req, res, next) => {
  const { message, userId } = req.body;

  console.log("📥 Nhận request chatbot:", { 
    message: message?.substring(0, 50) + '...', 
    userId: userId || 'guest'
  });

  // Kiểm tra và validate input với thông báo chi tiết
  if (!message) {
    return next(new AppError("💬 Tin nhắn không được để trống. Vui lòng nhập câu hỏi hoặc yêu cầu của bạn.", 400));
  }
  
  if (typeof message !== 'string') {
    return next(new AppError("📝 Định dạng tin nhắn không hợp lệ. Vui lòng gửi tin nhắn dạng văn bản.", 400));
  }
  
  if (message.trim() === '') {
    return next(new AppError("✍️ Tin nhắn không thể chỉ chứa khoảng trắng. Hãy nhập nội dung cụ thể.", 400));
  }

  if (message.length > 1000) {
    return next(new AppError("📏 Tin nhắn quá dài (tối đa 1000 ký tự). Vui lòng rút gọn nội dung.", 400));
  }

  const cleanMessage = message.trim();
  let aiReply, userInfo;

  try {
    // Lấy thông tin user trước để xử lý lỗi tốt hơn
    userInfo = await getUserInfo(userId);
    
    // Gọi AI với error handling tốt hơn
    aiReply = await askGeminiAI(cleanMessage, userId);
    
    if (!aiReply || typeof aiReply !== 'string') {
      throw new Error('AI response is invalid');
    }

  } catch (aiError) {
    console.error("❌ Lỗi AI processing:", aiError);
    
    // Phản hồi thân thiện dựa trên loại lỗi
    let errorMessage = "🤖 Xin lỗi, tôi đang gặp một chút khó khăn. ";
    
    if (aiError.message?.includes('rate limit') || aiError.message?.includes('429')) {
      errorMessage += "Hệ thống đang quá tải. Vui lòng thử lại sau 1-2 phút. 🕐";
    } else if (aiError.message?.includes('network') || aiError.message?.includes('fetch')) {
      errorMessage += "Có vấn đề kết nối mạng. Vui lòng kiểm tra internet và thử lại. 🌐";
    } else if (aiError.message?.includes('timeout')) {
      errorMessage += "Phản hồi mất quá nhiều thời gian. Vui lòng thử câu hỏi ngắn gọn hơn. ⏱️";
    } else {
      errorMessage += "Vui lòng thử lại sau ít phút hoặc liên hệ hỗ trợ nếu lỗi tiếp tục. 🛠️";
    }
    
    aiReply = errorMessage;
  }

  // Lưu lịch sử chat với error handling cải thiện
  try {
    await ChatHistory.create({
      userId: userId || null,
      message: cleanMessage,
      aiReply: aiReply,
      userRole: userInfo?.role || 'guest',
      createdAt: new Date()
    });
    console.log("✅ Đã lưu lịch sử chat");
  } catch (saveError) {
    console.error("⚠️ Lỗi lưu lịch sử:", saveError);
    // Không làm gián đoạn response cho user, chỉ log lỗi
  }

  // Đảm bảo response luôn có format nhất quán
  res.status(200).json({
    status: 'success',
    data: {
      reply: {
        role: "assistant",
        content: aiReply
      },
      userInfo: {
        role: userInfo?.role || 'guest',
        name: userInfo?.name || 'Khách'
      }
    },
    timestamp: new Date().toISOString()
  });
});

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
export const getChatHistory = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { limit = 10 } = req.query;

  if (!userId) {
    return next(new AppError("Cần có userId để lấy lịch sử", 400));
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
  const { userId } = req.params;

  if (!userId) {
    return next(new AppError("Cần có userId để xóa lịch sử", 400));
  }

  const result = await ChatHistory.deleteMany({ userId });

  res.status(200).json({
    status: 'success',
    message: `Đã xóa ${result.deletedCount} tin nhắn`,
    data: null
  });
});
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

export const getSmartBookingSuggestions = async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    const userInfo = await getUserInfo(userId);
    const bookingInfo = SmartBookingHelper.extractBookingInfo(message, userInfo);
    const result = await SmartBookingHelper.findParkingForBooking(bookingInfo, userInfo);
    
    res.json({
      status: 'success',
      data: {
        type: 'smart_booking_suggestion',
        ...result
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Endpoint để lấy thông tin user chi tiết
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('userName email phoneNumber role');
    const vehicles = await Vehicle.find({ userId }).select('licensePlate capacity');
    const recentBookings = await Booking.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('parkingSlotId');
    
    res.json({
      status: 'success',
      data: {
        user,
        vehicles: vehicles || [],
        recentBookings: recentBookings || []
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Thêm endpoint để monitor performance
export const getPerformanceMetrics = async (req, res) => {
  try {
    const { getPerformanceMetrics: getMetrics } = await import('../services/ai/geminiService.js');
    const metrics = getMetrics();
    
    res.status(200).json({
      success: true,
      data: {
        ...metrics,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể lấy thông tin hiệu suất'
    });
  }
};