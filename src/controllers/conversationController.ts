// src/controllers/conversationController.ts
import { Response } from "express";
import { Message, Conversation } from "../models/Conversation";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../types";

// ─── Get my conversations ─────────────────────────────────────────────────────

export const getConversations = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const conversations = await Conversation.find({
    participants: req.user!.userId,
  })
    .sort({ lastMessageAt: -1 })
    .populate("participants", "name displayName avatar slug")
    .populate({
      path: "lastMessage",
      populate: { path: "sender", select: "name displayName avatar slug" },
    });

  res.json({ success: true, data: conversations });
};

// ─── Start or get conversation ────────────────────────────────────────────────

export const getOrCreateConversation = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { participantId } = req.body as { participantId?: string };
  if (!participantId) throw new AppError("participantId is required", 400);
  if (participantId === req.user!.userId)
    throw new AppError("Cannot message yourself", 400);

  const existing = await Conversation.findOne({
    participants: { $all: [req.user!.userId, participantId] },
  })
    .populate("participants", "name displayName avatar slug")
    .populate("lastMessage");

  if (existing) {
    res.json({ success: true, data: existing });
    return;
  }

  const conversation = await Conversation.create({
    participants: [req.user!.userId, participantId],
  });

  const populated = await Conversation.findById(
    (conversation._id as mongoose.Types.ObjectId).toString(),
  )
    .populate("participants", "name displayName avatar slug")
    .populate("lastMessage");

  res.status(201).json({ success: true, data: populated });
};

// ─── Get messages ─────────────────────────────────────────────────────────────

export const getMessages = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const convo = await Conversation.findById(req.params.id as string);
  if (!convo) throw new AppError("Conversation not found", 404);

  const isParticipant = convo.participants.some(
    (p) => p.toString() === req.user!.userId,
  );
  if (!isParticipant) throw new AppError("Not a participant", 403);

  const messages = await Message.find({ conversation: req.params.id as string })
    .sort({ createdAt: 1 })
    .populate("sender", "name displayName avatar slug");

  await Message.updateMany(
    {
      conversation: req.params.id as string,
      readBy: { $ne: req.user!.userId },
    },
    { $addToSet: { readBy: req.user!.userId } },
  );

  res.json({ success: true, data: messages });
};

// ─── Get unread counts ────────────────────────────────────────────────────────

export const getUnreadCounts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const conversations = await Conversation.find({
    participants: req.user!.userId,
  }).populate({
    path: "lastMessage",
    select: "sender readBy",
  });

  const counts: Record<string, number> = {};

  for (const convo of conversations) {
    const id = (convo._id as any).toString();
    const lastMsg = convo.lastMessage as any;
    if (!lastMsg) {
      counts[id] = 0;
      continue;
    }

    const senderId = lastMsg.sender?.toString() ?? "";
    const readBy: string[] = (lastMsg.readBy ?? []).map((r: any) =>
      r.toString(),
    );
    const isUnread =
      senderId !== req.user!.userId && !readBy.includes(req.user!.userId);
    counts[id] = isUnread ? 1 : 0;
  }

  res.json({ success: true, data: counts });
};

// ─── Send message ─────────────────────────────────────────────────────────────

export const sendMessage = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const convo = await Conversation.findById(req.params.id as string);
  if (!convo) throw new AppError("Conversation not found", 404);

  const isParticipant = convo.participants.some(
    (p) => p.toString() === req.user!.userId,
  );
  if (!isParticipant) throw new AppError("Not a participant", 403);

  const message = await Message.create({
    conversation: req.params.id as string,
    sender: req.user!.userId,
    text: req.body.text,
    readBy: [req.user!.userId],
  });

  await Conversation.findByIdAndUpdate(req.params.id as string, {
    lastMessage: message._id,
    lastMessageAt: new Date(),
  });

  const populated = await Message.findById(message._id).populate(
    "sender",
    "name displayName avatar slug",
  );

  const io = req.app.get("io");
  if (io) {
    io.to(req.params.id).emit("new_message", populated);
  }

  res.status(201).json({ success: true, data: populated });
};
