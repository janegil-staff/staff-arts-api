"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = __importDefault(require("./routes/auth"));
const artworks_1 = __importDefault(require("./routes/artworks"));
const users_1 = __importDefault(require("./routes/users"));
const events_1 = __importDefault(require("./routes/events"));
const exhibitions_1 = __importDefault(require("./routes/exhibitions"));
const tracks_1 = __importDefault(require("./routes/tracks"));
const conversations_1 = __importDefault(require("./routes/conversations"));
const search_1 = __importDefault(require("./routes/search"));
const upload_1 = __importDefault(require("./routes/upload"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// ─── Security & logging ───────────────────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: '*', credentials: true }));
app.use((0, morgan_1.default)(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
// ─── Rate limiting ────────────────────────────────────────────────────────────
app.use((0, express_rate_limit_1.default)({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 2000,
    skip: (req) => req.path.includes("/auth/refresh") || req.path.includes("/socket.io"),
    message: { success: false, error: 'Too many requests, please try again later' },
}));
// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express_1.default.json({ limit: '100mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ success: true, message: 'Art API is running 🎨', env: process.env.NODE_ENV });
});
// ─── Routes — match Flutter ApiConfig paths ───────────────────────────────────
app.use('/api/mobile/auth', auth_1.default);
app.use('/api/mobile', auth_1.default);
app.use('/api/artworks', artworks_1.default);
app.use('/api/users', users_1.default);
app.use('/api/events', events_1.default);
app.use('/api/exhibitions', exhibitions_1.default);
app.use('/api/music', tracks_1.default);
app.use('/api/conversations', conversations_1.default);
app.use('/api/search', search_1.default);
app.use('/api/upload', upload_1.default);
// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});
// ─── Error handler (must be last) ────────────────────────────────────────────
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map