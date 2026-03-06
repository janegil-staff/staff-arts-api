import { Response } from "express";
import Event from "../models/Event";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../types";

// ─── List ─────────────────────────────────────────────────────────────────────

export const getEvents = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { type, category, upcoming, past } = req.query as Record<
    string,
    string
  >;

  const filter: Record<string, unknown> = {};
  if (type) filter.type = type;
  if (category) filter.category = category;

  if (past === "true") {
    // Explicitly requesting past events
    filter.date = { $lt: new Date() };
  } else {
    // Default: only upcoming events (today or future)
    filter.date = { $gte: new Date() };
  }

  const events = await Event.find(filter)
    .sort({ date: 1 })
    .populate("organizer", "name avatar slug");

  res.json({ success: true, data: events });
};

// ─── Single ───────────────────────────────────────────────────────────────────

export const getEvent = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const event = await Event.findById(req.params.id).populate(
    "organizer",
    "name avatar slug",
  );
  if (!event) throw new AppError("Event not found", 404);
  res.json({ success: true, data: event });
};

// ─── Create ───────────────────────────────────────────────────────────────────

export const createEvent = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const event = await Event.create({
    ...req.body,
    organizer: req.user!.userId,
  });
  res.status(201).json({ success: true, data: event });
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateEvent = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new AppError("Event not found", 404);

  if (
    event.organizer.toString() !== req.user!.userId &&
    req.user!.role !== "admin"
  ) {
    throw new AppError("Not authorised", 403);
  }

  const updated = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: updated });
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const deleteEvent = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new AppError("Event not found", 404);

  if (
    event.organizer.toString() !== req.user!.userId &&
    req.user!.role !== "admin"
  ) {
    throw new AppError("Not authorised", 403);
  }

  await event.deleteOne();
  res.json({ success: true, message: "Event deleted" });
};

// ─── RSVP ─────────────────────────────────────────────────────────────────────

export const toggleRsvp = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const userId = req.user!.userId;
  const event = await Event.findById(req.params.id);
  if (!event) throw new AppError("Event not found", 404);

  const hasRsvp = event.rsvps.some((id) => id.toString() === userId);

  const update = hasRsvp
    ? { $pull: { rsvps: userId } }
    : { $addToSet: { rsvps: userId } };

  const updated = await Event.findByIdAndUpdate(req.params.id, update, {
    new: true,
  });

  res.json({
    success: true,
    data: { rsvp: !hasRsvp, rsvpCount: updated!.rsvps.length },
  });
};
