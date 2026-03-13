// src/controllers/authController.ts
import { Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest, JwtPayload } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const signAccessToken = (payload: JwtPayload): string =>
  jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  } as jwt.SignOptions);

const signRefreshToken = (payload: JwtPayload): string =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  } as jwt.SignOptions);

// ─── Register ─────────────────────────────────────────────────────────────────

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password, name, role } = req.body as {
    email: string;
    password: string;
    name?: string;
    role?: string;
  };

  if (!email || !password) throw new AppError('Email and password are required', 400);

  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already in use', 409);

  const user = await User.create({ email, password, name, role });

  const payload: JwtPayload = { userId: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.status(201).json({
    success: true,
    data: { user, accessToken, refreshToken },
  });
};

// ─── Login ────────────────────────────────────────────────────────────────────

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) throw new AppError('Email and password are required', 400);

  const user = await User.findByEmail(email);
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const payload: JwtPayload = { userId: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    data: { user, accessToken, refreshToken },
  });
};

// ─── Refresh ──────────────────────────────────────────────────────────────────

export const refresh = async (req: AuthRequest, res: Response): Promise<void> => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) throw new AppError('Refresh token required', 400);

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await User.findById(decoded.userId).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError('Refresh token mismatch', 401);
  }

  const payload: JwtPayload = { userId: user._id.toString(), role: user.role };
  const newAccessToken = signAccessToken(payload);
  const newRefreshToken = signRefreshToken(payload);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
  });
};

// ─── Me ───────────────────────────────────────────────────────────────────────

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user!.userId);
  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, data: { user } });
};

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  await User.findByIdAndUpdate(req.user!.userId, { $unset: { refreshToken: 1 } });
  res.json({ success: true, message: 'Logged out successfully' });
};