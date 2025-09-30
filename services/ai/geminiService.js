import dotenv from "dotenv";
import { callFunction } from "./functions/functionCaller.js";
dotenv.config({ path: "./config.env" });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Cache mạnh mẽ hơn
const responseCache = new Map();
const CACHE_DURATION = 30000; // Tăng lên 30 giây
const userRequestCache = new Map(); // Cache theo user

// Rate limiting mạnh mẽ
const requestQueue = [];
let isProcessing = false;
const MAX_REQUESTS_PER_MINUTE = 10; // Giảm mạnh
const MAX_REQUESTS_PER_USER = 5; // Giới hạn per user
const MAX_CACHE_SIZE = 1000; // Giới hạn cache size
let requestCount = 0;
let lastResetTime = Date.now();

// User request tracking
const userRequestCount = new Map();

// Frequent questions cache
const frequentQuestionsCache = new Map();

// Performance metrics tracking
const performanceMetrics = {
  totalRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  apiCalls: 0,
  localProcessing: 0,
  averageResponseTime: 0,
  errors: 0
};
 // keywords nâng cao cho xử lý cục bộ
const ENHANCED_KEYWORD_HANDLING = {
  // Keywords cho đặt chỗ
  booking: ['đặt', 'book', 'booking', 'thuê chỗ', 'gửi xe', 'đậu xe', 'chỗ đỗ', 'bãi đậu'],
  
  // Keywords cho thông tin cá nhân
  personal: ['tôi', 'của tôi', 'thông tin', 'hồ sơ', 'tên tôi', 'xe tôi'],
  
  // Keywords cho lịch sử
  history: ['lịch sử', 'đã đặt', 'trước đây', 'cũ', 'history'],
  
  // Keywords cho tìm kiếm
  search: ['tìm', 'kiếm', 'ở đâu', 'gần đây', 'location'],
  
  // Keywords cho chào hỏi
  greeting: ['xin chào', 'hello', 'hi', 'chào', 'chào bạn']
};
 // Frequent patterns và responses
const FREQUENT_PATTERNS = [
  {
    pattern: /^(xin chào|hello|hi|chào)$/i,
    response: "👋 Xin chào! Tôi là trợ lý GoPark. Tôi có thể giúp bạn tìm bãi xe, xem thống kê và quản lý đặt chỗ!"
  },
  {
    pattern: /^(cảm ơn|thanks|thank you)$/i,
    response: "😊 Không có gì! Tôi rất vui được giúp bạn. Cần gì nữa không?"
  },
  {
    pattern: /^(tạm biệt|bye|goodbye)$/i,
    response: "👋 Tạm biệt bạn! Hẹn gặp lại. Chúc bạn một ngày tốt lành!"
  },
  {
    pattern: /^(bạn là ai|ai là bạn|giới thiệu)$/i,
    response: "🤖 Tôi là trợ lý AI của GoPark - hệ thống đặt chỗ đỗ xe thông minh. Tôi có thể giúp bạn tìm bãi xe, xem thống kê và quản lý booking!"
  }
];

// Fallback responses
const FALLBACK_RESPONSES = {
  greeting: "👋 Xin chào! Tôi là trợ lý GoPark. Tôi có thể giúp bạn:\n• Tìm bãi xe\n• Đặt chỗ\n• Xem lịch sử\n• Thống kê",
  search: "🔍 Hãy cho tôi biết khu vực bạn muốn tìm bãi xe (ví dụ: 'tìm bãi xe ở Hải Châu')",
  booking: "📅 Để đặt chỗ, vui lòng cho biết:\n• Khu vực\n• Thời gian\n• Biển số xe",
  history: "📋 Vui lòng đăng nhập để xem lịch sử đặt chỗ của bạn",
  error: "⚠️ Hiện tại tôi đang bận. Vui lòng thử lại sau ít phút."
};

export async function callGeminiAI(userInfo, message) {
  const startTime = Date.now();
  performanceMetrics.totalRequests++;
  
  // Kiểm tra frequent questions trước
  const frequentResponse = checkFrequentQuestions(message);
  if (frequentResponse) {
    performanceMetrics.cacheHits++;
    updatePerformanceMetrics(startTime);
    return frequentResponse;
  }

  // Tăng cường rate limiting per user
  if (!await checkRateLimit(userInfo.userId)) {
    return getFallbackResponse(message);
  }

  // Multi-layer caching
  const cacheKey = generateCacheKey(userInfo, message);
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    performanceMetrics.cacheHits++;
    updatePerformanceMetrics(startTime);
    console.log('🎯 Using cached response');
    return cached.response;
  }

  performanceMetrics.cacheMisses++;

  // Ưu tiên xử lý cục bộ trước khi gọi API
  const localResponse = await processLocally(userInfo, message);
  if (localResponse) {
    performanceMetrics.localProcessing++;
    cacheResponse(cacheKey, localResponse);
    updatePerformanceMetrics(startTime);
    return localResponse;
  }

  // Chỉ gọi API khi thực sự cần
  performanceMetrics.apiCalls++;
  const result = await processWithAI(userInfo, message, cacheKey);
  updatePerformanceMetrics(startTime);
  return result;
}

