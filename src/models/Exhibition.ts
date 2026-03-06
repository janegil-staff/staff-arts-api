import mongoose, { Document, Schema } from 'mongoose';
import { ICoverImage, ExhibitionStatus } from '../types';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IExhibition extends Document {
  organizer: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  coverImage?: ICoverImage;
  artworks: mongoose.Types.ObjectId[];
  artists: mongoose.Types.ObjectId[];
  startDate: Date;
  endDate: Date;
  location: string;
  isVirtual: boolean;
  virtualUrl: string;
  ticketPrice: number;
  isFree: boolean;
  attendees: mongoose.Types.ObjectId[];
  status: ExhibitionStatus;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Sub-schema ───────────────────────────────────────────────────────────────

const coverImageSchema = new Schema<ICoverImage>(
  { url: String, publicId: String },
  { _id: false }
);

// ─── Schema ───────────────────────────────────────────────────────────────────

const exhibitionSchema = new Schema<IExhibition>(
  {
    organizer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, maxlength: 5000 },
    coverImage: { type: coverImageSchema },
    artworks: [{ type: Schema.Types.ObjectId, ref: 'Artwork' }],
    artists: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String, default: '' },
    isVirtual: { type: Boolean, default: false },
    virtualUrl: { type: String, default: '' },
    ticketPrice: { type: Number, default: 0, min: 0 },
    isFree: { type: Boolean, default: true },
    attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: ['upcoming', 'live', 'past', 'cancelled'] as ExhibitionStatus[],
      default: 'upcoming',
    },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

exhibitionSchema.index({ status: 1, startDate: 1 });
exhibitionSchema.index({ organizer: 1 });
exhibitionSchema.index({ artists: 1 });

export default mongoose.model<IExhibition>('Exhibition', exhibitionSchema);
