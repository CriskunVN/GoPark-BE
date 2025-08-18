import fetch from "node-fetch";

const GEMINI_API_KEY = "AIzaSyB8s2u-ykwdHdL4eZL9tFvGWufRwEQAw6c";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const SYSTEM_PROMPT = `
Bạn là trợ lý AI cho website GoPark - nền tảng đặt chỗ bãi đỗ xe thông minh.
Chỉ trả lời các câu hỏi liên quan đến sử dụng website, đặt chỗ, thanh toán, chính sách, hỗ trợ khách hàng.
Trả lời ngắn gọn, tối đa 3-4 câu, dễ hiểu cho người dùng mới.
Nếu câu hỏi không liên quan, hãy lịch sự từ chối.
`;

export async function askGeminiAI(message) {
  const body = {
    contents: [
      {
        parts: [
          { text: SYSTEM_PROMPT },
          { text: message }
        ]
      }
    ]
  };

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": GEMINI_API_KEY
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error("Gemini API error: " + errText);
  }
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi, tôi chưa có câu trả lời.";
}