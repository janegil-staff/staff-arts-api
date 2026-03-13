"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleAttend = exports.deleteExhibition = exports.updateExhibition = exports.createExhibition = exports.getExhibition = exports.getExhibitions = void 0;
const Exhibition_1 = __importDefault(require("../models/Exhibition"));
const errorHandler_1 = require("../middleware/errorHandler");
// ─── List ─────────────────────────────────────────────────────────────────────
const getExhibitions = async (req, res) => {
    const { past } = req.query;
    const filter = {};
    if (past === "true") {
        // Explicitly requesting past exhibitions
        filter.endDate = { $lt: new Date() };
    }
    else {
        // Default: only active or upcoming (endDate today or in the future)
        filter.endDate = { $gte: new Date() };
    }
    const exhibitions = await Exhibition_1.default.find(filter)
        .sort({ startDate: 1 })
        .populate("organizer", "name avatar slug")
        .populate("artists", "name avatar slug");
    res.json({ success: true, data: exhibitions });
};
exports.getExhibitions = getExhibitions;
// ─── Single ───────────────────────────────────────────────────────────────────
const getExhibition = async (req, res) => {
    const exhibition = await Exhibition_1.default.findById(req.params.id)
        .populate("organizer", "name avatar slug")
        .populate("artists", "name avatar slug")
        .populate("artworks");
    if (!exhibition)
        throw new errorHandler_1.AppError("Exhibition not found", 404);
    res.json({ success: true, data: exhibition });
};
exports.getExhibition = getExhibition;
// ─── Create ───────────────────────────────────────────────────────────────────
const createExhibition = async (req, res) => {
    const exhibition = await Exhibition_1.default.create({
        ...req.body,
        organizer: req.user.userId,
    });
    res.status(201).json({ success: true, data: exhibition });
};
exports.createExhibition = createExhibition;
// ─── Update ───────────────────────────────────────────────────────────────────
const updateExhibition = async (req, res) => {
    const exhibition = await Exhibition_1.default.findById(req.params.id);
    if (!exhibition)
        throw new errorHandler_1.AppError("Exhibition not found", 404);
    if (exhibition.organizer.toString() !== req.user.userId &&
        req.user.role !== "admin") {
        throw new errorHandler_1.AppError("Not authorised", 403);
    }
    const updated = await Exhibition_1.default.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    res.json({ success: true, data: updated });
};
exports.updateExhibition = updateExhibition;
// ─── Delete ───────────────────────────────────────────────────────────────────
const deleteExhibition = async (req, res) => {
    const exhibition = await Exhibition_1.default.findById(req.params.id);
    if (!exhibition)
        throw new errorHandler_1.AppError("Exhibition not found", 404);
    if (exhibition.organizer.toString() !== req.user.userId &&
        req.user.role !== "admin") {
        throw new errorHandler_1.AppError("Not authorised", 403);
    }
    await exhibition.deleteOne();
    res.json({ success: true, message: "Exhibition deleted" });
};
exports.deleteExhibition = deleteExhibition;
// ─── Attend ───────────────────────────────────────────────────────────────────
const toggleAttend = async (req, res) => {
    const userId = req.user.userId;
    const exhibition = await Exhibition_1.default.findById(req.params.id);
    if (!exhibition)
        throw new errorHandler_1.AppError("Exhibition not found", 404);
    const isAttending = exhibition.attendees.some((id) => id.toString() === userId);
    const update = isAttending
        ? { $pull: { attendees: userId } }
        : { $addToSet: { attendees: userId } };
    const updated = await Exhibition_1.default.findByIdAndUpdate(req.params.id, update, {
        new: true,
    });
    res.json({
        success: true,
        data: { attending: !isAttending, attendeeCount: updated.attendees.length },
    });
};
exports.toggleAttend = toggleAttend;
//# sourceMappingURL=exhibitionController.js.map