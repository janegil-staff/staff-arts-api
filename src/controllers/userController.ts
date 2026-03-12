import { Response } from "express";
import User from "../models/User";
import Artwork from "../models/Artwork";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest, PaginationQuery } from "../types";

// ─── List users ───────────────────────────────────────────────────────────────

export const getUsers = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const {
    role,
    featured,
    page = "1",
    limit = "20",
  } = req.query as PaginationQuery & { role?: string; featured?: string };

  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;
  if (featured === "true") filter.isFeatured = true;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const [data, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    User.countDocuments(filter),
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

// ─── Get by username/slug ─────────────────────────────────────────────────────

export const getUserByUsername = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const user = await User.findOne({
    $or: [{ username: req.params.username }, { slug: req.params.username }],
  });
  if (!user) throw new AppError("User not found", 404);
  const myId = req.user?.userId;
  const isFollowing = myId
    ? user.followers.some((id) => id.toString() === myId)
    : false;
  res.json({ success: true, data: { ...user.toJSON(), isFollowing } });
};

export const getUserById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError("User not found", 404);
  const myId = req.user?.userId;
  const isFollowing = myId
    ? user.followers.some((id) => id.toString() === myId)
    : false;
  res.json({ success: true, data: { ...user.toJSON(), isFollowing } });
};
// ─── Update profile ───────────────────────────────────────────────────────────

export const updateUser = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  if (req.params.id !== req.user!.userId && req.user!.role !== "admin") {
    throw new AppError("Not authorised", 403);
  }

  // Prevent privilege escalation
  delete req.body.role;
  delete req.body.password;
  delete req.body.refreshToken;

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new AppError("User not found", 404);

  res.json({ success: true, data: user });
};

// ─── Follow / Unfollow ────────────────────────────────────────────────────────

export const toggleFollow = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const myId = req.user!.userId;
  const targetId = req.params.id;
  if (targetId === myId) throw new AppError("Cannot follow yourself", 400);

  const target = await User.findById(targetId);
  if (!target) throw new AppError("User not found", 404);

  const isFollowing = target.followers.some((id) => id.toString() === myId);

  if (isFollowing) {
    await User.findByIdAndUpdate(targetId, { $pull: { followers: myId } });
    await User.findByIdAndUpdate(myId, { $pull: { following: targetId } });
  } else {
    await User.findByIdAndUpdate(targetId, { $addToSet: { followers: myId } });
    await User.findByIdAndUpdate(myId, { $addToSet: { following: targetId } });
  }

  // Emit live update to target user's room
  const io = req.app.get("io");
  io?.to(`user_${targetId}`).emit("follow_update", {
    following: !isFollowing,
    followerCount: target.followers.length + (isFollowing ? -1 : 1),
  });

  res.json({ success: true, data: { following: !isFollowing } });
};
// ─── Get user's artworks ──────────────────────────────────────────────────────

export const getUserArtworks = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const myId = req.user?.userId;
  const isOwner = myId === req.params.id;

  const filter: Record<string, unknown> = { artist: req.params.id };
  if (!isOwner) filter.status = { $in: ['published', 'available'] };

  const artworks = await Artwork.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: artworks });
};
