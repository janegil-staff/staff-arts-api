import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../types';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  displayName?: string;
  username?: string;
  slug?: string;
  role: UserRole;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  website: string;
  verified: boolean;
  socialLinks: Map<string, string>;
  mediums: string[];
  styles: string[];
  isAvailableForCommission: boolean;
  isFeatured: boolean;
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  savedArtworks: mongoose.Types.ObjectId[];
  refreshToken?: string;
  followerCount: number;   // virtual
  followingCount: number;  // virtual
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(candidate: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const userSchema = new Schema<IUser, IUserModel>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    name: { type: String, trim: true },
    displayName: { type: String, trim: true },
    username: { type: String, trim: true, lowercase: true, sparse: true, unique: true },
    slug: { type: String, trim: true, lowercase: true, sparse: true, unique: true },
    role: {
      type: String,
      enum: ['artist', 'collector', 'curator', 'gallery', 'admin'],
      default: 'collector',
    },
    avatar: { type: String },
    coverImage: { type: String },
    bio: { type: String, maxlength: 500 },
    location: { type: String },
    website: { type: String, default: '' },
    verified: { type: Boolean, default: false },
    socialLinks: { type: Map, of: String, default: {} },
    mediums: [{ type: String }],
    styles: [{ type: String }],
    isAvailableForCommission: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    savedArtworks: [{ type: Schema.Types.ObjectId, ref: 'Artwork' }],
    refreshToken: { type: String, select: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ─────────────────────────────────────────────────────────────────

userSchema.virtual('followerCount').get(function (this: IUser) {
  return this.followers?.length ?? 0;
});

userSchema.virtual('followingCount').get(function (this: IUser) {
  return this.following?.length ?? 0;
});

// ─── Hooks ────────────────────────────────────────────────────────────────────

userSchema.pre('save', async function () {
  // Auto-generate slug from username if not set
  if (this.isModified('username') && this.username && !this.slug) {
    this.slug = this.username;
  }

  // Hash password only when changed
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

// ─── Methods ──────────────────────────────────────────────────────────────────

userSchema.methods.comparePassword = async function (
  this: IUser,
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// Remove sensitive fields when serialising to JSON
userSchema.methods.toJSON = function (this: IUser) {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.followers;
  delete obj.following;
  delete obj.savedArtworks;
  return obj;
};

// ─── Statics ──────────────────────────────────────────────────────────────────

userSchema.static('findByEmail', function (email: string) {
  return this.findOne({ email }).select('+password +refreshToken');
});

// ─── Indexes ──────────────────────────────────────────────────────────────────

userSchema.index({ role: 1, isFeatured: 1 });
userSchema.index({ name: 'text', displayName: 'text', bio: 'text' });

export default mongoose.model<IUser, IUserModel>('User', userSchema);