// Improved caching functions
function generateCacheKey(userInfo, message) {
  const normalizedMessage = message.toLowerCase().trim().replace(/\s+/g, ' ');
  return `${userInfo.userId || 'guest'}-${normalizedMessage}`;
}

function getCachedResponse(cacheKey) {
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached;
  }
  
  // Check frequent questions cache
  const FREQUENT_CACHE_DURATION = 300000; // 5 phút
  const frequentCached = frequentQuestionsCache.get(cacheKey);
  if (frequentCached && Date.now() - frequentCached.timestamp < FREQUENT_CACHE_DURATION) {
    return frequentCached;
  }
  
  return null;
}

function checkFrequentQuestions(message) {
  const lowerMessage = message.toLowerCase();
  
  for (const pattern of FREQUENT_PATTERNS) {
    if (pattern.pattern.test(lowerMessage)) {
      // Cache frequent response
      const cacheKey = `frequent-${lowerMessage}`;
      frequentQuestionsCache.set(cacheKey, {
        response: pattern.response,
        timestamp: Date.now()
      });
      return pattern.response;
    }
  }
  
  return null;
}

// Thêm vào response từ AI:
function formatAIResponse(aiText, detectedIntent) {
  return {
    content: aiText,
    context: detectedIntent, // "search", "booking", "error", etc.
    suggestedActions: getSuggestedActions(detectedIntent)
  };
}

function getSuggestedActions(intent) {
  const actions = {
    search_result: ["Đặt chỗ tại bãi này", "Xem bãi khác", "Chi tiết bãi xe"],
    booking_pending: ["Xác nhận đặt chỗ", "Thay đổi thời gian", "Chọn bãi khác"],
    need_auth: ["Hướng dẫn đăng nhập", "Đăng ký mới"],
    error: ["Thử lại", "Hỏi cách khác", "Liên hệ hỗ trợ"]
  };
  
  return actions[intent] || actions.search_result;
}


function updatePerformanceMetrics(startTime) {
  const responseTime = Date.now() - startTime;
  performanceMetrics.averageResponseTime = 
    (performanceMetrics.averageResponseTime * (performanceMetrics.totalRequests - 1) + responseTime) / 
    performanceMetrics.totalRequests;
}

// Enhanced rate limiting với per-user limits
async function checkRateLimit(userId) {
  const now = Date.now();
  
  // Reset counters every minute
  if (now - lastResetTime > 60000) {
    requestCount = 0;
    userRequestCount.clear();
    lastResetTime = now;
  }
  
  // Global rate limit
  if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
    console.log('⚠️ Global rate limit exceeded');
    return false;
  }
  
  // Per-user rate limit
  if (userId) {
    const userCount = userRequestCount.get(userId) || 0;
    if (userCount >= MAX_REQUESTS_PER_USER) {
      console.log(`⚠️ User rate limit exceeded for ${userId}`);
      return false;
    }
    userRequestCount.set(userId, userCount + 1);
  }
  
  requestCount++;
  return true;
}

// Cache management với size limits
function cacheResponse(key, response, isFrequent = false) {
  const cacheToUse = isFrequent ? frequentQuestionsCache : responseCache;
  
  // Manage cache size
  if (cacheToUse.size >= MAX_CACHE_SIZE) {
    // Remove oldest entries (simple LRU)
    const oldestKey = cacheToUse.keys().next().value;
    cacheToUse.delete(oldestKey);
  }
  
  cacheToUse.set(key, {
    response: response,
    timestamp: Date.now()
  });
}

// Performance monitoring endpoint data
export function getPerformanceMetrics() {
  return {
    ...performanceMetrics,
    cacheHitRate: performanceMetrics.cacheHits / (performanceMetrics.cacheHits + performanceMetrics.cacheMisses) * 100,
    cacheSize: responseCache.size,
    frequentCacheSize: frequentQuestionsCache.size,
    timestamp: Date.now()
  };
}

