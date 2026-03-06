import mongoose, { Document, Schema } from 'mongoose';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface ITrack extends Document {
  title: string;
  artist: mongoose.Types.ObjectId;
  artistName?: string;
  audioUrl: string;
  coverUrl?: string;
  duration?: number;  // seconds
  genre?: string;
  plays: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const trackSchema = new Schema<ITrack>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    artist: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    artistName: { type: String, trim: true },
    audioUrl: { type: String, required: true },
    coverUrl: { type: String },
    duration: { type: Number, min: 0 },
    genre: { type: String, trim: true },
    plays: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

trackSchema.index({ title: 'text', artistName: 'text', genre: 'text' });
trackSchema.index({ artist: 1, createdAt: -1 });

export default mongoose.model<ITrack>('Track', trackSchema);
