import axios from "axios";
import FormData from "form-data";
import sharp from "sharp";

/**
 * Valid Vietnamese province codes for license plates (updated as of 2025)
 */
const validProvinces = new Set([
  '11', '12', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27',
  '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '43',
  '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61',
  '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76',
  '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '88', '89', '90', '92', '93',
  '94', '95', '97', '98', '99'
]);

/**
 * Normalize OCR text for Vietnamese license plates with context-aware corrections
 */
const normalize = (s) =>
  s
    .toUpperCase()
    .replace(/\s+/g, "") // Remove extra spaces
    .replace(/[^A-Z0-9\-]/g, "") // Keep only letters, digits, dash
    .replace(/O/g, "0") // O -> 0
    .replace(/I/g, "1") // I -> 1
    .replace(/S/g, "5") // S -> 5
    .replace(/B/g, "8") // B -> 8
    .replace(/Z/g, "2") // Z -> 2
    // Avoid replacing G -> 6 globally; handle contextually in patterns
    // A -> A to prevent misreplacements (e.g., Ä)
    .replace(/A/g, "A");

/**
 * Validate if the extracted plate has a valid province code and structure
 */
const isValidPlate = (plate) => {
  const clean = plate.replace(/[^0-9A-Z]/g, ''); // Remove non-alphanumeric for checking
  const province = clean.substring(0, 2);
  return validProvinces.has(province) && /^[0-9]{2}[A-Z][0-9]{4,5}$/.test(clean);
};

/**
 * Recognize license plate for car (one-line plates).
 * Enhanced for Vietnamese plates, handling OCR errors (e.g., G vs 6, 4 vs A).
 */