// Cải thiện processWithAI với better error handling
async function processWithAI(userInfo, message, cacheKey) {
  try {
    console.log(`🤖 Calling Gemini AI for: "${message.substring(0, 50)}..."`);
    
    // Lấy memory và tạo contextual response
    const memory = getConversationMemory(userInfo?.userId);
    const contextualIntro = generateContextualResponse(userInfo, message, memory);
    
    const requestBody = {
      contents: [{
        parts: [{
          text: `Bạn là trợ lý AI của GoPark - hệ thống đặt chỗ đỗ xe thông minh.

THÔNG TIN NGƯỜI DÙNG:
- Role: ${userInfo?.role || 'guest'}
- User ID: ${userInfo?.userId || 'không có'}

PERSONALITY GUIDELINES:
- Thân thiện, tự nhiên và không máy móc
- Sử dụng emoji phù hợp nhưng không spam
- Phản hồi ngắn gọn, súc tích (dưới 100 từ)
- Thể hiện cảm xúc và sự đồng cảm khi cần thiết
- Tránh lặp lại cùng một cách diễn đạt

CONTEXTUAL INTRO: "${contextualIntro}"

HƯỚNG DẪN PHẢN HỒI:
1. Bắt đầu với contextual intro nếu phù hợp
2. Trả lời trực tiếp và hữu ích
3. Nếu cần function call, chỉ dùng khi user yêu cầu rõ ràng
4. Ưu tiên trả lời trực tiếp thay vì gọi function

FUNCTIONS AVAILABLE: search_parking_lots, get_user_bookings, get_user_vehicles, create_booking

Tin nhắn của user: "${message}"`
        }]
      }],
      generationConfig: {
        temperature: 0.4, // Tăng để có phản hồi tự nhiên hơn
        maxOutputTokens: 150,
        topK: 20,
        topP: 0.8 // Tăng để có sự đa dạng hơn
      }
    };

    const response = await fetch(GEMINI_URL + `?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Gemini API Error ${response.status}:`, errorText);
      
      if (response.status === 429) {
        return getFallbackResponse(message, 'RATE_LIMIT');
      } else if (response.status >= 500) {
        return getFallbackResponse(message, 'SERVER_ERROR');
      } else {
        return getFallbackResponse(message, 'API_ERROR');
      }
    }

    const data = await response.json();
    console.log('🔍 Gemini response structure:', JSON.stringify(data, null, 2));

    // Xử lý response với better error handling
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        const part = candidate.content.parts[0];
        
        if (part.text) {
          const aiResponse = part.text.trim();
          console.log(`✅ AI Response: "${aiResponse}"`);
          
          // Cập nhật memory với cuộc hội thoại mới
          updateConversationMemory(userInfo?.userId, message, aiResponse, {
            timestamp: Date.now(),
            emotion: analyzeEmotion(message.toLowerCase()),
            intent: analyzeIntent(message.toLowerCase())
          });
          
          // Cache successful response
          cacheResponse(cacheKey, aiResponse);
          return aiResponse;
        }
        
        if (part.functionCall) {
          console.log('🔧 Function call detected:', part.functionCall);
          return await handleFunctionCall(part.functionCall, userInfo);
        }
      }
      
      // Kiểm tra finishReason để hiểu tại sao không có content
      if (candidate.finishReason) {
        console.log('⚠️ Finish reason:', candidate.finishReason);
        
        switch (candidate.finishReason) {
          case 'SAFETY':
            return getRandomResponse(AI_PERSONALITY.conversationStyle.apologetic) + " Vui lòng thử câu hỏi khác.";
          case 'MAX_TOKENS':
            return getRandomResponse(AI_PERSONALITY.conversationStyle.thinking) + " Vui lòng hỏi cụ thể hơn.";
          case 'RECITATION':
            return getRandomResponse(AI_PERSONALITY.conversationStyle.casual_responses) + " Hãy diễn đạt theo cách khác nhé.";
          default:
            return getFallbackResponse(message, 'INCOMPLETE_RESPONSE');
        }
      }
    }

    // Nếu không có candidates hoặc content
    console.error('❌ No valid response from Gemini:', data);
    return getFallbackResponse(message, 'NO_CONTENT');

  } catch (error) {
    console.error('❌ Error in processWithAI:', error);
    
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return getFallbackResponse(message, 'TIMEOUT');
    } else if (error.message.includes('fetch')) {
      return getFallbackResponse(message, 'NETWORK_ERROR');
    } else {
      return getFallbackResponse(message, 'UNKNOWN_ERROR');
    }
  }
}

function getFallbackResponse(message, errorType = 'GENERAL') {
  const lowerMessage = message.toLowerCase();
  
  // Phản hồi dựa trên loại lỗi với personality
  switch (errorType) {
    case 'RATE_LIMIT':
      return getRandomResponse(AI_PERSONALITY.conversationStyle.apologetic) + " Hệ thống đang bận, vui lòng thử lại sau 1 phút. 🕐";
    case 'TIMEOUT':
      return getRandomResponse(AI_PERSONALITY.conversationStyle.thinking) + " Phản hồi mất quá nhiều thời gian. Vui lòng thử lại. ⏱️";
    case 'NETWORK_ERROR':
      return getRandomResponse(AI_PERSONALITY.conversationStyle.empathy) + " Có vẻ như có vấn đề kết nối. Vui lòng kiểm tra internet và thử lại. 🌐";
    case 'SERVER_ERROR':
      return getRandomResponse(AI_PERSONALITY.conversationStyle.apologetic) + " Máy chủ AI tạm thời gặp sự cố. Vui lòng thử lại sau. 🔧";
    case 'API_ERROR':
      return getRandomResponse(AI_PERSONALITY.conversationStyle.empathy) + " Có lỗi xảy ra. Vui lòng liên hệ admin nếu lỗi tiếp tục. ⚠️";
    case 'NO_CONTENT':
    case 'INCOMPLETE_RESPONSE':
      return getRandomResponse(AI_PERSONALITY.conversationStyle.casual_responses) + " Tôi không hiểu rõ câu hỏi. Bạn có thể hỏi cách khác không? 🤔";
    default:
      break;
  }
  
  // Phản hồi dựa trên nội dung tin nhắn với personality
  if (ENHANCED_KEYWORD_HANDLING.greeting.some(keyword => lowerMessage.includes(keyword))) {
    return getRandomResponse(AI_PERSONALITY.conversationStyle.greeting);
  }
  
  if (ENHANCED_KEYWORD_HANDLING.search.some(keyword => lowerMessage.includes(keyword))) {
    return getRandomResponse(AI_PERSONALITY.conversationStyle.encouragement) + " " + FALLBACK_RESPONSES.search;
  }
  
  if (ENHANCED_KEYWORD_HANDLING.booking.some(keyword => lowerMessage.includes(keyword))) {
    return getRandomResponse(AI_PERSONALITY.conversationStyle.thinking) + " " + FALLBACK_RESPONSES.booking;
  }
  
  if (ENHANCED_KEYWORD_HANDLING.history.some(keyword => lowerMessage.includes(keyword))) {
    return getRandomResponse(AI_PERSONALITY.conversationStyle.empathy) + " " + FALLBACK_RESPONSES.history;
  }

  // THÊM CÁC PHẢN HỒI MỚI VÀO ĐÂY:
  if (lowerMessage.includes('giờ') || lowerMessage.includes('mở cửa')) {
    return getRandomResponse(AI_PERSONALITY.conversationStyle.encouragement) + " Hầu hết bãi xe hoạt động 24/7. Một số bãi có giờ mở cửa riêng, tôi sẽ kiểm tra khi bạn chọn bãi cụ thể. 🕐";
  }

  if (lowerMessage.includes('thanh toán') || lowerMessage.includes('momo')) {
    return getRandomResponse(AI_PERSONALITY.conversationStyle.casual_responses) + " GoPark hỗ trợ thanh toán: Tiền mặt, MoMo, ZaloPay, và thẻ ngân hàng. 💳";
  }

  // Fallback cuối cùng
  return getRandomResponse(AI_PERSONALITY.conversationStyle.greeting) + " Tôi có thể giúp bạn:\n• Tìm bãi xe gần đây 🔍\n• Đặt chỗ trước 📅\n• Xem lịch sử booking 📋\n• Thông tin xe đã đăng ký 🚗\n\nBạn cần hỗ trợ gì?";
}

