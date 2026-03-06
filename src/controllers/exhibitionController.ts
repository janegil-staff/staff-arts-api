import { Response } from "express";
import Exhibition from "../models/Exhibition";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../types";

// ─── List ─────────────────────────────────────────────────────────────────────

export const getExhibitions = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { past } = req.query as Record<string, string>;

  const filter: Record<string, unknown> = {};

  if (past === "true") {
    // Explicitly requesting past exhibitions
    filter.endDate = { $lt: new Date() };
  } else {
    // Default: only active or upcoming (endDate today or in the future)
    filter.endDate = { $gte: new Date() };
  }

  const exhibitions = await Exhibition.find(filter)
    .sort({ startDate: 1 })
    .populate("organizer", "name avatar slug")
    .populate("artists", "name avatar slug");

  res.json({ success: true, data: exhibitions });
};

// ─── Single ───────────────────────────────────────────────────────────────────

export const getExhibition = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const exhibition = await Exhibition.findById(req.params.id)
    .populate("organizer", "name avatar slug")
    .populate("artists", "name avatar slug")
    .populate("artworks");

  if (!exhibition) throw new AppError("Exhibition not found", 404);
  res.json({ success: true, data: exhibition });
};

// ─── Create ───────────────────────────────────────────────────────────────────

export const createExhibition = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const exhibition = await Exhibition.create({
    ...req.body,
    organizer: req.user!.userId,
  });
  res.status(201).json({ success: true, data: exhibition });
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateExhibition = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const exhibition = await Exhibition.findById(req.params.id);
  if (!exhibition) throw new AppError("Exhibition not found", 404);

  if (
    exhibition.organizer.toString() !== req.user!.userId &&
    req.user!.role !== "admin"
  ) {
    throw new AppError("Not authorised", 403);
  }

  const updated = await Exhibition.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: updated });
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const deleteExhibition = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const exhibition = await Exhibition.findById(req.params.id);
  if (!exhibition) throw new AppError("Exhibition not found", 404);

  if (
    exhibition.organizer.toString() !== req.user!.userId &&
    req.user!.role !== "admin"
  ) {
    throw new AppError("Not authorised", 403);
  }

  await exhibition.deleteOne();
  res.json({ success: true, message: "Exhibition deleted" });
};

// ─── Attend ───────────────────────────────────────────────────────────────────

export const toggleAttend = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const userId = req.user!.userId;
  const exhibition = await Exhibition.findById(req.params.id);
  if (!exhibition) throw new AppError("Exhibition not found", 404);

  const isAttending = exhibition.attendees.some(
    (id) => id.toString() === userId,
  );

  const update = isAttending
    ? { $pull: { attendees: userId } }
    : { $addToSet: { attendees: userId } };

  const updated = await Exhibition.findByIdAndUpdate(req.params.id, update, {
    new: true,
  });

  res.json({
    success: true,
    data: { attending: !isAttending, attendeeCount: updated!.attendees.length },
  });
};
