"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTrack = exports.updateTrack = exports.createTrack = exports.getTrack = exports.getTracks = void 0;
const Track_1 = __importDefault(require("../models/Track"));
const errorHandler_1 = require("../middleware/errorHandler");
// ─── List ─────────────────────────────────────────────────────────────────────
const getTracks = async (_req, res) => {
    const tracks = await Track_1.default.find()
        .sort({ createdAt: -1 })
        .populate('artist', 'name avatar slug');
    res.json({ success: true, data: tracks });
};
exports.getTracks = getTracks;
// ─── Single ───────────────────────────────────────────────────────────────────
const getTrack = async (req, res) => {
    const track = await Track_1.default.findById(req.params.id).populate('artist', 'name avatar slug');
    if (!track)
        throw new errorHandler_1.AppError('Track not found', 404);
    // Increment plays without blocking response
    Track_1.default.findByIdAndUpdate(req.params.id, { $inc: { plays: 1 } }).exec();
    res.json({ success: true, data: track });
};
exports.getTrack = getTrack;
// ─── Create ───────────────────────────────────────────────────────────────────
const createTrack = async (req, res) => {
    const track = await Track_1.default.create({ ...req.body, artist: req.user.userId });
    res.status(201).json({ success: true, data: track });
};
exports.createTrack = createTrack;
// ─── Update ───────────────────────────────────────────────────────────────────
const updateTrack = async (req, res) => {
    const track = await Track_1.default.findById(req.params.id);
    if (!track)
        throw new errorHandler_1.AppError('Track not found', 404);
    if (track.artist.toString() !== req.user.userId && req.user.role !== 'admin') {
        throw new errorHandler_1.AppError('Not authorised', 403);
    }
    const updated = await Track_1.default.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    res.json({ success: true, data: updated });
};
exports.updateTrack = updateTrack;
// ─── Delete ───────────────────────────────────────────────────────────────────
const deleteTrack = async (req, res) => {
    const track = await Track_1.default.findById(req.params.id);
    if (!track)
        throw new errorHandler_1.AppError('Track not found', 404);
    if (track.artist.toString() !== req.user.userId && req.user.role !== 'admin') {
        throw new errorHandler_1.AppError('Not authorised', 403);
    }
    await track.deleteOne();
    res.json({ success: true, message: 'Track deleted' });
};
exports.deleteTrack = deleteTrack;
//# sourceMappingURL=trackController.js.map