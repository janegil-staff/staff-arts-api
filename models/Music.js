import mongoose from "mongoose";

const trackSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Audio file (Cloudinary)
    audioUrl: { type: String, required: true },
    audioPublicId: { type: String },
    duration: { type: Number, default: 0 }, // seconds

    // Cover art (Cloudinary)
    coverImage: { type: String, default: null },
    coverPublicId: { type: String },

    // Album / playlist grouping
    album: { type: String, default: "" },
    trackNumber: { type: Number, default: 1 },

    // Tags
    genre: { type: String, default: "" },
    mood: { type: String, default: "" },
    tags: [{ type: String }],

    // Description
    description: { type: String, default: "", maxlength: 500 },

    // Engagement
    plays: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likesCount: { type: Number, default: 0 },

    // Visibility
    status: {
      type: String,
      enum: ["published", "draft", "archived"],
      default: "published",
    },
  },
  { timestamps: true },
);

trackSchema.index({ artist: 1, createdAt: -1 });
trackSchema.index({ genre: 1 });
trackSchema.index({ album: 1, trackNumber: 1 });
trackSchema.index({ plays: -1 });
trackSchema.index({ title: "text", album: "text", tags: "text" });

export default mongoose.models.Music || mongoose.model("Music", trackSchema);
