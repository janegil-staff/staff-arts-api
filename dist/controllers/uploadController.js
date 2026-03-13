"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.uploadImage = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const errorHandler_1 = require("../middleware/errorHandler");
// ─── Upload single image ──────────────────────────────────────────────────────
// POST /api/upload/image?folder=artworks|avatars|exhibitions|events|covers
const uploadImage = async (req, res) => {
    if (!req.file)
        throw new errorHandler_1.AppError("No file provided", 400);
    const folder = req.query.folder || "uploads";
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
    const result = await new Promise((resolve, reject) => {
        const stream = cloudinary_1.default.uploader.upload_stream({
            folder: safeFolder,
            resource_type: "auto",
            transformation: [{ quality: "auto:good" }, { fetch_format: "auto" }],
        }, (error, result) => {
            if (error || !result)
                return reject(error ?? new Error("Upload failed"));
            resolve(result);
        });
        stream.end(req.file.buffer);
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
            blurUrl: cloudinary_1.default.url(result.public_id, {
                transformation: [{ width: 20, quality: 10, fetch_format: "auto" }],
                secure: true,
            }),
        },
    });
};
exports.uploadImage = uploadImage;
// ─── Delete image ─────────────────────────────────────────────────────────────
// DELETE /api/upload/image — body: { publicId }
const deleteImage = async (req, res) => {
    const { publicId } = req.body;
    if (!publicId)
        throw new errorHandler_1.AppError("publicId is required", 400);
    await cloudinary_1.default.uploader.destroy(publicId);
    res.json({ success: true, message: "Image deleted" });
};
exports.deleteImage = deleteImage;
//# sourceMappingURL=uploadController.js.map