import { Response } from 'express';
import Track from '../models/Track';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

// ─── List ─────────────────────────────────────────────────────────────────────

export const getTracks = async (_req: AuthRequest, res: Response): Promise<void> => {
  const tracks = await Track.find()
    .sort({ createdAt: -1 })
    .populate('artist', 'name avatar slug');

  res.json({ success: true, data: tracks });
};

// ─── Single ───────────────────────────────────────────────────────────────────

export const getTrack = async (req: AuthRequest, res: Response): Promise<void> => {
  const track = await Track.findById(req.params.id).populate('artist', 'name avatar slug');
  if (!track) throw new AppError('Track not found', 404);

  // Increment plays without blocking response
  Track.findByIdAndUpdate(req.params.id, { $inc: { plays: 1 } }).exec();

  res.json({ success: true, data: track });
};

// ─── Create ───────────────────────────────────────────────────────────────────

export const createTrack = async (req: AuthRequest, res: Response): Promise<void> => {
  const track = await Track.create({ ...req.body, artist: req.user!.userId });
  res.status(201).json({ success: true, data: track });
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateTrack = async (req: AuthRequest, res: Response): Promise<void> => {
  const track = await Track.findById(req.params.id);
  if (!track) throw new AppError('Track not found', 404);

  if (track.artist.toString() !== req.user!.userId && req.user!.role !== 'admin') {
    throw new AppError('Not authorised', 403);
  }

  const updated = await Track.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: updated });
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const deleteTrack = async (req: AuthRequest, res: Response): Promise<void> => {
  const track = await Track.findById(req.params.id);
  if (!track) throw new AppError('Track not found', 404);

  if (track.artist.toString() !== req.user!.userId && req.user!.role !== 'admin') {
    throw new AppError('Not authorised', 403);
  }

  await track.deleteOne();
  res.json({ success: true, message: 'Track deleted' });
};
