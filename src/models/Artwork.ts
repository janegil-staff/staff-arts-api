import mongoose, { Document, Schema } from 'mongoose';
import { IImage, IDimensions, ArtworkStatus, DimensionUnit } from '../types';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IArtwork extends Document {
  artist: mongoose.Types.ObjectId;
  title: string;
  description: string;
  images: IImage[];

  // Classification
  medium: string;
  style: string;
  subject: string;
  materials: string[];
  categories: string[];
  tags: string[];
  aiTags: string[];
  aiDescription: string;
  mood: string;
  dominantColors: string[];

  // Physical
  dimensions?: IDimensions;
  year?: number;
  edition: string;

  // Sale
  forSale: boolean;
  price: number;
  currency: string;
  isOriginal: boolean;
  isPrint: boolean;
  isDigital: boolean;
  shippingInfo: string;

  // Engagement
  views: number;
  likes: mongoose.Types.ObjectId[];
  likesCount: number;
  saves: mongoose.Types.ObjectId[];
  savesCount: number;
  commentsCount: number;

  // Status
  status: ArtworkStatus;
  isFeatured: boolean;

  // Relations
  exhibition?: mongoose.Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const imageSchema = new Schema<IImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    width: Number,
    height: Number,
    blurUrl: String,
  },
  { _id: false }
);

const dimensionsSchema = new Schema<IDimensions>(
  {
    width: Number,
    height: Number,
    depth: Number,
    unit: {
      type: String,
      enum: ['in', 'cm', 'mm'] as DimensionUnit[],
      default: 'in',
    },
  },
  { _id: false }
);

// ─── Schema ───────────────────────────────────────────────────────────────────

const artworkSchema = new Schema<IArtwork>(
  {
    artist: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, maxlength: 5000, default: '' },
    images: {
      type: [imageSchema],
      required: true,
      validate: {
        validator: (v: IImage[]) => v.length > 0,
        message: 'At least one image is required',
      },
    },

    // Classification
    medium: { type: String, default: '' },
    style: { type: String, default: '' },
    subject: { type: String, default: '' },
    materials: [{ type: String }],
    categories: [{ type: String }],
    tags: [{ type: String }],
    aiTags: [{ type: String }],
    aiDescription: { type: String, default: '' },
    mood: { type: String, default: '' },
    dominantColors: [{ type: String }],

    // Physical
    dimensions: { type: dimensionsSchema },
    year: { type: Number },
    edition: { type: String, default: '' },

    // Sale
    forSale: { type: Boolean, default: false },
    price: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'USD', uppercase: true },
    isOriginal: { type: Boolean, default: true },
    isPrint: { type: Boolean, default: false },
    isDigital: { type: Boolean, default: false },
    shippingInfo: { type: String, default: '' },

    // Engagement — counts are denormalised for performance
    views: { type: Number, default: 0, min: 0 },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0, min: 0 },
    saves: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    savesCount: { type: Number, default: 0, min: 0 },
    commentsCount: { type: Number, default: 0, min: 0 },

    // FIX: removed duplicate 'published' value from enum
    status: {
      type: String,
      enum: ['draft', 'published', 'sold', 'archived', 'available'] as ArtworkStatus[],
      default: 'published',
    },
    isFeatured: { type: Boolean, default: false },

    exhibition: {
      type: Schema.Types.ObjectId,
      ref: 'Exhibition',
      default: null,
    },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

artworkSchema.index({ status: 1, createdAt: -1 });
artworkSchema.index({ artist: 1, status: 1 });
artworkSchema.index({ forSale: 1, price: 1 });
artworkSchema.index({ categories: 1 });
artworkSchema.index({ tags: 1 });
artworkSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.model<IArtwork>('Artwork', artworkSchema);
