// src/controllers/commentController.ts
import { Response } from "express";
import Comment from "../models/Comment";
import Artwork from "../models/Artwork";
import { AuthRequest } from "../types";
import { AppError } from "../middleware/errorHandler";

export const getComments = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const comments = await Comment.find({ artwork: req.params.id as string })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("user", "name displayName avatar");

  res.json({ success: true, data: comments });
};

export const addComment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { text } = req.body;
  if (!text?.trim()) throw new AppError("Text is required", 400);

  const artwork = await Artwork.findById(req.params.id as string);
  if (!artwork) throw new AppError("Artwork not found", 404);

  const comment = await Comment.create({
    artwork: req.params.id as string,
    user: req.user!.userId,
    text: text.trim(),
  });

  await Artwork.findByIdAndUpdate(req.params.id as string, {
    $inc: { commentsCount: 1 },
  });

  const populated = await Comment.findById(comment._id).populate(
    "user",
    "name displayName avatar",
  );

  res.status(201).json({ success: true, data: populated });
};

export const deleteComment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const comment = await Comment.findById(req.params.commentId as string);
  if (!comment) throw new AppError("Comment not found", 404);

  const isOwner = comment.user.toString() === req.user!.userId;
  const isAdmin = req.user!.role === "admin";
  if (!isOwner && !isAdmin) throw new AppError("Not authorised", 403);

  await comment.deleteOne();
  await Artwork.findByIdAndUpdate(req.params.id as string, {
    $inc: { commentsCount: -1 },
  });

  res.json({ success: true, message: "Comment deleted" });
};
