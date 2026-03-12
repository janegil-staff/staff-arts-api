import { Response } from "express";
import Artwork from "../models/Artwork";
import { AuthRequest, PaginationQuery } from "../types";
import { AppError } from "../middleware/errorHandler";

// ─── Mediums ──────────────────────────────────────────────────────────────────

export const getArtworkMediums = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const mediums = await Artwork.distinct("medium", {
    medium: { $ne: "" },
    status: { $in: ["published", "available"] },
  });
  res.json({ success: true, data: mediums.sort() });
};

// ─── List ─────────────────────────────────────────────────────────────────────
export const getArtworks = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const {
    page = "1",
    limit = "20",
    status,
    forSale,
    category,
    artist,
    medium,
    search,
  } = req.query as PaginationQuery & {
    status?: string;
    forSale?: string;
    category?: string;
    artist?: string;
    medium?: string;
    search?: string;
  };

  const filter: Record<string, unknown> = {};

  if (status && status !== "all") {
    filter.status = status;
  } else {
    filter.status = { $in: ["published", "available"] };
  }
  if (forSale === "true") filter.forSale = true;
  if (category) filter.categories = category;
  if (artist) filter.artist = artist;
  if (medium) filter.medium = new RegExp(`^${medium}$`, "i"); // case-insensitive match

  if (search) {
    const re = new RegExp(search, "i");

    // Find matching artist IDs first
    const User = (await import("../models/User")).default;
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
    Artwork.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("artist", "name displayName avatar slug"),
    Artwork.countDocuments(filter),
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

// ─── Single ───────────────────────────────────────────────────────────────────

export const getArtwork = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const artwork = await Artwork.findById(req.params.id)
    .populate("artist", "name displayName avatar slug bio")
    .populate("exhibition", "title startDate endDate");

  if (!artwork) throw new AppError("Artwork not found", 404);

  // Increment views without waiting
  Artwork.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();

  res.json({ success: true, data: artwork });
};

// ─── Create ───────────────────────────────────────────────────────────────────

export const createArtwork = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const artwork = await Artwork.create({
    ...req.body,
    artist: req.user!.userId,
  });

  res.status(201).json({ success: true, data: artwork });
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateArtwork = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const artwork = await Artwork.findById(req.params.id);
  if (!artwork) throw new AppError("Artwork not found", 404);

  const isOwner = artwork.artist.toString() === req.user!.userId;
  const isAdmin = req.user!.role === "admin";
  if (!isOwner && !isAdmin) throw new AppError("Not authorised", 403);

  // Prevent overwriting artist field
  delete req.body.artist;

  const updated = await Artwork.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: updated });
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const deleteArtwork = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const artwork = await Artwork.findById(req.params.id);
  if (!artwork) throw new AppError("Artwork not found", 404);

  const isOwner = artwork.artist.toString() === req.user!.userId;
  const isAdmin = req.user!.role === "admin";
  if (!isOwner && !isAdmin) throw new AppError("Not authorised", 403);

  await artwork.deleteOne();
  res.json({ success: true, message: "Artwork deleted" });
};

// ─── Like ─────────────────────────────────────────────────────────────────────

export const toggleLike = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const userId = req.user!.userId;
  const artwork = await Artwork.findById(req.params.id);
  if (!artwork) throw new AppError("Artwork not found", 404);

  const alreadyLiked = artwork.likes.some((id) => id.toString() === userId);

  const update = alreadyLiked
    ? { $pull: { likes: userId }, $inc: { likesCount: -1 } }
    : { $addToSet: { likes: userId }, $inc: { likesCount: 1 } };

  const updated = await Artwork.findByIdAndUpdate(req.params.id, update, {
    new: true,
  });

  res.json({
    success: true,
    data: { liked: !alreadyLiked, likesCount: updated!.likesCount },
  });
};

// ─── Save ─────────────────────────────────────────────────────────────────────

export const toggleSave = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const userId = req.user!.userId;
  const artwork = await Artwork.findById(req.params.id);
  if (!artwork) throw new AppError("Artwork not found", 404);

  const alreadySaved = artwork.saves.some((id) => id.toString() === userId);

  const update = alreadySaved
    ? { $pull: { saves: userId }, $inc: { savesCount: -1 } }
    : { $addToSet: { saves: userId }, $inc: { savesCount: 1 } };

  const updated = await Artwork.findByIdAndUpdate(req.params.id, update, {
    new: true,
  });

  res.json({
    success: true,
    data: { saved: !alreadySaved, savesCount: updated!.savesCount },
  });
};
