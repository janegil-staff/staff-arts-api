"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.addComment = exports.getComments = void 0;
const Comment_1 = __importDefault(require("../models/Comment"));
const Artwork_1 = __importDefault(require("../models/Artwork"));
const errorHandler_1 = require("../middleware/errorHandler");
const getComments = async (req, res) => {
    const comments = await Comment_1.default.find({ artwork: req.params.id })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("user", "name displayName avatar");
    res.json({ success: true, data: comments });
};
exports.getComments = getComments;
const addComment = async (req, res) => {
    const { text } = req.body;
    if (!text?.trim())
        throw new errorHandler_1.AppError("Text is required", 400);
    const artwork = await Artwork_1.default.findById(req.params.id);
    if (!artwork)
        throw new errorHandler_1.AppError("Artwork not found", 404);
    const comment = await Comment_1.default.create({
        artwork: req.params.id,
        user: req.user.userId,
        text: text.trim(),
    });
    await Artwork_1.default.findByIdAndUpdate(req.params.id, {
        $inc: { commentsCount: 1 },
    });
    const populated = await comment.populate("user", "name displayName avatar");
    res.status(201).json({ success: true, data: populated });
};
exports.addComment = addComment;
const deleteComment = async (req, res) => {
    const comment = await Comment_1.default.findById(req.params.commentId);
    if (!comment)
        throw new errorHandler_1.AppError("Comment not found", 404);
    const isOwner = comment.user.toString() === req.user.userId;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin)
        throw new errorHandler_1.AppError("Not authorised", 403);
    await comment.deleteOne();
    await Artwork_1.default.findByIdAndUpdate(req.params.id, {
        $inc: { commentsCount: -1 },
    });
    res.json({ success: true, message: "Comment deleted" });
};
exports.deleteComment = deleteComment;
//# sourceMappingURL=commentController.js.map