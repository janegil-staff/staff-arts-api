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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// ─── Sub-schemas ──────────────────────────────────────────────────────────────
const imageSchema = new mongoose_1.Schema({
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    width: Number,
    height: Number,
    blurUrl: String,
}, { _id: false });
const dimensionsSchema = new mongoose_1.Schema({
    width: Number,
    height: Number,
    depth: Number,
    unit: {
        type: String,
        enum: ['in', 'cm', 'mm'],
        default: 'in',
    },
}, { _id: false });
// ─── Schema ───────────────────────────────────────────────────────────────────
const artworkSchema = new mongoose_1.Schema({
    artist: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            validator: (v) => v.length > 0,
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
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0, min: 0 },
    saves: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    savesCount: { type: Number, default: 0, min: 0 },
    commentsCount: { type: Number, default: 0, min: 0 },
    // FIX: removed duplicate 'published' value from enum
    status: {
        type: String,
        enum: ['draft', 'published', 'sold', 'archived', 'available'],
        default: 'published',
    },
    isFeatured: { type: Boolean, default: false },
    exhibition: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Exhibition',
        default: null,
    },
}, { timestamps: true });
// ─── Indexes ──────────────────────────────────────────────────────────────────
artworkSchema.index({ status: 1, createdAt: -1 });
artworkSchema.index({ artist: 1, status: 1 });
artworkSchema.index({ forSale: 1, price: 1 });
artworkSchema.index({ categories: 1 });
artworkSchema.index({ tags: 1 });
artworkSchema.index({ title: 'text', description: 'text', tags: 'text' });
exports.default = mongoose_1.default.model('Artwork', artworkSchema);
//# sourceMappingURL=Artwork.js.map