// Xử lý function calls
async function handleFunctionCall(functionCall, userInfo) {
  try {
    console.log('🔧 Processing function call:', functionCall);
    
    const { name: functionName, args } = functionCall;
    const parameters = args || {};
    
    // Thêm userId vào parameters nếu cần
    if (userInfo?.userId && !parameters.userId) {
      parameters.userId = userInfo.userId;
    }
    
    const result = await callFunction(functionName, parameters, userInfo?.role || 'guest');
    
    if (result.success) {
      return formatFunctionResult(functionName, result);
    } else {
      return `❌ ${result.error || 'Không thể thực hiện yêu cầu này.'}`;
    }
  } catch (error) {
    console.error('❌ Error in handleFunctionCall:', error);
    return "⚠️ Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại.";
  }
}

// Format kết quả function call
function formatFunctionResult(functionName, result) {
  switch (functionName) {
    case 'search_parking_lots':
      if (result.data && result.data.length > 0) {
        return `🏢 Tìm thấy ${result.data.length} bãi xe:\n` +
          result.data.map((lot, i) => 
            `${i + 1}. ${lot.name}\n   📍 ${lot.address}\n   💰 ${lot.pricePerHour?.toLocaleString() || 'N/A'}đ/giờ`
          ).join('\n\n');
      }
      return "❌ Không tìm thấy bãi xe nào phù hợp.";
      
    case 'get_user_bookings':
      if (result.data?.bookings && result.data.bookings.length > 0) {
        return `📋 Lịch sử booking của bạn:\n` +
          result.data.bookings.map((booking, i) => 
            `${i + 1}. ${booking.parkingLotName}\n   🚗 ${booking.vehicleNumber}\n   📅 ${booking.startTime}\n   💰 ${booking.totalPrice}đ`
          ).join('\n\n');
      }
      return "📭 Bạn chưa có booking nào.";
      
    case 'get_user_vehicles':
      if (result.data?.vehicles && result.data.vehicles.length > 0) {
        return `🚗 Xe đã đăng ký:\n` +
          result.data.vehicles.map((vehicle, i) => 
            `${i + 1}. ${vehicle.licensePlate} (${vehicle.capacity || 'N/A'} chỗ)`
          ).join('\n');
      }
      return "🚫 Bạn chưa đăng ký xe nào.";
      
    case 'create_booking':
      if (result.data?.booking) {
        const booking = result.data.booking;
        return `✅ Đặt chỗ thành công!\n📋 ${booking.parkingLotName}\n🚗 ${booking.vehicleNumber}\n📅 ${booking.startTime}\n💰 ${booking.totalPrice}`;
      }
      return "✅ Đặt chỗ thành công!";
      
    default:
      return result.message || "✅ Thành công!";
  }
}