export const recognizeLicensePlate = async (imageBuffer) => {
  try {
    console.log("🔄 Preprocess image (enhanced resize/contrast)...");
    // 1) Enhanced Preprocess: Optimize for OCR
    const pre = await sharp(imageBuffer)
      .resize({ width: 1600, height: 900, fit: 'inside', withoutEnlargement: true }) // Higher res
      .grayscale()
      .normalize() // Auto contrast
      .modulate({ brightness: 1.2, contrast: 1.3 }) // Boost brightness & contrast
      .sharpen({ sigma: 1.5 }) // Stronger sharpen
      .threshold(100) // Binarize to reduce noise
      .toBuffer();

    console.log("🔄 Uploading to OCR.space...");
    const formData = new FormData();
    formData.append("apikey", process.env.OCR_SPACE_API_KEY || "helloworld");
    formData.append("language", "eng"); // Latin chars for plates
    formData.append("isOverlayRequired", "true"); // Enable overlay for confidence
    formData.append("scale", "true");
    formData.append("OCREngine", "2"); // Use OCR Engine 2 for better accuracy
    formData.append("file", pre, "plate.jpg");

    const resp = await axios.post(
      "https://api.ocr.space/parse/image",
      formData,
      { headers: formData.getHeaders(), timeout: 45000 } // Increase timeout
    );

    // Check OCR exit code
    if (resp.data.OCRExitCode !== 1) {
      console.log("❌ OCR.space failed:", resp.data.ErrorMessage || "Unknown error");
      return "Không nhận dạng được";
    }

    const parsedResults = resp.data.ParsedResults?.[0];
    if (!parsedResults) {
      console.log("❌ No parsed results from OCR.space");
      return "Không nhận dạng được";
    }

    const parsedText = parsedResults.ParsedText || "";
    console.log("📝 OCR.space raw full:", parsedText.replace(/\n/g, " | "));

    // 2) Process overlay lines
    const lines = parsedResults.TextOverlay?.Lines || [];
    const highConfLines = lines
      .filter(line => line.LineText && line.Confidence > 60) // Lower threshold
      .sort((a, b) => b.Confidence - a.Confidence);

    console.log(`🔍 Found ${highConfLines.length} high-conf lines`);

    // Create candidates from high-conf lines
    let candidates = highConfLines.map(line => ({
      text: normalize(line.LineText),
      confidence: line.Confidence
    })).filter(c => c.text.length >= 5);

    // Fallback: Use full parsed text if no high-conf lines
    if (candidates.length === 0) {
      candidates = [{ text: normalize(parsedText), confidence: 50 }];
    }

    // 3) Enhanced patterns for Vietnamese car plates (e.g., 30G-49344)
    const patterns = [
      /([0-9]{2}[A-Z])-?([0-9]{4,5})/, // XXA-NNNNN (strict: one letter)
      /([0-9]{2})([A-Z])([0-9]{4,5})/, // XX A NNNNN
      /([0-9]{2})-?([0-9]{4,5})/, // XX-NNNNN (fallback)
      /([0-9]{2}[A-Z0-9])-?([0-9]{4,5})/ // Flexible for OCR errors
    ];

    let bestPlate = null;
    let bestConf = 0;

    for (const cand of candidates) {
      if (!cand.text) continue;
      console.log(`🔍 Trying candidate (conf ${cand.confidence}):`, cand.text);

      // Try patterns
      for (const p of patterns) {
        const m = cand.text.match(p);
        if (m) {
          let extracted = "";
          if (m.length === 3) {
            const g1 = m[1], g2 = m[2];
            if (/^[0-9]{2}[A-Z0-9]$/.test(g1) && /^[0-9]{4,5}$/.test(g2)) {
              let letter = g1[2];
              // Handle G vs 6: If letter is 6, try G if it makes a valid plate
              if (letter === '6') {
                const tryG = `${g1.substring(0, 2)}G-${g2}`;
                if (isValidPlate(tryG)) {
                  extracted = tryG;
                } else {
                  extracted = `${g1}-${g2}`;
                }
              } else {
                extracted = `${g1}-${g2}`;
              }
            }
          } else if (m.length === 4) {
            const g1 = m[1], g2 = m[2], g3 = m[3];
            if (/^[0-9]{2}$/.test(g1) && /^[A-Z]$/.test(g2) && /^[0-9]{4,5}$/.test(g3)) {
              extracted = `${g1}${g2}-${g3}`;
            }
          }

          if (extracted && isValidPlate(extracted) && cand.confidence > bestConf) {
            bestPlate = extracted;
            bestConf = cand.confidence;
          }
        }
      }
      if (bestPlate) break;
    }

    // 4) Fallback: Extract tokens and try to reconstruct
    if (!bestPlate) {
      const bestCandText = candidates[0]?.text || "";
      const tokens = bestCandText.match(/[A-Z0-9]{6,8}/g) || [];
      for (const t of tokens) {
        const m = t.match(/^([0-9]{2})([A-Z0-9])([0-9]{4,5})$/);
        if (m) {
          let letter = m[2];
          let potential = `${m[1]}${letter}-${m[3]}`;
          if (letter === '6' || letter === '4') {
            // Try G or A if 6 or 4 detected
            const tryG = `${m[1]}G-${m[3]}`;
            const tryA = `${m[1]}A-${m[3]}`;
            if (isValidPlate(tryG)) {
              potential = tryG;
            } else if (isValidPlate(tryA)) {
              potential = tryA;
            }
          }
          if (isValidPlate(potential)) {
            bestPlate = potential;
            bestConf = candidates[0].confidence;
            break;
          }
        }
      }
    }

    // 5) Specific fix for cases like 30-64934 (OCR misread G as 6, 4 as A)
    if (!bestPlate) {
      const rawText = normalize(parsedText.replace(/[^A-Z0-9\-\.]/g, ''));
      const m = rawText.match(/^([0-9]{2})-?([0-9]{4,5})$/);
      if (m) {
        const province = m[1], numbers = m[2];
        // Try common letters (G, A) for cases where letter is missing or misread
        const tryLetters = ['G', 'A', 'H', 'K'];
        for (const letter of tryLetters) {
          const potential = `${province}${letter}-${numbers}`;
          if (isValidPlate(potential)) {
            bestPlate = potential;
            bestConf = 50;
            break;
          }
        }
      }
    }

    if (!bestPlate) {
      console.log("❌ Không nhận dạng được (car)");
      return "Không nhận dạng được";
    }

    console.log("✅ Plate detected (car, conf:", bestConf, "):", bestPlate);
    return bestPlate;
  } catch (err) {
    console.error("❌ OCR.space / service error:", err.message || err);
    return "Không nhận dạng được";
  }
};