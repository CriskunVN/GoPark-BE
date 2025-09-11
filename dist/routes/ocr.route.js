import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import axios from "axios";
import FormData from "form-data";
const router = express.Router();
const upload = multer({ dest: "uploads/", limits: { fileSize: 10 * 1024 * 1024 } });
// =========================
// Province codes & helpers
// =========================
const validProvinces = new Set([
    '11', '12', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27',
    '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '43',
    '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61',
    '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76',
    '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '88', '89', '90', '92', '93',
    '94', '95', '97', '98', '99'
]);
const normalize = s => s
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9\-]/g, "")
    .replace(/O/g, "0")
    .replace(/I/g, "1")
    .replace(/S/g, "5")
    .replace(/B/g, "8")
    .replace(/Z/g, "2")
    .replace(/A/g, "A");
const isValidPlate = plate => {
    const clean = plate.replace(/[^0-9A-Z]/g, '');
    const province = clean.substring(0, 2);
    return validProvinces.has(province) && /^[0-9]{2}[A-Z][0-9]{4,5}$/.test(clean);
};
// =========================
// Recognize license plate
// =========================
const recognizeLicensePlate = async (imageBuffer) => {
    try {
        const pre = await sharp(imageBuffer)
            .resize({ width: 1600, height: 900, fit: 'inside', withoutEnlargement: true })
            .grayscale()
            .normalize()
            .modulate({ brightness: 1.2, contrast: 1.3 })
            .sharpen({ sigma: 1.5 })
            .threshold(100)
            .toBuffer();
        const formData = new FormData();
        formData.append("apikey", process.env.OCR_SPACE_API_KEY || "helloworld");
        formData.append("language", "eng");
        formData.append("isOverlayRequired", "true");
        formData.append("scale", "true");
        formData.append("OCREngine", "2");
        formData.append("file", pre, "plate.jpg");
        const resp = await axios.post("https://api.ocr.space/parse/image", formData, { headers: formData.getHeaders(), timeout: 45000 });
        if (resp.data.OCRExitCode !== 1)
            return "Không nhận dạng được";
        const parsedResults = resp.data.ParsedResults?.[0];
        if (!parsedResults)
            return "Không nhận dạng được";
        const parsedText = parsedResults.ParsedText || "";
        const lines = parsedResults.TextOverlay?.Lines || [];
        const highConfLines = lines
            .filter(line => line.LineText && line.Confidence > 60)
            .sort((a, b) => b.Confidence - a.Confidence);
        let candidates = highConfLines.map(line => ({
            text: normalize(line.LineText),
            confidence: line.Confidence
        })).filter(c => c.text.length >= 5);
        if (candidates.length === 0)
            candidates = [{ text: normalize(parsedText), confidence: 50 }];
        const patterns = [
            /([0-9]{2}[A-Z])-?([0-9]{4,5})/,
            /([0-9]{2})([A-Z])([0-9]{4,5})/,
            /([0-9]{2})-?([0-9]{4,5})/,
            /([0-9]{2}[A-Z0-9])-?([0-9]{4,5})/
        ];
        let bestPlate = null;
        let bestConf = 0;
        for (const cand of candidates) {
            if (!cand.text)
                continue;
            for (const p of patterns) {
                const m = cand.text.match(p);
                if (m) {
                    let extracted = "";
                    if (m.length === 3)
                        extracted = `${m[1]}-${m[2]}`;
                    else if (m.length === 4)
                        extracted = `${m[1]}${m[2]}-${m[3]}`;
                    if (extracted && isValidPlate(extracted) && cand.confidence > bestConf) {
                        bestPlate = extracted;
                        bestConf = cand.confidence;
                    }
                }
            }
            if (bestPlate)
                break;
        }
        if (!bestPlate) {
            const rawText = normalize(parsedText.replace(/[^A-Z0-9\-\.]/g, ''));
            const m = rawText.match(/^([0-9]{2})-?([0-9]{4,5})$/);
            if (m) {
                const province = m[1], numbers = m[2];
                const tryLetters = ['G', 'A', 'H', 'K'];
                for (const letter of tryLetters) {
                    const potential = `${province}${letter}-${numbers}`;
                    if (isValidPlate(potential)) {
                        bestPlate = potential;
                        break;
                    }
                }
            }
        }
        return bestPlate || "Không nhận dạng được";
    }
    catch (err) {
        console.error("OCR error:", err.message || err);
        return "Không nhận dạng được";
    }
};
// =========================
// Routes
// =========================
router.post("/", upload.single("image"), async (req, res) => {
    if (!req.file)
        return res.status(400).json({ success: false, error: "Chưa tải ảnh lên!" });
    const tempFiles = [req.file.path];
    try {
        const buffer = fs.readFileSync(req.file.path);
        const plate = await recognizeLicensePlate(buffer);
        if (plate === "Không nhận dạng được") {
            return res.json({ success: false, message: "Text không đúng format biển số VN", rawText: plate });
        }
        const province = plate.substring(0, 2); // return province code
        res.json({ success: true, plate, province });
    }
    catch (e) {
        console.error("OCR route error:", e);
        res.status(500).json({ success: false, error: e.message });
    }
    finally {
        tempFiles.forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
    }
});
router.get("/health", (req, res) => res.json({ status: "OK", message: "VN License Plate OCR with OCR.space" }));
export default router;
//# sourceMappingURL=ocr.route.js.map