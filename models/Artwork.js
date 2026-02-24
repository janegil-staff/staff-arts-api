import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  width: Number,
  height: Number,
  blurUrl: String,
}, { _id: false });

const artworkSchema = new mongoose.Schema(
  {
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, maxlength: 5000, default: "" },
    images: { type: [imageSchema], required: true, validate: [v => v.length > 0, "At least one image"] },

    // Classification
    medium: { type: String, default: "" },
    style: { type: String, default: "" },
    subject: { type: String, default: "" },
    materials: [{ type: String }],
    categories: [{ type: String }],
    tags: [{ type: String }],
    aiTags: [{ type: String }],
    aiDescription: { type: String, default: "" },
    mood: { type: String, default: "" },
    dominantColors: [{ type: String }],

    // Physical details
    dimensions: {
      width: Number,
      height: Number,
      depth: Number,
      unit: { type: String, enum: ["in", "cm", "mm"], default: "in" },
    },
    year: { type: Number },
    edition: { type: String, default: "" },

    // Sale info
    forSale: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    isOriginal: { type: Boolean, default: true },
    isPrint: { type: Boolean, default: false },
    isDigital: { type: Boolean, default: false },
    shippingInfo: { type: String, default: "" },

    // Engagement
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likesCount: { type: Number, default: 0 },
    saves: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    savesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },

    // Status
    status: {
      type: String,
      enum: ["draft", "published", "sold", "archived", "available"],
      default: "published",
    },
    isFeatured: { type: Boolean, default: false },

    // Exhibition
    exhibition: { type: mongoose.Schema.Types.ObjectId, ref: "Exhibition", default: null },
  },
  { timestamps: true }
);

// Indexes
artworkSchema.index({ status: 1, createdAt: -1 });
artworkSchema.index({ artist: 1, status: 1 });
artworkSchema.index({ forSale: 1, price: 1 });
artworkSchema.index({ categories: 1 });
artworkSchema.index({ tags: 1 });
artworkSchema.index({ title: "text", description: "text", tags: "text" });

export default mongoose.models.Artwork || mongoose.model("Artwork", artworkSchema);
