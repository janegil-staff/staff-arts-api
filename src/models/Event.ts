import mongoose, { Document, Schema } from 'mongoose';
import { ICoverImage, EventType, EventCategory } from '../types';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IEvent extends Document {
  organizer: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type: EventType;
  category: EventCategory;
  coverImage?: ICoverImage;
  date: Date;
  endDate?: Date;
  location: string;
  isOnline: boolean;
  link?: string;
  maxAttendees?: number;
  rsvps: mongoose.Types.ObjectId[];
  attendees: mongoose.Types.ObjectId[];
  price: number;
  isFree: boolean;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Sub-schema ───────────────────────────────────────────────────────────────

const coverImageSchema = new Schema<ICoverImage>(
  {
    url: { type: String },
    publicId: { type: String },
  },
  { _id: false }
);

// ─── Schema ───────────────────────────────────────────────────────────────────

const eventSchema = new Schema<IEvent>(
  {
    organizer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, maxlength: 5000 },
    type: {
      type: String,
      enum: [
        'opening', 'workshop', 'talk', 'fair', 'other',
        'concert', 'dj_set', 'live_performance', 'open_mic',
        'festival', 'album_release',
      ] as EventType[],
      default: 'other',
    },
    category: {
      type: String,
      enum: ['exhibition', 'event', 'music'] as EventCategory[],
      default: 'event',
    },
    coverImage: { type: coverImageSchema },
    date: { type: Date, required: true },
    endDate: { type: Date },
    location: { type: String, default: '' },
    isOnline: { type: Boolean, default: false },
    link: { type: String },
    maxAttendees: { type: Number, min: 1 },
    rsvps: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    price: { type: Number, default: 0, min: 0 },
    isFree: { type: Boolean, default: true },
    currency: { type: String, default: 'NOK', uppercase: true },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

eventSchema.index({ date: 1, type: 1 });
eventSchema.index({ category: 1, date: 1 });
eventSchema.index({ organizer: 1 });

export default mongoose.model<IEvent>('Event', eventSchema);
