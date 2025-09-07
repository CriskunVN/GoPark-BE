
import mongoose from "mongoose";

const chatHistorySchema = new mongoose.Schema({
  // Có thể là ObjectId (user đã đăng nhập) hoặc string (guest user)  
  userId: { 
    type: String, // Đơn giản hóa: dùng String thay vì ObjectId
    default: null 
  },
  
  // Lưu tin nhắn theo format đơn giản
  message: {
    type: String,
    required: true
  },
  
  // Phản hồi của AI
  aiReply: {
    type: String, 
    required: true
  },
  
  // Thông tin user (để phân biệt role)
  userRole: {
    type: String,
    enum: ['guest', 'user', 'parking_owner', 'admin'],
    default: 'guest'
  },
  
  // Thời gian tạo
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Tạo index để tìm kiếm nhanh
chatHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("ChatHistory", chatHistorySchema);