// AI Personality và Context System
const AI_PERSONALITY = {
  name: "GoPark Assistant",
  traits: {
    friendly: true,
    helpful: true,
    professional: true,
    empathetic: true,
    conversational: true,
    adaptive: true
  },
  conversationStyle: {
    greeting: [
      "👋 Xin chào! Tôi là trợ lý GoPark, rất vui được hỗ trợ bạn hôm nay!",
      "🌟 Chào bạn! Tôi có thể giúp bạn tìm bãi xe hoặc đặt chỗ ngay bây giờ.",
      "😊 Hello! Tôi là AI assistant của GoPark, sẵn sàng hỗ trợ bạn!",
      "🚗 Chào bạn! Cần tìm chỗ đỗ xe hay có thể giúp gì khác không?",
      "✨ Xin chào! Hôm nay tôi có thể hỗ trợ bạn điều gì về việc đỗ xe?"
    ],
    encouragement: [
      "Tuyệt vời! Tôi sẽ giúp bạn ngay.",
      "Được rồi! Để tôi xử lý cho bạn.",
      "OK! Tôi hiểu rồi, hãy để tôi tìm giải pháp tốt nhất.",
      "Rất tốt! Tôi sẽ tìm cho bạn những lựa chọn phù hợp nhất.",
      "Tôi sẽ giúp bạn giải quyết vấn đề này ngay!"
    ],
    empathy: [
      "Tôi hiểu bạn đang cần tìm chỗ đỗ xe gấp.",
      "Đừng lo, tôi sẽ giúp bạn tìm được chỗ phù hợp.",
      "Tôi sẽ cố gắng tìm giải pháp tốt nhất cho bạn.",
      "Tôi hiểu việc tìm chỗ đỗ xe có thể khó khăn, để tôi hỗ trợ bạn.",
      "Không sao cả, tôi ở đây để giúp bạn tìm ra giải pháp."
    ],
    casual_responses: [
      "Ồ, thú vị đấy!",
      "Hmm, để tôi xem nào...",
      "Ah, tôi hiểu rồi!",
      "Được thôi, không vấn đề gì!",
      "Oke, tôi sẽ giúp bạn ngay!"
    ],
    thinking: [
      "Để tôi suy nghĩ một chút...",
      "Hmm, tôi đang tìm hiểu...",
      "Chờ tôi kiểm tra thông tin nhé...",
      "Tôi đang xử lý yêu cầu của bạn...",
      "Một giây, tôi đang tìm kiếm..."
    ],
    apologetic: [
      "Xin lỗi vì sự bất tiện này.",
      "Rất tiếc, có vẻ như có chút vấn đề.",
      "Ôi, tôi xin lỗi về điều này.",
      "Xin lỗi bạn, tôi sẽ cố gắng hỗ trợ tốt hơn.",
      "Thật sự xin lỗi, để tôi thử cách khác."
    ],
    confirmation: [
      "Bạn có chắc chắn không?",
      "Tôi hiểu đúng chưa?",
      "Vậy là bạn muốn...?",
      "Để tôi xác nhận lại nhé:",
      "Bạn có muốn tôi tiếp tục không?"
    ]
  },
  responsePatterns: {
    // Tránh lặp lại cùng một pattern
    avoid_repetition: true,
    // Sử dụng emoji một cách tự nhiên
    natural_emoji: true,
    // Thay đổi cách diễn đạt
    vary_expression: true,
    // Phản hồi theo context
    contextual: true
  }
};

// Context Memory System
const conversationMemory = new Map();
const MEMORY_DURATION = 30 * 60 * 1000; // 30 phút

function updateConversationMemory(userId, message, response, context = {}) {
  if (!userId) return;
  
  const userMemory = conversationMemory.get(userId) || {
    conversations: [],
    preferences: {},
    lastInteraction: null,
    context: {}
  };
  
  userMemory.conversations.push({
    timestamp: Date.now(),
    userMessage: message,
    aiResponse: response,
    context: context
  });
  
  // Giữ chỉ 10 cuộc hội thoại gần nhất
  if (userMemory.conversations.length > 10) {
    userMemory.conversations = userMemory.conversations.slice(-10);
  }
  
  userMemory.lastInteraction = Date.now();
  userMemory.context = { ...userMemory.context, ...context };
  
  conversationMemory.set(userId, userMemory);
}

function getConversationMemory(userId) {
  if (!userId) return null;
  
  const memory = conversationMemory.get(userId);
  if (!memory || Date.now() - memory.lastInteraction > MEMORY_DURATION) {
    return null;
  }
  
  return memory;
}

function getRandomResponse(responseArray) {
  return responseArray[Math.floor(Math.random() * responseArray.length)];
}

function generateContextualResponse(userInfo, message, memory = null) {
  const lowerMessage = message.toLowerCase();
  
  // Phân tích cảm xúc và ý định
  const intent = analyzeIntent(lowerMessage);
  const emotion = analyzeEmotion(lowerMessage);
  
  // Tạo phản hồi dựa trên context
  let response = "";
  
  // Xử lý memory và context
  if (memory && memory.conversations.length > 0) {
    const lastConversation = memory.conversations[memory.conversations.length - 1];
    const timeSinceLastChat = Date.now() - lastConversation.timestamp;
    
    if (timeSinceLastChat < 5 * 60 * 1000) { // 5 phút
      response += "Tôi nhớ chúng ta vừa nói chuyện. ";
    } else if (timeSinceLastChat > 30 * 60 * 1000) { // 30 phút
      response += getRandomResponse(AI_PERSONALITY.conversationStyle.greeting) + " ";
    }
  }
  
  // Phản hồi dựa trên cảm xúc
  if (emotion === 'negative') {
    response += getRandomResponse(AI_PERSONALITY.conversationStyle.empathy) + " ";
  } else if (emotion === 'positive') {
    response += getRandomResponse(AI_PERSONALITY.conversationStyle.encouragement) + " ";
  }
  
  // Phản hồi dựa trên urgency
  if (intent.urgency === 'high') {
    response += getRandomResponse(AI_PERSONALITY.conversationStyle.thinking) + " ";
  }
  
  // Phản hồi dựa trên loại tin nhắn
  if (intent.type === 'greeting') {
    return getRandomResponse(AI_PERSONALITY.conversationStyle.greeting);
  } else if (intent.type === 'question') {
    response += getRandomResponse(AI_PERSONALITY.conversationStyle.thinking) + " ";
  }
  
  // Thêm tính lịch sự
  if (intent.politeness === 'high') {
    response += "Cảm ơn bạn đã lịch sự. ";
  }
  
  return response.trim();
}

