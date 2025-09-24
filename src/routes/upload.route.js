import express from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import User from "../models/user.model.js";
import Vehicle from "../models/vehicles.model.js";
import ParkingLot from "../models/parkinglot.model.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// =============================
// Upload file(s)
// =============================
router.post("/", upload.any(), async (req, res) => {
  try {
    const { type, userId } = req.body;

    // ------------------- Parking lot nhiều ảnh -------------------
    if (type === "parkinglotImages") {
      const files = req.files?.length ? req.files : [];
      if (!files || files.length === 0)
        return res.status(400).json({ error: "No files uploaded" });

      const urls = [];
      for (const file of files) {
        const fileName = `parkinglots/${userId || "unknown"}_${Date.now()}_${file.originalname}`;
        const { error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: true });
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("uploads")
          .getPublicUrl(fileName);

        const imageUrl = publicUrlData.publicUrl;
        urls.push(imageUrl);

        await ParkingLot.findByIdAndUpdate(userId, { $push: { image: imageUrl } });
      }

      return res.json({ urls });
    }

    // ------------------- Avatar & Vehicle (1 ảnh) -------------------
    const file = req.files?.[0];
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    let folder = "uploads";
    if (type === "avatar" || type === "parkinglotAvatar") folder = "avatars";
    else if (type === "vehicle") folder = "vehicles";

    const fileName = `${folder}/${userId || "unknown"}_${Date.now()}_${file.originalname}`;
    const { error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: true });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from("uploads").getPublicUrl(fileName);
    const imageUrl = publicUrlData.publicUrl;

    if (type === "avatar" && userId) {
      await User.findByIdAndUpdate(userId, { profilePicture: imageUrl });
    } else if (type === "parkinglotAvatar" && userId) {
      await ParkingLot.findByIdAndUpdate(userId, { avtImage: imageUrl });
    } else if (type === "vehicle" && userId) {
      await Vehicle.findByIdAndUpdate(userId, { image: imageUrl });
    }

    return res.json({ url: imageUrl });
  } catch (err) {
    console.error("Upload failed:", err);
    return res.status(500).json({ error: "Upload failed", details: err.message });
  }
});

// =============================
// Xóa 1 hoặc nhiều ảnh
// =============================
router.delete("/", async (req, res) => {
  try {
    const { urls } = req.body;
    if (!urls || !Array.isArray(urls) || urls.length === 0)
      return res.status(400).json({ error: "Missing urls array" });

    const bucketUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/uploads/`;
    const filePaths = urls.map((url) => url.replace(bucketUrl, ""));

    const { error: removeError } = await supabase.storage.from("uploads").remove(filePaths);
    if (removeError) throw removeError;

    // Xóa reference trong DB
    await ParkingLot.updateMany({}, { $pull: { image: { $in: urls } } });
    await Vehicle.updateMany({ image: { $in: urls } }, { $unset: { image: 1 } });
    await User.updateMany({ profilePicture: { $in: urls } }, { $unset: { profilePicture: 1 } });
    await ParkingLot.updateMany({ avtImage: { $in: urls } }, { $unset: { avtImage: 1 } });

    return res.json({ success: true, message: "Ảnh đã được xóa", removed: urls });
  } catch (err) {
    console.error("Delete image failed:", err);
    return res.status(500).json({ error: "Delete failed", details: err.message });
  }
});

export default router;
