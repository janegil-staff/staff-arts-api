"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleRsvp = exports.deleteEvent = exports.updateEvent = exports.createEvent = exports.getEvent = exports.getEvents = void 0;
const Event_1 = __importDefault(require("../models/Event"));
const errorHandler_1 = require("../middleware/errorHandler");
// ─── List ─────────────────────────────────────────────────────────────────────
const getEvents = async (req, res) => {
    const { type, category, upcoming, past } = req.query;
    const filter = {};
    if (type)
        filter.type = type;
    if (category)
        filter.category = category;
    if (past === "true") {
        // Explicitly requesting past events
        filter.date = { $lt: new Date() };
    }
    else {
        // Default: only upcoming events (today or future)
        filter.date = { $gte: new Date() };
    }
    const events = await Event_1.default.find(filter)
        .sort({ date: 1 })
        .populate("organizer", "name avatar slug");
    res.json({ success: true, data: events });
};
exports.getEvents = getEvents;
// ─── Single ───────────────────────────────────────────────────────────────────
const getEvent = async (req, res) => {
    const event = await Event_1.default.findById(req.params.id).populate("organizer", "name avatar slug");
    if (!event)
        throw new errorHandler_1.AppError("Event not found", 404);
    res.json({ success: true, data: event });
};
exports.getEvent = getEvent;
// ─── Create ───────────────────────────────────────────────────────────────────
const createEvent = async (req, res) => {
    const event = await Event_1.default.create({
        ...req.body,
        organizer: req.user.userId,
    });
    res.status(201).json({ success: true, data: event });
};
exports.createEvent = createEvent;
// ─── Update ───────────────────────────────────────────────────────────────────
const updateEvent = async (req, res) => {
    const event = await Event_1.default.findById(req.params.id);
    if (!event)
        throw new errorHandler_1.AppError("Event not found", 404);
    if (event.organizer.toString() !== req.user.userId &&
        req.user.role !== "admin") {
        throw new errorHandler_1.AppError("Not authorised", 403);
    }
    const updated = await Event_1.default.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    res.json({ success: true, data: updated });
};
exports.updateEvent = updateEvent;
// ─── Delete ───────────────────────────────────────────────────────────────────
const deleteEvent = async (req, res) => {
    const event = await Event_1.default.findById(req.params.id);
    if (!event)
        throw new errorHandler_1.AppError("Event not found", 404);
    if (event.organizer.toString() !== req.user.userId &&
        req.user.role !== "admin") {
        throw new errorHandler_1.AppError("Not authorised", 403);
    }
    await event.deleteOne();
    res.json({ success: true, message: "Event deleted" });
};
exports.deleteEvent = deleteEvent;
// ─── RSVP ─────────────────────────────────────────────────────────────────────
const toggleRsvp = async (req, res) => {
    const userId = req.user.userId;
    const event = await Event_1.default.findById(req.params.id);
    if (!event)
        throw new errorHandler_1.AppError("Event not found", 404);
    const hasRsvp = event.rsvps.some((id) => id.toString() === userId);
    const update = hasRsvp
        ? { $pull: { rsvps: userId } }
        : { $addToSet: { rsvps: userId } };
    const updated = await Event_1.default.findByIdAndUpdate(req.params.id, update, {
        new: true,
    });
    res.json({
        success: true,
        data: { rsvp: !hasRsvp, rsvpCount: updated.rsvps.length },
    });
};
exports.toggleRsvp = toggleRsvp;
//# sourceMappingURL=eventController.js.map