function analyzeIntent(message) {
  const urgencyKeywords = ['gấp', 'nhanh', 'khẩn cấp', 'ngay', 'urgent'];
  const politeKeywords = ['xin', 'vui lòng', 'please', 'cảm ơn', 'thank'];
  
  return {
    urgency: urgencyKeywords.some(k => message.includes(k)) ? 'high' : 'normal',
    politeness: politeKeywords.some(k => message.includes(k)) ? 'high' : 'normal',
    type: detectMessageType(message)
  };
}

function analyzeEmotion(message) {
  const positiveKeywords = ['tốt', 'hay', 'tuyệt', 'cảm ơn', 'good', 'great'];
  const negativeKeywords = ['tệ', 'khó', 'không được', 'lỗi', 'bad', 'error'];
  
  if (positiveKeywords.some(k => message.includes(k))) return 'positive';
  if (negativeKeywords.some(k => message.includes(k))) return 'negative';
  return 'neutral';
}

function detectMessageType(message) {
  if (message.includes('?')) return 'question';
  if (message.includes('!')) return 'exclamation';
  if (message.includes('xin chào') || message.includes('hello')) return 'greeting';
  return 'statement';
}


// Enhanced local processing với AI-like responses
async function processLocally(userInfo, message) {
  const lowerMessage = message.toLowerCase();
  const memory = getConversationMemory(userInfo?.userId);

    if ((lowerMessage.includes('thống kê') || lowerMessage.includes('số liệu')) && 
      lowerMessage.includes('của tôi')) {
    if (!userInfo?.userId) {
      return {
        type: 'special',
        content: 'auth_required',
        message: "🔐 Vui lòng đăng nhập để xem thống kê cá nhân."
      };
    }
    
    try {
      let result;
      if (userInfo.role === 'user') {
        result = await callFunction('get_user_stats', { userId: userInfo.userId }, userInfo.role);
      } else if (userInfo.role === 'parking_owner') {
        result = await callFunction('get_owner_revenue', { userId: userInfo.userId }, userInfo.role);
      } else if (userInfo.role === 'admin') {
        result = await callFunction('get_admin_stats', { userId: userInfo.userId }, userInfo.role);
      }
      
      if (result.success) {
        return formatStatsResponse(userInfo.role, result.data);
      }
    } catch (error) {
      console.error('Error getting stats:', error);
    }
  }
  
  // Xử lý chào hỏi thông minh
  if (lowerMessage.includes('xin chào') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    let greeting = getRandomResponse(AI_PERSONALITY.conversationStyle.greeting);
    
    if (memory && memory.conversations.length > 0) {
      greeting = "👋 Chào bạn trở lại! Tôi nhớ chúng ta đã nói chuyện rồi. ";
    }
    
    if (userInfo?.role === 'guest') {
      greeting += "\n\n🎯 Tôi có thể giúp bạn:\n• 🔍 Tìm bãi xe gần bạn\n• 📅 Đặt chỗ trước\n• ❓ Trả lời các câu hỏi về dịch vụ";
    } else {
      greeting += `\n\n🎯 Xin chào ${userInfo.role}! Tôi có thể hỗ trợ:\n• 🔍 Tìm bãi xe\n• 📅 Đặt chỗ nhanh chóng\n• 📋 Xem lịch sử booking\n• 🚗 Quản lý xe đã đăng ký`;
    }
    
    updateConversationMemory(userInfo?.userId, message, greeting, { type: 'greeting' });
    return greeting;
  }

  // Xử lý yêu cầu xem xe đã đăng ký
  if (lowerMessage.includes('xe') && (lowerMessage.includes('đăng ký') || lowerMessage.includes('của tôi') || lowerMessage.includes('danh sách'))) {
    if (!userInfo?.userId) {
      return {
        type: 'special',
        content: 'auth_required',
        message: "🔐 " + getRandomResponse(AI_PERSONALITY.conversationStyle.empathy) + " Để xem danh sách xe, bạn cần đăng nhập trước nhé!"
      };
    }
    
    try {
      const result = await callFunction('get_user_vehicles', { userId: userInfo.userId }, userInfo.role);
      let response;
      
      if (result.success) {
        if (result.data?.vehicles && result.data.vehicles.length > 0) {
          response = `🚗 ${getRandomResponse(AI_PERSONALITY.conversationStyle.encouragement)} Đây là danh sách xe đã đăng ký:\n\n` +
            result.data.vehicles.map((vehicle, i) => 
              `${i + 1}. 🚙 ${vehicle.licensePlate} (${vehicle.capacity || 'N/A'} chỗ)`
            ).join('\n') + 
            "\n\n💡 Bạn có thể sử dụng bất kỳ xe nào để đặt chỗ đỗ!";
        } else {
          response = "🚫 Hiện tại bạn chưa đăng ký xe nào trong hệ thống.\n\n💡 Hãy thêm xe để có thể đặt chỗ dễ dàng hơn!";
        }
      } else {
        response = `❌ ${result.error || 'Không thể lấy thông tin xe.'} Bạn thử lại sau nhé!`;
      }
      
      updateConversationMemory(userInfo?.userId, message, response, { type: 'vehicle_info', success: result.success });
      return response;
    } catch (error) {
      console.error('Error getting user vehicles:', error);
      return "⚠️ Có lỗi xảy ra khi lấy thông tin xe. " + getRandomResponse(AI_PERSONALITY.conversationStyle.empathy);
    }
  }

  // Xử lý yêu cầu xem lịch sử booking
  if (lowerMessage.includes('lịch sử') || (lowerMessage.includes('booking') && lowerMessage.includes('của tôi'))) {
    if (!userInfo?.userId) {
      return {
        type: 'special',
        content: 'auth_required',
        message: "🔐 Vui lòng đăng nhập để xem lịch sử booking."
      };
    }
    
    try {
      const result = await callFunction('get_user_bookings', { 
        userId: userInfo.userId,
        limit: 10 
      }, userInfo.role);
      
      if (result.success) {
        if (result.data?.bookings && result.data.bookings.length > 0) {
          return `📋 Lịch sử booking của bạn:\n` +
            result.data.bookings.map((booking, i) => 
              `${i + 1}. ${booking.parkingLotName || 'N/A'}\n   🚗 ${booking.vehicleNumber}\n   📅 ${new Date(booking.startTime).toLocaleString('vi-VN')}\n   💰 ${booking.totalPrice?.toLocaleString() || 'N/A'}đ\n   📊 ${booking.status}`
            ).join('\n\n');
        } else {
          return "📭 Bạn chưa có booking nào.";
        }
      } else {
        return `❌ ${result.error || 'Không thể lấy lịch sử booking.'}`;
      }
    } catch (error) {
      console.error('Error getting user bookings:', error);
      return "⚠️ Có lỗi xảy ra khi lấy lịch sử booking. Vui lòng thử lại.";
    }
  }

  // Xử lý tìm kiếm bãi xe
  if (lowerMessage.includes('tìm') && lowerMessage.includes('bãi')) {
    const location = extractLocation(message);
    if (location) {
      try {
        const result = await callFunction('search_parking_lots', { 
          location: location,
          limit: 5 
        }, userInfo?.role || 'guest');
        
        if (result.success && result.data && result.data.length > 0) {
          return `🏢 Tìm thấy ${result.data.length} bãi xe ở ${location}:\n` +
            result.data.map((lot, i) => 
              `${i + 1}. ${lot.name}\n   📍 ${lot.address}\n   💰 ${lot.pricePerHour?.toLocaleString() || 'N/A'}đ/giờ\n   🚗 ${lot.availableSlots || 'N/A'} chỗ trống`
            ).join('\n\n');
        } else {
          return `❌ Không tìm thấy bãi xe nào ở ${location}. Thử tìm ở khu vực khác?`;
        }
      } catch (error) {
        console.error('Error searching parking lots:', error);
        return "⚠️ Có lỗi xảy ra khi tìm bãi xe. Vui lòng thử lại.";
      }
    } else {
      return "📍 Vui lòng cho biết khu vực bạn muốn tìm bãi xe (ví dụ: 'tìm bãi xe ở Hải Châu')";
    }
  }

  // Xử lý booking keywords
  const bookingKeywords = ['đặt', 'book', 'booking', 'thuê chỗ', 'gửi xe'];
  const hasBookingKeyword = bookingKeywords.some(keyword => lowerMessage.includes(keyword));
  
  if (hasBookingKeyword) {
    if (!userInfo?.userId) {
      return {
        type: 'special',
        content: 'auth_required',
        message: "🔐 " + getRandomResponse(AI_PERSONALITY.conversationStyle.empathy) + " Để đặt chỗ, bạn cần đăng nhập trước nhé!"
      };
    }

    const location = extractLocation(message);
    if (location) {
      try {
        const searchResult = await callFunction('search_parking_lots', { 
          location: location,
          limit: 3 
        }, userInfo.role);
        
        if (searchResult.success && searchResult.data && searchResult.data.length > 0) {
          const parkingLot = searchResult.data[0];
          
          let defaultVehicle = extractVehicleInfo(message);
          if (!defaultVehicle) {
            try {
              const vehicleResult = await callFunction('get_user_vehicles', { userId: userInfo.userId }, userInfo.role);
              if (vehicleResult.success && vehicleResult.data?.vehicles?.length > 0) {
                defaultVehicle = vehicleResult.data.vehicles[0].licensePlate;
              }
            } catch (error) {
              console.log('Could not get default vehicle:', error);
            }
          }
          
          const bookingData = {
            parkingLotId: parkingLot._id || parkingLot.id,
            parkingLotName: parkingLot.name,
            address: parkingLot.address,
            pricePerHour: parkingLot.pricePerHour,
            availableSlots: parkingLot.availableSlots,
            startTime: new Date(Date.now() + 30 * 60000).toISOString(),
            duration: 2,
            vehicleNumber: defaultVehicle || '',
            estimatedPrice: (parkingLot.pricePerHour || 10000) * 2
          };
          
          updateConversationMemory(userInfo.userId, message, '', { 
            type: 'booking_suggestion',
            pendingBooking: bookingData
          });
          
          return `🎯 ${getRandomResponse(AI_PERSONALITY.conversationStyle.encouragement)} Tìm thấy bãi xe phù hợp!\n\n` +
            `🏢 ${parkingLot.name}\n` +
            `📍 ${parkingLot.address}\n` +
            `💰 ${parkingLot.pricePerHour?.toLocaleString() || 'N/A'}đ/giờ\n` +
            `🚗 ${parkingLot.availableSlots || 'N/A'} chỗ trống\n\n` +
            `📋 Thông tin đặt chỗ:\n` +
            `🚙 Xe: ${defaultVehicle || 'Chưa chọn'}\n` +
            `📅 Thời gian: ${new Date(bookingData.startTime).toLocaleString('vi-VN')}\n` +
            `⏰ Thời lượng: ${bookingData.duration} giờ\n` +
            `💵 Tổng tiền: ${bookingData.estimatedPrice.toLocaleString()}đ\n\n` +
            `❓ Bạn có muốn xác nhận đặt chỗ không? (Trả lời "có" hoặc "xác nhận")`;
        }
      } catch (error) {
        console.error('Error in booking suggestion:', error);
        return "⚠️ Có lỗi xảy ra khi tìm bãi xe. " + getRandomResponse(AI_PERSONALITY.conversationStyle.empathy);
      }
    } else {
      return `📍 ${getRandomResponse(AI_PERSONALITY.conversationStyle.encouragement)} Để đặt chỗ, hãy cho tôi biết:\n\n` +
        `🎯 **Bắt buộc:**\n• Khu vực (ví dụ: "Hải Châu", "Thanh Khê")\n\n` +
        `⚙️ **Tùy chọn:**\n• Thời gian bắt đầu\n• Thời lượng đỗ xe\n• Biển số xe\n\n` +
        `💡 Ví dụ: "Đặt chỗ ở Hải Châu lúc 2 giờ chiều, đỗ 3 tiếng"`;
    }
  }

  return null; // Chuyển sang AI processing
}

