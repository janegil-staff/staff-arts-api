import { Router } from "express";
import multer from "multer";
import { uploadImage, deleteImage } from "../controllers/uploadController";
import { authenticate } from "../middleware/auth";

const router = Router();

// Store in memory — we stream directly to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  },
});

router.post("/image", authenticate, upload.single("image"), uploadImage);
router.delete("/image", authenticate, deleteImage);

export default router;
