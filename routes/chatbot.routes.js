// routes/chatbot.routes.js
import express from 'express';
import ParkingLot from '../models/parkinglot.model.js'; // ✅ Tên chính xác và đầy đủ đuôi .js

const router = express.Router();

router.post("/chat-query", async (req, res) => {
  try {
    const { district, payment } = req.body;

    const filters = { isActive: true };

    if (district) {
      filters.address = { $regex: district, $options: "i" };
    }

    if (payment === "momo") {
      filters.allowedPaymentMethods = { $in: ["prepaid"] };
    } else if (payment === "pay-at-parking") {
      filters.allowedPaymentMethods = { $in: ["pay-at-parking"] };
    }

    const results = await ParkingLot.find(filters).limit(5);
    res.json(results);
  } catch (err) {
    console.error("Chatbot query error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
