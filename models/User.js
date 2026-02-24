import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false, minlength: 8 },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, unique: true, sparse: true, lowercase: true },
    avatar: { type: String, default: null },
    coverImage: { type: String, default: null },
    bio: { type: String, maxlength: 500, default: "" },
    role: { type: String, enum: ["artist", "gallery", "collector", "admin"], default: "collector" },

    // Profile
    location: { type: String, default: "" },
    website: { type: String, default: "" },
    socialLinks: {
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
      tiktok: { type: String, default: "" },
      behance: { type: String, default: "" },
    },

    // Artist-specific
    mediums: [{ type: String }],
    styles: [{ type: String }],
    isAvailableForCommission: { type: Boolean, default: false },

    // OAuth
    googleId: { type: String, default: null, sparse: true },

    // Stripe
    stripeAccountId: { type: String, default: null },
    stripeCustomerId: { type: String, default: null },
    stripeOnboarded: { type: Boolean, default: false },

    // Social
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },

    // Flags
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Preferences
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      showEmail: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ role: 1, isFeatured: 1 });
userSchema.index({ name: "text", bio: "text" });

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Auto-generate slug from name
userSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-") +
      "-" + Math.random().toString(36).slice(2, 6);
  }
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model("User", userSchema);
