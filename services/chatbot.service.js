import { getUserInfo } from "./ai/userService.js";
import { callGeminiAI } from "./ai/geminiService.js";

export { getUserInfo };

export async function askGeminiAI(message, userId = null) {
  try {
    console.log('🤖 Processing:', { 
      message: message, 
      userId: userId || 'guest' 
    });

    const userInfo = await getUserInfo(userId);
    
    // Enhanced retry logic với exponential backoff và better error handling
    let lastError;
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const aiResponse = await callGeminiAI(userInfo, message);
        
        // Validate response
        if (!aiResponse || typeof aiResponse !== 'string') {
          throw new Error('Invalid AI response format');
        }
        
        if (aiResponse.trim().length === 0) {
          throw new Error('Empty AI response');
        }
        
        console.log('✅ AI responded successfully');
        return aiResponse;
        
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Attempt ${attempt}/${maxRetries} failed:`, {
          error: error.message,
          type: error.name,
          attempt
        });
        
        // Không retry cho một số lỗi cụ thể
        if (error.message?.includes('Invalid API key') || 
            error.message?.includes('Authentication') ||
            error.message?.includes('Permission denied')) {
          console.error('❌ Authentication error - không retry');
          break;
        }
        
        // Retry với exponential backoff
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1); // 1s, 2s, 4s
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // Nếu tất cả attempts đều fail
    throw lastError;
    
  } catch (error) {
    console.error('❌ Service Error after all retries:', {
      error: error.message,
      type: error.name,
      userId: userId || 'guest'
    });
    
    // Trả về fallback response thân thiện dựa trên loại lỗi
    return getFriendlyErrorResponse(error, message);
  }
}

// Helper function để tạo error response thân thiện
function getFriendlyErrorResponse(error, originalMessage) {
  const lowerMessage = originalMessage.toLowerCase();
  
  // Phân tích loại lỗi và trả về response phù hợp
  if (error.message?.includes('rate limit') || error.message?.includes('429')) {
    return "🕐 Hệ thống đang khá bận lúc này. Vui lòng thử lại sau 1-2 phút nhé! " +
           "Trong lúc chờ, bạn có thể xem lại lịch sử booking hoặc thông tin xe đã đăng ký.";
  }
  
  if (error.message?.includes('timeout') || error.message?.includes('AbortError')) {
    return "⏱️ Phản hồi mất nhiều thời gian hơn bình thường. " +
           "Có thể do câu hỏi phức tạp - hãy thử hỏi ngắn gọn hơn nhé!";
  }
  
  if (error.message?.includes('network') || error.message?.includes('fetch') || 
      error.message?.includes('ENOTFOUND') || error.message?.includes('ECONNREFUSED')) {
    return "🌐 Có vấn đề kết nối mạng. Vui lòng kiểm tra internet và thử lại. " +
           "Nếu vẫn gặp lỗi, có thể server đang bảo trì.";
  }
  
  if (error.message?.includes('Invalid API key') || error.message?.includes('Authentication')) {
    return "🔐 Có vấn đề với xác thực hệ thống. Vui lòng liên hệ admin để được hỗ trợ.";
  }
  
  if (error.message?.includes('Invalid AI response') || error.message?.includes('Empty AI response')) {
    return "🤔 Tôi không thể tạo phản hồi phù hợp cho câu hỏi này. " +
           "Bạn có thể thử hỏi cách khác hoặc cụ thể hơn không?";
  }
  
  // Fallback response dựa trên nội dung tin nhắn
  if (lowerMessage.includes('đặt') || lowerMessage.includes('booking')) {
    return "🚗 Hiện tại tôi gặp khó khăn trong việc xử lý đặt chỗ. " +
           "Bạn có thể thử đặt trực tiếp qua ứng dụng hoặc liên hệ hotline để được hỗ trợ.";
  }
  
  if (lowerMessage.includes('tìm') || lowerMessage.includes('bãi')) {
    return "🔍 Tôi đang gặp sự cố khi tìm kiếm bãi xe. " +
           "Bạn có thể xem danh sách bãi xe trong mục 'Khám phá' của ứng dụng.";
  }
  
  if (lowerMessage.includes('lịch sử') || lowerMessage.includes('history')) {
    return "📋 Không thể truy xuất lịch sử lúc này. " +
           "Vui lòng kiểm tra mục 'Lịch sử booking' trong tài khoản của bạn.";
  }
  
  // Generic friendly response
  return "🤖 Xin lỗi, tôi đang gặp một chút khó khăn kỹ thuật. " +
         "Vui lòng thử lại sau ít phút hoặc liên hệ hỗ trợ nếu cần thiết. " +
         "Cảm ơn bạn đã kiên nhẫn! 🙏";
}