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
// ─── Sub-schema ───────────────────────────────────────────────────────────────
const coverImageSchema = new mongoose_1.Schema({
    url: { type: String },
    publicId: { type: String },
}, { _id: false });
// ─── Schema ───────────────────────────────────────────────────────────────────
const eventSchema = new mongoose_1.Schema({
    organizer: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        ],
        default: 'other',
    },
    category: {
        type: String,
        enum: ['exhibition', 'event', 'music'],
        default: 'event',
    },
    coverImage: { type: coverImageSchema },
    date: { type: Date, required: true },
    endDate: { type: Date },
    location: { type: String, default: '' },
    isOnline: { type: Boolean, default: false },
    link: { type: String },
    maxAttendees: { type: Number, min: 1 },
    rsvps: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    attendees: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    price: { type: Number, default: 0, min: 0 },
    isFree: { type: Boolean, default: true },
    currency: { type: String, default: 'NOK', uppercase: true },
}, { timestamps: true });
// ─── Indexes ──────────────────────────────────────────────────────────────────
eventSchema.index({ date: 1, type: 1 });
eventSchema.index({ category: 1, date: 1 });
eventSchema.index({ organizer: 1 });
exports.default = mongoose_1.default.model('Event', eventSchema);
//# sourceMappingURL=Event.js.map