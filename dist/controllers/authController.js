"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getMe = exports.refresh = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const errorHandler_1 = require("../middleware/errorHandler");
// ─── Helpers ──────────────────────────────────────────────────────────────────
const signAccessToken = (payload) => jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
});
const signRefreshToken = (payload) => jsonwebtoken_1.default.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
});
// ─── Register ─────────────────────────────────────────────────────────────────
const register = async (req, res) => {
    const { email, password, name, role } = req.body;
    if (!email || !password)
        throw new errorHandler_1.AppError('Email and password are required', 400);
    const existing = await User_1.default.findOne({ email });
    if (existing)
        throw new errorHandler_1.AppError('Email already in use', 409);
    const user = await User_1.default.create({ email, password, name, role });
    const payload = { userId: user.id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    res.status(201).json({
        success: true,
        data: { user, accessToken, refreshToken },
    });
};
exports.register = register;
// ─── Login ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        throw new errorHandler_1.AppError('Email and password are required', 400);
    const user = await User_1.default.findByEmail(email);
    if (!user || !(await user.comparePassword(password))) {
        throw new errorHandler_1.AppError('Invalid email or password', 401);
    }
    const payload = { userId: user.id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    res.json({
        success: true,
        data: { user, accessToken, refreshToken },
    });
};
exports.login = login;
// ─── Refresh ──────────────────────────────────────────────────────────────────
const refresh = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken)
        throw new errorHandler_1.AppError('Refresh token required', 400);
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    }
    catch {
        throw new errorHandler_1.AppError('Invalid or expired refresh token', 401);
    }
    const user = await User_1.default.findById(decoded.userId).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
        throw new errorHandler_1.AppError('Refresh token mismatch', 401);
    }
    const payload = { userId: user.id, role: user.role };
    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });
    res.json({
        success: true,
        data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
};
exports.refresh = refresh;
// ─── Me ───────────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
    const user = await User_1.default.findById(req.user.userId);
    if (!user)
        throw new errorHandler_1.AppError('User not found', 404);
    res.json({ success: true, data: { user } });
};
exports.getMe = getMe;
// ─── Logout ───────────────────────────────────────────────────────────────────
const logout = async (req, res) => {
    await User_1.default.findByIdAndUpdate(req.user.userId, { $unset: { refreshToken: 1 } });
    res.json({ success: true, message: 'Logged out successfully' });
};
exports.logout = logout;
//# sourceMappingURL=authController.js.map