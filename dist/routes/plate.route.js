import express from "express";
import multer from "multer";
import { recognizeLicensePlate } from "../services/licensePlate.service.js";
const router = express.Router();
// Multer config with enhanced validation
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/bmp'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Chỉ hỗ trợ định dạng JPEG, PNG hoặc BMP'), false);
        }
        cb(null, true);
    }
});
// ✅ API test to check server
router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "🚗 API nhận dạng biển số hoạt động tốt!",
        timestamp: new Date().toISOString(),
        version: "1.2.0"
    });
});
// ✅ API scan license plate
router.post("/scan", upload.single("file"), async (req, res) => {
    const startTime = Date.now();
    try {
        console.log("📨 Nhận request nhận dạng biển số");
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "Vui lòng upload file ảnh",
                timestamp: new Date().toISOString()
            });
        }
        console.log("🖼️ Xử lý ảnh:", req.file.originalname, `(${req.file.size} bytes)`);
        const result = await recognizeLicensePlate(req.file.buffer);
        const responseTime = Date.now() - startTime;
        console.log(`📤 Response time: ${responseTime}ms`);
        return res.json({
            success: true,
            plate: result, // Sử dụng trực tiếp result từ recognizeLicensePlate
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error("❌ Lỗi scan:", error.message);
        const responseTime = Date.now() - startTime;
        return res.status(500).json({
            success: false,
            error: error.message.includes("timeout")
                ? "Hết thời gian xử lý (60s)"
                : "Lỗi hệ thống khi nhận dạng biển số",
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
});
export default router;
//# sourceMappingURL=plate.route.js.map