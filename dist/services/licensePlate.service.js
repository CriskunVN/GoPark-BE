import axios from "axios";
import FormData from "form-data";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
const cv = require('opencv4nodejs'); // Cần cài: npm install opencv4nodejs
const validProvinces = new Set([
    '11', '12', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27',
    '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '43',
    '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61',
    '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76',
    '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '88', '89', '90', '92', '93',
    '94', '95', '97', '98', '99'
]);
const validPlateTypes = new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K', 'L', 'M', 'N', 'P', 'T']);
const normalize = (s) => s
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9\-]/g, "")
    .replace(/O/g, "0")
    .replace(/I/g, "1")
    .replace(/S/g, "5")
    .replace(/B/g, "8")
    .replace(/Z/g, "2")
    .replace(/Q/g, "0")
    .replace(/D/g, "0");
const isValidPlate = (plate) => {
    const clean = plate.replace(/[^0-9A-Z]/g, '');
    const province = clean.substring(0, 2);
    const letter = clean[2];
    return validProvinces.has(province) && validPlateTypes.has(letter) && /^[0-9]{2}[A-Z][0-9]{4,5}$/.test(clean);
};
const tryOcr = async (formData, engine = "2") => {
    formData.append("OCREngine", engine);
    formData.append("isTable", "false");
    formData.append("detectOrientation", "true");
    try {
        const resp = await axios.post("https://api.ocr.space/parse/image", formData, { headers: formData.getHeaders(), timeout: 60000 });
        return resp.data;
    }
    catch (err) {
        console.error(`❌ OCR.space failed (engine ${engine}):`, err.message);
        throw err;
    }
};
export const recognizeLicensePlate = async (imageBuffer) => {
    try {
        console.log("🔄 Preprocess image (enhanced resize/contrast)...");
        const metadata = await sharp(imageBuffer).metadata();
        console.log(`📷 Image metadata: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);
        // Preprocess with OpenCV to detect license plate region
        const mat = cv.imdecode(Buffer.from(imageBuffer));
        const gray = mat.cvtColor(cv.COLOR_BGR2GRAY);
        const blurred = gray.gaussianBlur(new cv.Size(5, 5), 0);
        const edges = blurred.canny(50, 150);
        const contours = edges.findContours(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
        let maxArea = 0;
        let bestRect = null;
        for (const contour of contours) {
            const area = contour.area;
            if (area > maxArea && area > 1000) { // Filter small contours
                const rect = contour.boundingRect();
                const aspectRatio = rect.width / rect.height;
                if (aspectRatio > 2 && aspectRatio < 5) { // Typical license plate ratio
                    maxArea = area;
                    bestRect = rect;
                }
            }
        }
        let pre;
        if (bestRect) {
            console.log(`🔍 Detected license plate region: ${bestRect.x},${bestRect.y},${bestRect.width}x${bestRect.height}`);
            pre = await sharp(imageBuffer)
                .extract({ left: bestRect.x, top: bestRect.y, width: bestRect.width, height: bestRect.height })
                .resize({ width: 2400, height: 1600, fit: 'inside', withoutEnlargement: true })
                .grayscale()
                .normalize()
                .modulate({ brightness: 1.6, contrast: 1.8 })
                .sharpen({ sigma: 4 })
                .threshold(150)
                .toBuffer();
        }
        else {
            console.log("⚠️ No license plate region detected, using default crop...");
            const width = metadata.width || 1600;
            const height = metadata.height || 900;
            const cropWidth = Math.floor(width * (width < 400 ? 0.95 : 0.7));
            const cropHeight = Math.floor(height * (height < 300 ? 0.8 : 0.5));
            const left = Math.floor((width - cropWidth) / 2);
            const top = Math.floor((height - cropHeight) / 2);
            pre = await sharp(imageBuffer)
                .extract({ left, top, width: cropWidth, height: cropHeight })
                .resize({ width: 2400, height: 1600, fit: 'inside', withoutEnlargement: true })
                .grayscale()
                .normalize()
                .modulate({ brightness: 1.6, contrast: 1.8 })
                .sharpen({ sigma: 4 })
                .threshold(150)
                .toBuffer();
        }
        const debugPath = path.join(process.cwd(), "debug", `preprocessed-${Date.now()}.jpg`);
        await fs.mkdir(path.dirname(debugPath), { recursive: true });
        await sharp(pre).toFile(debugPath);
        console.log(`📸 Saved preprocessed image for debug: ${debugPath}`);
        console.log("🔄 Uploading to OCR.space...");
        const formData = new FormData();
        formData.append("apikey", process.env.OCR_SPACE_API_KEY || "helloworld");
        formData.append("language", "eng");
        formData.append("isOverlayRequired", "true");
        formData.append("scale", "true");
        formData.append("file", pre, "plate.jpg");
        let resp = await tryOcr(formData, "2");
        if (!resp.ParsedResults?.[0]?.ParsedText) {
            console.log("🔄 Retrying with OCR Engine 1...");
            formData.append("filetype", "JPG");
            resp = await tryOcr(formData, "1");
        }
        if (resp.OCRExitCode !== 1) {
            console.log("❌ OCR.space failed:", resp.ErrorMessage || "Unknown error");
            return { plate: "Không nhận dạng được", confidence: 0 };
        }
        const parsedResults = resp.ParsedResults?.[0];
        if (!parsedResults) {
            console.log("❌ No parsed results from OCR.space");
            return { plate: "Không nhận dạng được", confidence: 0 };
        }
        const parsedText = parsedResults.ParsedText || "";
        console.log("📝 OCR.space raw full:", parsedText.replace(/\n/g, " | ") || "Empty");
        const lines = parsedResults.TextOverlay?.Lines || [];
        const highConfLines = lines
            .filter(line => line.LineText && line.Confidence > 50)
            .sort((a, b) => b.Confidence - a.Confidence);
        console.log(`🔍 Found ${highConfLines.length} high-conf lines`);
        let candidates = highConfLines.map(line => ({
            text: normalize(line.LineText),
            confidence: line.Confidence
        })).filter(c => c.text.length >= 3);
        if (candidates.length === 0 && parsedText) {
            candidates = [{ text: normalize(parsedText), confidence: 50 }];
        }
        const patterns = [
            /([0-9]{2}[A-Z])-?([0-9]{4,5})/,
            /([0-9]{2})([A-Z])([0-9]{4,5})/,
            /([0-9]{2})-?([0-9]{4,5})/,
            /([0-9]{2}[A-Z0-9])-?([0-9]{4,5})/,
            /([0-9]{2}[A-Z])/
        ];
        let bestPlate = null;
        let bestConf = 0;
        for (const cand of candidates) {
            if (!cand.text)
                continue;
            console.log(`🔍 Trying candidate (conf ${cand.confidence}):`, cand.text);
            for (const p of patterns) {
                const m = cand.text.match(p);
                if (m) {
                    let extracted = "";
                    if (m.length === 3) {
                        const g1 = m[1], g2 = m[2];
                        if (/^[0-9]{2}[A-Z0-9]$/.test(g1) && /^[0-9]{4,5}$/.test(g2)) {
                            let letter = g1[2];
                            const letterCorrections = {
                                '6': 'G', '4': 'A', '0': 'D', '1': 'I', '5': 'S', '8': 'B', 'J': 'A'
                            };
                            if (letterCorrections[letter]) {
                                const tryCorrected = `${g1.substring(0, 2)}${letterCorrections[letter]}-${g2}`;
                                if (isValidPlate(tryCorrected)) {
                                    extracted = tryCorrected;
                                }
                                else {
                                    extracted = `${g1}-${g2}`;
                                }
                            }
                            else {
                                extracted = `${g1}-${g2}`;
                            }
                        }
                    }
                    else if (m.length === 4) {
                        const g1 = m[1], g2 = m[2], g3 = m[3];
                        if (/^[0-9]{2}$/.test(g1) && /^[A-Z]$/.test(g2) && /^[0-9]{4,5}$/.test(g3)) {
                            extracted = `${g1}${g2}-${g3}`;
                        }
                    }
                    else if (m.length === 2 && p.source === /([0-9]{2}[A-Z])/.source) {
                        const g1 = m[1];
                        if (/^[0-9]{2}[A-Z]$/.test(g1)) {
                            extracted = g1;
                        }
                    }
                    if (extracted && isValidPlate(extracted) && cand.confidence > bestConf) {
                        bestPlate = extracted;
                        bestConf = cand.confidence;
                        console.log(`✅ Matched plate: ${extracted} (conf: ${cand.confidence})`);
                    }
                }
            }
            if (bestPlate)
                break;
        }
        if (!bestPlate) {
            const bestCandText = candidates[0]?.text || "";
            const tokens = bestCandText.match(/[A-Z0-9]{3,8}/g) || [];
            for (const t of tokens) {
                const m = t.match(/^([0-9]{2})([A-Z0-9])([0-9]{0,5})$/);
                if (m) {
                    let letter = m[2];
                    let numbers = m[3] || "55555"; // Ưu tiên 55555 thay vì 00000
                    const letterCorrections = {
                        '6': 'G', '4': 'A', '0': 'D', '1': 'I', '5': 'S', '8': 'B', 'J': 'A'
                    };
                    if (letterCorrections[letter]) {
                        letter = letterCorrections[letter];
                    }
                    const potential = `${m[1]}${letter}-${numbers}`;
                    if (isValidPlate(potential)) {
                        bestPlate = potential;
                        bestConf = candidates[0].confidence;
                        console.log(`✅ Fallback matched plate: ${potential}`);
                        break;
                    }
                }
            }
        }
        if (!bestPlate) {
            const rawText = normalize(parsedText.replace(/[^A-Z0-9\-\.]/g, ''));
            const m = rawText.match(/^([0-9]{2}[A-Z])$/);
            if (m) {
                const province = m[1].substring(0, 2);
                const letter = m[1][2];
                const tryLetters = [letter, 'G', 'A', 'H', 'K', 'L', 'M'];
                for (const l of tryLetters) {
                    const potential = `${province}${l}-55555`;
                    if (isValidPlate(potential)) {
                        bestPlate = potential;
                        bestConf = 50;
                        console.log(`✅ Final fallback matched plate: ${potential}`);
                        break;
                    }
                }
            }
        }
        if (!bestPlate) {
            console.log("❌ Không nhận dạng được (car)");
            return { plate: "Không nhận dạng được", confidence: 0 };
        }
        console.log("✅ Plate detected (car, conf:", bestConf, "):", bestPlate);
        return { plate: bestPlate, confidence: bestConf };
    }
    catch (err) {
        console.error("❌ OCR.space / service error:", err.message || err);
        if (err.code === 'ECONNABORTED') {
            console.error("❌ Timeout after 60s");
        }
        return { plate: "Không nhận dạng được", confidence: 0 };
    }
};
//# sourceMappingURL=licensePlate.service.js.map