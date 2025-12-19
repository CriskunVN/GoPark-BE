import express from 'express';
import {
  aiChat,
  handleAction,
  getChatHistory,
  getChatHistoryBySession,
  deleteChatHistory,
  healthCheck,
  getChatStats,
  getSessionInfo,
  endSession,
  saveUserLocation
} from '../controllers/chatbot.controller.js';

const router = express.Router();

// Public routes
router.post('/ai-chat', aiChat);
router.post('/action', handleAction);
router.post('/session/end', endSession);
router.get('/session/:sessionId', getSessionInfo);
router.get('/health', healthCheck);
router.get('/chat-history/user/:userId', getChatHistory);
router.get('/chat-history/session/:sessionId', getChatHistoryBySession);
router.delete('/chat-history', deleteChatHistory);
router.get('/stats', getChatStats);
router.post('/save-location',saveUserLocation);

export default router;