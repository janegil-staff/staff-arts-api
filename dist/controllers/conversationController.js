"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.getUnreadCounts = exports.getMessages = exports.getOrCreateConversation = exports.getConversations = void 0;
const Conversation_1 = require("../models/Conversation");
const errorHandler_1 = require("../middleware/errorHandler");
// ─── Get my conversations ─────────────────────────────────────────────────────
const getConversations = async (req, res) => {
    const conversations = await Conversation_1.Conversation.find({
        participants: req.user.userId,
    })
        .sort({ lastMessageAt: -1 })
        .populate("participants", "name displayName avatar slug")
        .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name displayName avatar slug" },
    });
    res.json({ success: true, data: conversations });
};
exports.getConversations = getConversations;
// ─── Start or get conversation ────────────────────────────────────────────────
const getOrCreateConversation = async (req, res) => {
    const { participantId } = req.body;
    if (!participantId)
        throw new errorHandler_1.AppError("participantId is required", 400);
    if (participantId === req.user.userId)
        throw new errorHandler_1.AppError("Cannot message yourself", 400);
    const existing = await Conversation_1.Conversation.findOne({
        participants: { $all: [req.user.userId, participantId] },
    })
        .populate("participants", "name displayName avatar slug")
        .populate("lastMessage");
    if (existing) {
        res.json({ success: true, data: existing });
        return;
    }
    const conversation = await Conversation_1.Conversation.create({
        participants: [req.user.userId, participantId],
    });
    const populated = await Conversation_1.Conversation.findById(conversation._id)
        .populate("participants", "name displayName avatar slug")
        .populate("lastMessage");
    res.status(201).json({ success: true, data: populated });
};
exports.getOrCreateConversation = getOrCreateConversation;
// ─── Get messages ─────────────────────────────────────────────────────────────
const getMessages = async (req, res) => {
    const convo = await Conversation_1.Conversation.findById(req.params.id);
    if (!convo)
        throw new errorHandler_1.AppError("Conversation not found", 404);
    const isParticipant = convo.participants.some((p) => p.toString() === req.user.userId);
    if (!isParticipant)
        throw new errorHandler_1.AppError("Not a participant", 403);
    const messages = await Conversation_1.Message.find({ conversation: req.params.id })
        .sort({ createdAt: 1 })
        .populate("sender", "name displayName avatar slug");
    // Mark all unread as read
    await Conversation_1.Message.updateMany({ conversation: req.params.id, readBy: { $ne: req.user.userId } }, { $addToSet: { readBy: req.user.userId } });
    res.json({ success: true, data: messages });
};
exports.getMessages = getMessages;
// ─── Get unread counts ───────────────────────────────────────────────────────
const getUnreadCounts = async (req, res) => {
    const conversations = await Conversation_1.Conversation.find({
        participants: req.user.userId,
    }).populate({
        path: "lastMessage",
        select: "sender readBy",
    });
    const counts = {};
    for (const convo of conversations) {
        const id = convo._id.toString();
        const lastMsg = convo.lastMessage;
        if (!lastMsg) {
            counts[id] = 0;
            continue;
        }
        const senderId = lastMsg.sender?.toString() ?? "";
        const readBy = (lastMsg.readBy ?? []).map((r) => r.toString());
        const isUnread = senderId !== req.user.userId && !readBy.includes(req.user.userId);
        counts[id] = isUnread ? 1 : 0;
    }
    res.json({ success: true, data: counts });
};
exports.getUnreadCounts = getUnreadCounts;
// ─── Send message ─────────────────────────────────────────────────────────────
const sendMessage = async (req, res) => {
    const convo = await Conversation_1.Conversation.findById(req.params.id);
    if (!convo)
        throw new errorHandler_1.AppError("Conversation not found", 404);
    const isParticipant = convo.participants.some((p) => p.toString() === req.user.userId);
    if (!isParticipant)
        throw new errorHandler_1.AppError("Not a participant", 403);
    const message = await Conversation_1.Message.create({
        conversation: req.params.id,
        sender: req.user.userId,
        text: req.body.text,
        readBy: [req.user.userId],
    });
    await Conversation_1.Conversation.findByIdAndUpdate(req.params.id, {
        lastMessage: message._id,
        lastMessageAt: new Date(),
    });
    // Populate sender before emitting
    const populated = await Conversation_1.Message.findById(message._id).populate("sender", "name displayName avatar slug");
    // Emit to all sockets in the conversation room
    const io = req.app.get("io");
    if (io) {
        io.to(req.params.id).emit("new_message", populated);
    }
    res.status(201).json({ success: true, data: populated });
};
exports.sendMessage = sendMessage;
//# sourceMappingURL=conversationController.js.map