// Thêm hàm format stats response
function formatStatsResponse(role, data) {
  switch (role) {
    case 'user':
      return `📊 **Thống kê của bạn:**\n` +
             `• 📅 Số lượt đặt chỗ: ${data.bookingCount}\n` +
             `• 🚗 Số xe đã đăng ký: ${data.vehicleCount}\n` +
             `• ⏳ Đặt chỗ đang hoạt động: ${data.activeBookings}\n` +
             `• 💰 Tổng chi tiêu: ${data.totalSpent?.toLocaleString() || 0}đ\n\n` +
             `🎯 Tiếp tục khám phá các bãi xe mới nhé!`;
             
    case 'parking_owner':
      return `🏢 **Thống kê doanh thu:**\n` +
             `• 🏗️ Số bãi xe quản lý: ${data.parkingLotCount}\n` +
             `• 📈 Tổng doanh thu: ${data.totalRevenue?.toLocaleString() || 0}đ\n` +
             `• 📋 Tổng số đơn đặt: ${data.totalBookings}\n` +
             `• ✅ Đơn hoàn thành: ${data.completedBookings}\n\n` +
             `💡 Doanh thu ổn định!`;
             
    case 'admin':
      return `👑 **Thống kê hệ thống:**\n` +
             `• 👥 Tổng người dùng: ${data.totalUsers}\n` +
             `• 🏢 Tổng chủ bãi xe: ${data.totalOwners}\n` +
             `• 🅿️ Tổng bãi xe: ${data.totalParkingLots}\n` +
             `• 📄 Tổng đơn đặt: ${data.totalBookings}\n` +
             `• 💵 Tổng doanh thu: ${data.totalRevenue?.toLocaleString() || 0}đ\n\n` +
             `🌐 Hệ thống đang hoạt động tốt!`;
             
    default:
      return "📊 Không có thống kê nào để hiển thị.";
  }
}


// Helper functions
function extractLocation(message) {
  const patterns = [
    /(?:ở|tại|gần|quận|huyện|phường)\s+([^,.!?\n]+)/i,
    /(\b(?:Hải Châu|Thanh Khê|Sơn Trà|Ngũ Hành Sơn|Liên Chiểu|Cẩm Lệ|Hòa Vang)\b)/i,
    /(\b(?:quận|huyện)\s+\d+\b)/i
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
}

function extractVehicleInfo(message) {
  const vehiclePatterns = [
    /(?:xe|biển số)\s+([0-9]{2}[A-Z]-[0-9]{3,5})/i,
    /([0-9]{2}[A-Z]-[0-9]{3,5})/i
  ];
  
  for (const pattern of vehiclePatterns) {
    const match = message.match(pattern);
    if (match) {
      return match[1].toUpperCase();
    }
  }
  return null;
}

