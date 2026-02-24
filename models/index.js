import mongoose from "mongoose";

// ─── Post ────────────────────────────────────────────────────
const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  content: { type: String, required: true, maxlength: 3000 },
  images: [{ url: String, publicId: String, width: Number, height: Number }],
  artwork: { type: mongoose.Schema.Types.ObjectId, ref: "Artwork", default: null },
  type: { type: String, enum: ["post", "review", "story", "announcement"], default: "post" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  tags: [String],
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });
postSchema.index({ createdAt: -1 });
export const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

// ─── Comment ─────────────────────────────────────────────────
const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  targetType: { type: String, enum: ["artwork", "post", "exhibition"], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  content: { type: String, required: true, maxlength: 1000 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  likesCount: { type: Number, default: 0 },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
}, { timestamps: true });
commentSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
export const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);

// ─── Exhibition ──────────────────────────────────────────────
const exhibitionSchema = new mongoose.Schema({
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, maxlength: 200 },
  description: { type: String, maxlength: 5000 },
  coverImage: { url: String, publicId: String },
  artworks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Artwork" }],
  artists: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: { type: String, default: "" },
  isVirtual: { type: Boolean, default: false },
  virtualUrl: { type: String, default: "" },
  ticketPrice: { type: Number, default: 0 },
  isFree: { type: Boolean, default: true },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: { type: String, enum: ["upcoming", "live", "past", "cancelled"], default: "upcoming" },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });
exhibitionSchema.index({ status: 1, startDate: 1 });
export const Exhibition = mongoose.models.Exhibition || mongoose.model("Exhibition", exhibitionSchema);

// ─── Event ───────────────────────────────────────────────────
const eventSchema = new mongoose.Schema({
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, maxlength: 200 },
  description: { type: String, maxlength: 5000 },
  type: { type: String, enum: ["opening", "workshop", "talk", "fair", "other"], default: "other" },
  coverImage: { url: String, publicId: String },
  date: { type: Date, required: true },
  endDate: Date,
  location: { type: String, default: "" },
  isOnline: { type: Boolean, default: false },
  link: String,
  maxAttendees: Number,
  rsvps: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  price: { type: Number, default: 0 },
  isFree: { type: Boolean, default: true },
}, { timestamps: true });
eventSchema.index({ date: 1, type: 1 });
export const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);

// ─── Order ───────────────────────────────────────────────────
const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  artwork: { type: mongoose.Schema.Types.ObjectId, ref: "Artwork", required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  platformFee: { type: Number, required: true },
  artistPayout: { type: Number, required: true },
  stripePaymentIntentId: String,
  status: {
    type: String,
    enum: ["pending", "paid", "shipped", "delivered", "cancelled", "refunded"],
    default: "pending",
  },
  shippingAddress: {
    name: String, line1: String, line2: String, city: String, state: String, zip: String, country: String,
  },
  trackingNumber: String,
}, { timestamps: true });
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, createdAt: -1 });
export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

// ─── Commission ──────────────────────────────────────────────
const commissionSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, maxlength: 5000 },
  budget: { type: Number },
  deadline: Date,
  references: [{ url: String, publicId: String }],
  status: {
    type: String,
    enum: ["inquiry", "accepted", "in_progress", "review", "completed", "cancelled"],
    default: "inquiry",
  },
}, { timestamps: true });
export const Commission = mongoose.models.Commission || mongoose.model("Commission", commissionSchema);

// ─── Conversation & Message ──────────────────────────────────
const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  lastMessage: { type: String, default: "" },
  lastMessageAt: { type: Date, default: Date.now },
}, { timestamps: true });
conversationSchema.index({ participants: 1, lastMessageAt: -1 });
export const Conversation = mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, maxlength: 5000 },
  images: [{ url: String, publicId: String }],
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });
export const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);

// ─── Music Track ─────────────────────────────────────────────
const musicTrackSchema = new mongoose.Schema({
  artist: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, maxlength: 2000 },
  audioUrl: { type: String, required: true },
  coverImage: { url: String, publicId: String },
  duration: Number,
  genre: String,
  tags: [String],
  bpm: Number,
  forSale: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
  plays: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  likesCount: { type: Number, default: 0 },
}, { timestamps: true });
export const MusicTrack = mongoose.models.MusicTrack || mongoose.model("MusicTrack", musicTrackSchema);

// ─── Notification ────────────────────────────────────────────
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  body: String,
  data: mongoose.Schema.Types.Mixed,
  isRead: { type: Boolean, default: false },
}, { timestamps: true });
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
export const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

// ─── Collection (user curated) ───────────────────────────────
const collectionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, maxlength: 1000 },
  artworks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Artwork" }],
  isPublic: { type: Boolean, default: true },
}, { timestamps: true });
export const Collection = mongoose.models.Collection || mongoose.model("Collection", collectionSchema);
