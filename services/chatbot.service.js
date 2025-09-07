import User from "../models/user.model.js";
import Booking from "../models/booking.model.js";
import ParkingLot from "../models/parkingLot.model.js";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Prompt cơ bản cho tất cả user
const BASE_PROMPT = `
Bạn là trợ lý AI thông minh của GoPark - nền tảng đặt chỗ bãi đỗ xe hàng đầu Việt Nam.
LUÔN trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp.
Chỉ trả lời câu hỏi về: đặt chỗ, thanh toán, tìm bãi xe, chính sách, hỗ trợ.
Trả lời ngắn gọn, rõ ràng, tối đa 4-5 câu.
`;

// Hàm lấy thông tin user từ database (nếu có userId)
export async function getUserInfo(userId) {
  try {
    // Nếu không có userId hoặc userId là string đơn giản
    if (!userId || typeof userId !== 'string' || userId.length < 10) {
      return {
        role: 'guest',
        name: 'Khách vãng lai',
        contextInfo: 'Chỉ có thể xem thông tin cơ bản về bãi xe'
      };
    }

    // Thử tìm user trong database
    const user = await User.findById(userId);
    if (!user) {
      return {
        role: 'guest', 
        name: 'User không tồn tại',
        contextInfo: 'Vui lòng đăng nhập để có trải nghiệm tốt hơn'
      };
    }

    // Tạo context info dựa trên role
    let contextInfo = '';
    switch (user.role) {
      case 'user':
        // Lấy số booking gần đây của customer
        const bookingCount = await Booking.countDocuments({ userId });
        contextInfo = `Khách hàng có ${bookingCount} booking. Có thể hỏi về lịch sử đặt chỗ, tìm bãi xe.`;
        break;
        
      case 'parking_owner':
        // Lấy số bãi xe của owner
        const lotCount = await ParkingLot.countDocuments({ parkingOwner: userId });
        contextInfo = `Chủ bãi xe quản lý ${lotCount} bãi. Có thể hỏi về thống kê, doanh thu.`;
        break;
        
      case 'admin':
        contextInfo = 'Quản trị viên có quyền truy cập tất cả thông tin hệ thống.';
        break;
        
      default:
        contextInfo = 'User với quyền hạn cơ bản.';
    }

    return {
      role: user.role,
      name: user.userName,
      email: user.email,
      contextInfo
    };

  } catch (error) {
    console.error("Lỗi lấy thông tin user:", error);
    return {
      role: 'guest',
      name: 'Lỗi hệ thống', 
      contextInfo: 'Không thể xác định thông tin người dùng'
    };
  }
}

// Hàm tạo prompt có cá nhân hóa
function createPersonalizedPrompt(userInfo, message) {
  let personalizedPrompt = BASE_PROMPT;

  // Thêm thông tin cá nhân hóa dựa trên role
  switch (userInfo.role) {
    case 'user':
      personalizedPrompt += `
      
NGƯỜI DÙNG HIỆN TẠI: ${userInfo.name} (Khách hàng)
THÔNG TIN: ${userInfo.contextInfo}
BẠN CÓ THỂ: Giúp tìm bãi xe, hướng dẫn đặt chỗ, giải đáp về booking cá nhân.
KHÔNG ĐƯỢC: Tiết lộ thông tin người khác, dữ liệu doanh thu hệ thống.`;
      break;
      
    case 'parking_owner':
      personalizedPrompt += `
      
NGƯỜI DÙNG HIỆN TẠI: ${userInfo.name} (Chủ bãi xe)  
THÔNG TIN: ${userInfo.contextInfo}
BẠN CÓ THỂ: Hỗ trợ quản lý bãi xe, thống kê booking, tư vấn tối ưu hóa.
KHÔNG ĐƯỢC: Xem dữ liệu bãi xe của chủ khác.`;
      break;
      
    case 'admin':
      personalizedPrompt += `
      
NGƯỜI DÙNG HIỆN TẠI: ${userInfo.name} (Quản trị viên)
THÔNG TIN: ${userInfo.contextInfo}  
BẠN CÓ THỂ: Cung cấp mọi thống kê, quản lý user, xử lý khiếu nại.
QUYỀN HẠN: Toàn quyền truy cập dữ liệu.`;
      break;
      
    default: // guest
      personalizedPrompt += `
      
NGƯỜI DÙNG HIỆN TẠI: Khách vãng lai
BẠN CÓ THỂ: Cung cấp thông tin cơ bản về bãi xe, hướng dẫn sử dụng.
KHUYẾN NGHỊ: Đề xuất đăng nhập để có trải nghiệm tốt hơn.`;
  }

  return personalizedPrompt;
}

// Hàm gọi Gemini AI chính
export async function askGeminiAI(message, userId = null) {
  try {
    console.log("Bắt đầu xử lý tin nhắn:", { message: message.substring(0, 50), userId });

    // Bước 1: Lấy thông tin user 
    const userInfo = await getUserInfo(userId);
    console.log("Thông tin user:", userInfo);

    // Bước 2: Tạo prompt có cá nhân hóa
    const personalizedPrompt = createPersonalizedPrompt(userInfo, message);

    // Bước 3: Gọi Gemini API
    const requestBody = {
      contents: [{
        parts: [
          { text: personalizedPrompt }, // System prompt với context
          { text: `Câu hỏi: ${message}` } // User message
        ]
      }],
      generationConfig: {
        temperature: 0.7, // Độ sáng tạo vừa phải
        maxOutputTokens: 1000 // Giới hạn độ dài phản hồi
      }
    };

    const response = await fetch(GEMINI_URL, {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY
      },
      body: JSON.stringify(requestBody)
    });

    // Bước 4: Xử lý phản hồi
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lỗi Gemini API:", response.status, errorText);
      throw new Error(`Gemini API Error: ${response.status}`);
    }

    const data = await response.json();
    const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiReply) {
      console.error("Không có phản hồi từ AI:", data);
      return "Xin lỗi, tôi không thể trả lời câu hỏi này. Vui lòng thử lại.";
    }

    console.log("AI phản hồi thành công cho user:", userInfo.name);
    return aiReply;

  } catch (error) {
    console.error("Lỗi askGeminiAI:", error);
    return "Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại sau.";
  }
}