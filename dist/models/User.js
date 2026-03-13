"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// ─── Schema ───────────────────────────────────────────────────────────────────
const userSchema = new mongoose_1.Schema({
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
    followers: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    savedArtworks: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Artwork' }],
    refreshToken: { type: String, select: false },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// ─── Virtuals ─────────────────────────────────────────────────────────────────
userSchema.virtual('followerCount').get(function () {
    return this.followers?.length ?? 0;
});
userSchema.virtual('followingCount').get(function () {
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
        this.password = await bcryptjs_1.default.hash(this.password, 12);
    }
});
// ─── Methods ──────────────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidate) {
    return bcryptjs_1.default.compare(candidate, this.password);
};
// Remove sensitive fields when serialising to JSON
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.refreshToken;
    delete obj.followers;
    delete obj.following;
    delete obj.savedArtworks;
    return obj;
};
// ─── Statics ──────────────────────────────────────────────────────────────────
userSchema.static('findByEmail', function (email) {
    return this.findOne({ email }).select('+password +refreshToken');
});
// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ role: 1, isFeatured: 1 });
userSchema.index({ name: 'text', displayName: 'text', bio: 'text' });
exports.default = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=User.js.map