import { Response } from "express";
import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../types";

// ─── Upload single image ──────────────────────────────────────────────────────
// POST /api/upload/image?folder=artworks|avatars|exhibitions|events|covers

export const uploadImage = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  if (!req.file) throw new AppError("No file provided", 400);

  const folder = (req.query.folder as string) || "uploads";
  const allowedFolders = [
    "artworks",
    "avatars",
    "exhibitions",
    "events",
    "covers",
    "uploads",
    "tracks",
  ];
  const safeFolder = allowedFolders.includes(folder) ? folder : "uploads";

  // Upload buffer to Cloudinary
  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: safeFolder,
        resource_type: "auto",
        transformation: [{ quality: "auto:good" }, { fetch_format: "auto" }],
      },
      (error, result) => {
        if (error || !result)
          return reject(error ?? new Error("Upload failed"));
        resolve(result);
      },
    );
    stream.end(req.file!.buffer);
  });

  res.status(201).json({
    success: true,
    data: {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      // Generate blur placeholder URL
      blurUrl: cloudinary.url(result.public_id, {
        transformation: [{ width: 20, quality: 10, fetch_format: "auto" }],
        secure: true,
      }),
    },
  });
};

// ─── Delete image ─────────────────────────────────────────────────────────────
// DELETE /api/upload/image — body: { publicId }

export const deleteImage = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { publicId } = req.body as { publicId?: string };
  if (!publicId) throw new AppError("publicId is required", 400);

  await cloudinary.uploader.destroy(publicId);
  res.json({ success: true, message: "Image deleted" });
};
