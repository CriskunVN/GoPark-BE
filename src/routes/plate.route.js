import express from "express";
import multer from "multer";
import { recognizeLicensePlate } from "../services/licensePlate.service.js";

const router = express.Router();

// Multer config để nhận file ảnh
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // giới hạn 5MB
});

// ✅ API test để check server
router.get("/test", (req, res) => {
  res.json({ success: true, message: "🚗 API nhận dạng biển số hoạt động tốt!" });
});

// ✅ API scan biển số
router.post("/scan", upload.single("file"), async (req, res) => {
  try {
    console.log("📨 Nhận request nhận dạng biển số");

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng upload file ảnh"
      });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        error: "File phải là định dạng ảnh"
      });
    }

    console.log("🖼️ Xử lý ảnh:", req.file.originalname);

    const plate = await recognizeLicensePlate(req.file.buffer);

    return res.json({
      success: true,
      plate
    });
  } catch (error) {
    console.error("❌ Lỗi scan:", error.message);
    return res.status(500).json({
      success: false,
      error: "Lỗi hệ thống khi nhận dạng biển số"
    });
  }
});

export default router;
