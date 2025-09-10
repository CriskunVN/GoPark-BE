import express from 'express';
import { aiChat, getChatHistory, deleteChatHistory, healthCheck, getChatStats, } from '../controllers/chatbot.controller.js';
const router = express.Router();
// Route chính cho chat với AI (public - không cần auth)
router.post('/ai-chat', aiChat);
// Route health check (public)
router.get('/health', healthCheck);
// Route lấy lịch sử chat theo userId (public nhưng cần userId)
router.get('/chat-history/:userId', getChatHistory);
// Route xóa lịch sử chat (public nhưng cần userId)
router.delete('/chat-history/:userId', deleteChatHistory);
// Route thống kê chat (có thể cần auth cho admin)
router.get('/stats', getChatStats);
export default router;
//# sourceMappingURL=chatbot.routes.js.map