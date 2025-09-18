import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import User from '../models/user.model.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const { type, userId } = req.body;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    let folder = "uploads";
    if (type === "avatar") folder = "avatars";
    else if (type === "vehicle") folder = "vehicles";

    const fileName = `${folder}/${userId || 'unknown'}_${Date.now()}_${file.originalname}`;

    const { error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("uploads")
      .getPublicUrl(fileName);

    if (type === "avatar" && userId) {
      await User.findByIdAndUpdate(
        userId,
        { profilePicture: publicUrlData.publicUrl },
        { new: true }
      );
    }

    res.json({ url: publicUrlData.publicUrl });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
