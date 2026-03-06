import { Response } from 'express';
import { Message, Conversation } from '../models/Conversation';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

// ─── Get my conversations ─────────────────────────────────────────────────────

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  const conversations = await Conversation.find({ participants: req.user!.userId })
    .sort({ lastMessageAt: -1 })
    .populate('participants', 'name avatar slug')
    .populate('lastMessage');

  res.json({ success: true, data: conversations });
};

// ─── Start or get conversation ────────────────────────────────────────────────

export const getOrCreateConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  const { participantId } = req.body as { participantId?: string };
  if (!participantId) throw new AppError('participantId is required', 400);
  if (participantId === req.user!.userId) throw new AppError('Cannot message yourself', 400);

  const existing = await Conversation.findOne({
    participants: { $all: [req.user!.userId, participantId] },
  });

  if (existing) {
    res.json({ success: true, data: existing });
    return;
  }

  const conversation = await Conversation.create({
    participants: [req.user!.userId, participantId],
  });

  res.status(201).json({ success: true, data: conversation });
};

// ─── Get messages ─────────────────────────────────────────────────────────────

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  const convo = await Conversation.findById(req.params.id);
  if (!convo) throw new AppError('Conversation not found', 404);

  const isParticipant = convo.participants.some((p) => p.toString() === req.user!.userId);
  if (!isParticipant) throw new AppError('Not a participant', 403);

  const messages = await Message.find({ conversation: req.params.id })
    .sort({ createdAt: 1 })
    .populate('sender', 'name avatar slug');

  // Mark all unread messages as read
  await Message.updateMany(
    { conversation: req.params.id, readBy: { $ne: req.user!.userId } },
    { $addToSet: { readBy: req.user!.userId } }
  );

  res.json({ success: true, data: messages });
};

// ─── Send message ─────────────────────────────────────────────────────────────

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  const convo = await Conversation.findById(req.params.id);
  if (!convo) throw new AppError('Conversation not found', 404);

  const isParticipant = convo.participants.some((p) => p.toString() === req.user!.userId);
  if (!isParticipant) throw new AppError('Not a participant', 403);

  const message = await Message.create({
    conversation: req.params.id,
    sender: req.user!.userId,
    text: req.body.text,
    readBy: [req.user!.userId],
  });

  await Conversation.findByIdAndUpdate(req.params.id, {
    lastMessage: message._id,
    lastMessageAt: new Date(),
  });

  res.status(201).json({ success: true, data: message });
};
