import express from "express";
import { askGeminiAI } from "../services/chatbot.service.js";
import ChatHistory from "../models/chatHistory.model.js";

const router = express.Router();

router.post("/ai-chat", async (req, res) => {
  try {
    const { message, userId } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    // Gọi AI
    const aiReply = await askGeminiAI(message);

    // Lưu lịch sử chat
    await ChatHistory.create({
      userId: userId || null,
      message,
      aiReply,
      createdAt: new Date()
    });

    res.json({ reply: aiReply });
  } catch (err) {
    console.error("AI chat error:", err.stack || err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

export default router;