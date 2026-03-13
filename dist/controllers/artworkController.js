"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSavedArtworks = exports.toggleSave = exports.toggleLike = exports.deleteArtwork = exports.updateArtwork = exports.createArtwork = exports.getArtwork = exports.getArtworks = exports.getArtworkMediums = void 0;
const Artwork_1 = __importDefault(require("../models/Artwork"));
const errorHandler_1 = require("../middleware/errorHandler");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
// ─── Mediums ──────────────────────────────────────────────────────────────────
const getArtworkMediums = async (req, res) => {
    const mediums = await Artwork_1.default.distinct("medium", {
        medium: { $ne: "" },
        status: { $in: ["published", "available"] },
    });
    res.json({ success: true, data: mediums.sort() });
};
exports.getArtworkMediums = getArtworkMediums;
// ─── List ─────────────────────────────────────────────────────────────────────
const getArtworks = async (req, res) => {
    const { page = "1", limit = "20", status, forSale, category, artist, medium, search, following, } = req.query;
    const filter = {};
    if (status && status !== "all") {
        filter.status = status;
    }
    else {
        filter.status = { $in: ["published", "available"] };
    }
    if (forSale === "true")
        filter.forSale = true;
    if (category)
        filter.categories = category;
    if (artist)
        filter.artist = artist;
    if (medium)
        filter.medium = new RegExp(`^${medium}$`, "i");
    if (following === "true" && req.user?.userId) {
        const User = (await Promise.resolve().then(() => __importStar(require("../models/User")))).default;
        const me = await User.findById(req.user.userId).select("following");
        if (me && me.following.length > 0) {
            filter.artist = { $in: me.following };
        }
        else {
            res.json({
                success: true,
                data: [],
                total: 0,
                page: 1,
                totalPages: 0,
                hasMore: false,
            });
            return;
        }
    }
    if (search) {
        const re = new RegExp(search, "i");
        const User = (await Promise.resolve().then(() => __importStar(require("../models/User")))).default;
        const matchingArtists = await User.find({
            $or: [{ name: re }, { displayName: re }],
        }).select("_id");
        const artistIds = matchingArtists.map((u) => u._id);
        filter.$or = [
            { title: re },
            { description: re },
            { tags: re },
            ...(artistIds.length ? [{ artist: { $in: artistIds } }] : []),
        ];
    }
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;
    const [data, total] = await Promise.all([
        Artwork_1.default.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate("artist", "name displayName avatar slug"),
        Artwork_1.default.countDocuments(filter),
    ]);
    const myId = req.user?.userId;
    const enriched = data.map((a) => ({
        ...a.toJSON(),
        isLiked: myId ? a.likes.some((id) => id.toString() === myId) : false,
        isSaved: myId ? a.saves.some((id) => id.toString() === myId) : false,
    }));
    res.json({
        success: true,
        data: enriched,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        hasMore: skip + limitNum < total,
    });
};
exports.getArtworks = getArtworks;
// ─── Single ───────────────────────────────────────────────────────────────────
const getArtwork = async (req, res) => {
    const artwork = await Artwork_1.default.findById(req.params.id)
        .populate("artist", "name displayName avatar slug bio")
        .populate("exhibition", "title startDate endDate");
    if (!artwork)
        throw new errorHandler_1.AppError("Artwork not found", 404);
    // Increment views without waiting
    Artwork_1.default.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();
    const myId = req.user?.userId;
    const isLiked = myId
        ? artwork.likes.some((id) => id.toString() === myId)
        : false;
    const isSaved = myId
        ? artwork.saves.some((id) => id.toString() === myId)
        : false;
    res.json({
        success: true,
        data: {
            ...artwork.toJSON(),
            isLiked,
            isSaved,
        },
    });
};
exports.getArtwork = getArtwork;
// ─── Create ───────────────────────────────────────────────────────────────────
const createArtwork = async (req, res) => {
    const artwork = await Artwork_1.default.create({
        ...req.body,
        artist: req.user.userId,
    });
    res.status(201).json({ success: true, data: artwork });
};
exports.createArtwork = createArtwork;
// ─── Update ───────────────────────────────────────────────────────────────────
const updateArtwork = async (req, res) => {
    const artwork = await Artwork_1.default.findById(req.params.id);
    if (!artwork)
        throw new errorHandler_1.AppError("Artwork not found", 404);
    const isOwner = artwork.artist.toString() === req.user.userId;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin)
        throw new errorHandler_1.AppError("Not authorised", 403);
    delete req.body.artist;
    const updated = await Artwork_1.default.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    res.json({ success: true, data: updated });
};
exports.updateArtwork = updateArtwork;
// ─── Delete ───────────────────────────────────────────────────────────────────
const deleteArtwork = async (req, res) => {
    const artwork = await Artwork_1.default.findById(req.params.id);
    if (!artwork)
        throw new errorHandler_1.AppError("Artwork not found", 404);
    const isOwner = artwork.artist.toString() === req.user.userId;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin)
        throw new errorHandler_1.AppError("Not authorised", 403);
    // Delete images from Cloudinary
    const deletePromises = artwork.images
        .filter((img) => img.publicId)
        .map((img) => cloudinary_1.default.uploader.destroy(img.publicId).catch(() => { }));
    await Promise.all(deletePromises);
    await artwork.deleteOne();
    res.json({ success: true, message: "Artwork deleted" });
};
exports.deleteArtwork = deleteArtwork;
// ─── Like ─────────────────────────────────────────────────────────────────────
const toggleLike = async (req, res) => {
    const userId = req.user.userId;
    const artwork = await Artwork_1.default.findById(req.params.id);
    if (!artwork)
        throw new errorHandler_1.AppError("Artwork not found", 404);
    const alreadyLiked = artwork.likes.some((id) => id.toString() === userId);
    const update = alreadyLiked
        ? { $pull: { likes: userId }, $inc: { likesCount: -1 } }
        : { $addToSet: { likes: userId }, $inc: { likesCount: 1 } };
    const updated = await Artwork_1.default.findByIdAndUpdate(req.params.id, update, {
        new: true,
    });
    res.json({
        success: true,
        data: { liked: !alreadyLiked, likesCount: updated.likesCount },
    });
};
exports.toggleLike = toggleLike;
// ─── Save ─────────────────────────────────────────────────────────────────────
const toggleSave = async (req, res) => {
    const userId = req.user.userId;
    const artwork = await Artwork_1.default.findById(req.params.id);
    if (!artwork)
        throw new errorHandler_1.AppError("Artwork not found", 404);
    const alreadySaved = artwork.saves.some((id) => id.toString() === userId);
    const update = alreadySaved
        ? { $pull: { saves: userId }, $inc: { savesCount: -1 } }
        : { $addToSet: { saves: userId }, $inc: { savesCount: 1 } };
    const updated = await Artwork_1.default.findByIdAndUpdate(req.params.id, update, {
        new: true,
    });
    res.json({
        success: true,
        data: { saved: !alreadySaved, savesCount: updated.savesCount },
    });
};
exports.toggleSave = toggleSave;
// ─── Saved artworks ───────────────────────────────────────────────────────────
const getSavedArtworks = async (req, res) => {
    const userId = req.user.userId;
    const { page = "1", limit = "20" } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;
    const [data, total] = await Promise.all([
        Artwork_1.default.find({ saves: userId, status: { $in: ["published", "available"] } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate("artist", "name displayName avatar slug"),
        Artwork_1.default.countDocuments({ saves: userId }),
    ]);
    const enriched = data.map((a) => ({
        ...a.toJSON(),
        isLiked: a.likes.some((id) => id.toString() === userId),
        isSaved: true,
    }));
    res.json({
        success: true,
        data: enriched,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        hasMore: skip + limitNum < total,
    });
};
exports.getSavedArtworks = getSavedArtworks;
//# sourceMappingURL=artworkController.js.map