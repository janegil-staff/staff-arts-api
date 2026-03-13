"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.getUserArtworks = exports.toggleFollow = exports.updateUser = exports.getUserById = exports.getUserByUsername = exports.getUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const Artwork_1 = __importDefault(require("../models/Artwork"));
const errorHandler_1 = require("../middleware/errorHandler");
const Exhibition_1 = __importDefault(require("../models/Exhibition"));
const Track_1 = __importDefault(require("../models/Track"));
const Event_1 = __importDefault(require("../models/Event"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
// ─── List users ───────────────────────────────────────────────────────────────
const getUsers = async (req, res) => {
    const { role, featured, search, // ← legg til
    page = "1", limit = "20", } = req.query;
    const filter = {};
    if (role)
        filter.role = role;
    if (featured === "true")
        filter.isFeatured = true;
    if (search) { // ← legg til
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { displayName: { $regex: search, $options: 'i' } },
            { username: { $regex: search, $options: 'i' } },
        ];
    }
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;
    const [data, total] = await Promise.all([
        User_1.default.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
        User_1.default.countDocuments(filter),
    ]);
    res.json({
        success: true,
        data,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        hasMore: skip + limitNum < total,
    });
};
exports.getUsers = getUsers;
// ─── Get by username/slug ─────────────────────────────────────────────────────
const getUserByUsername = async (req, res) => {
    const user = await User_1.default.findOne({
        $or: [{ username: req.params.username }, { slug: req.params.username }],
    });
    if (!user)
        throw new errorHandler_1.AppError("User not found", 404);
    const myId = req.user?.userId;
    const isFollowing = myId
        ? user.followers.some((id) => id.toString() === myId)
        : false;
    res.json({ success: true, data: { ...user.toJSON(), isFollowing } });
};
exports.getUserByUsername = getUserByUsername;
const getUserById = async (req, res) => {
    const user = await User_1.default.findById(req.params.id);
    if (!user)
        throw new errorHandler_1.AppError("User not found", 404);
    const myId = req.user?.userId;
    const isFollowing = myId
        ? user.followers.some((id) => id.toString() === myId)
        : false;
    res.json({ success: true, data: { ...user.toJSON(), isFollowing } });
};
exports.getUserById = getUserById;
// ─── Update profile ───────────────────────────────────────────────────────────
const updateUser = async (req, res) => {
    if (req.params.id !== req.user.userId && req.user.role !== "admin") {
        throw new errorHandler_1.AppError("Not authorised", 403);
    }
    // Prevent privilege escalation
    const allowedRoles = ["artist", "collector", "gallery"];
    if (req.body.role && !allowedRoles.includes(req.body.role)) {
        delete req.body.role;
    }
    delete req.body.password;
    delete req.body.refreshToken;
    const user = await User_1.default.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!user)
        throw new errorHandler_1.AppError("User not found", 404);
    res.json({ success: true, data: user });
};
exports.updateUser = updateUser;
// ─── Follow / Unfollow ────────────────────────────────────────────────────────
const toggleFollow = async (req, res) => {
    const myId = req.user.userId;
    const targetId = req.params.id;
    if (targetId === myId)
        throw new errorHandler_1.AppError("Cannot follow yourself", 400);
    const target = await User_1.default.findById(targetId);
    if (!target)
        throw new errorHandler_1.AppError("User not found", 404);
    const isFollowing = target.followers.some((id) => id.toString() === myId);
    if (isFollowing) {
        await User_1.default.findByIdAndUpdate(targetId, { $pull: { followers: myId } });
        await User_1.default.findByIdAndUpdate(myId, { $pull: { following: targetId } });
    }
    else {
        await User_1.default.findByIdAndUpdate(targetId, { $addToSet: { followers: myId } });
        await User_1.default.findByIdAndUpdate(myId, { $addToSet: { following: targetId } });
    }
    // Emit live update to target user's room
    const io = req.app.get("io");
    io?.to(`user_${targetId}`).emit("follow_update", {
        following: !isFollowing,
        followerCount: target.followers.length + (isFollowing ? -1 : 1),
    });
    res.json({ success: true, data: { following: !isFollowing } });
};
exports.toggleFollow = toggleFollow;
// ─── Get user's artworks ──────────────────────────────────────────────────────
const getUserArtworks = async (req, res) => {
    const myId = req.user?.userId;
    const isOwner = myId === req.params.id;
    const filter = { artist: req.params.id };
    if (!isOwner)
        filter.status = { $in: ["published", "available"] };
    const artworks = await Artwork_1.default.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: artworks });
};
exports.getUserArtworks = getUserArtworks;
const deleteUser = async (req, res) => {
    if (req.params.id !== req.user.userId && req.user.role !== 'admin') {
        throw new errorHandler_1.AppError('Not authorised', 403);
    }
    const userId = req.params.id;
    // Delete Cloudinary images for artworks
    const artworks = await Artwork_1.default.find({ artist: userId });
    const artworkImageDeletes = artworks.flatMap((a) => a.images
        .filter((img) => img.publicId)
        .map((img) => cloudinary_1.default.uploader.destroy(img.publicId).catch(() => { })));
    // Delete Cloudinary images for events
    const events = await Event_1.default.find({ createdBy: userId });
    const eventImageDeletes = events
        .filter((e) => e.coverImage?.publicId)
        .map((e) => cloudinary_1.default.uploader.destroy(e.coverImage.publicId).catch(() => { }));
    // Delete Cloudinary images for exhibitions
    const exhibitions = await Exhibition_1.default.find({ createdBy: userId });
    const exhibitionImageDeletes = exhibitions
        .filter((e) => e.coverImage?.publicId)
        .map((e) => cloudinary_1.default.uploader.destroy(e.coverImage.publicId).catch(() => { }));
    await Promise.all([
        ...artworkImageDeletes,
        ...eventImageDeletes,
        ...exhibitionImageDeletes,
    ]);
    // Delete all associated content
    await Promise.all([
        Artwork_1.default.deleteMany({ artist: userId }),
        Event_1.default.deleteMany({ createdBy: userId }),
        Exhibition_1.default.deleteMany({ createdBy: userId }),
        Track_1.default.deleteMany({ artist: userId }),
    ]);
    await User_1.default.findByIdAndDelete(userId);
    res.json({ success: true, message: 'Account deleted' });
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=userController.js.map