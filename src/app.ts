import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRouter from "./routes/auth";
import artworkRouter from "./routes/artworks";
import userRouter from "./routes/users";
import eventRouter from "./routes/events";
import exhibitionRouter from "./routes/exhibitions";
import trackRouter from "./routes/tracks";
import conversationRouter from "./routes/conversations";
import searchRouter from "./routes/search";
import uploadRouter from "./routes/upload";

import { errorHandler } from "./middleware/errorHandler";

const app = express();

// ─── Security & logging ───────────────────────────────────────────────────────

app.use(helmet());
app.use(cors({ origin: "*", credentials: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ─── Rate limiting ────────────────────────────────────────────────────────────

app.use(
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 2000,
    skip: (req) =>
      req.path.includes("/auth/refresh") || req.path.includes("/socket.io"),
    message: {
      success: false,
      error: "Too many requests, please try again later",
    },
  }),
);

// ─── Body parsing ─────────────────────────────────────────────────────────────

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Art API is running 🎨",
    env: process.env.NODE_ENV,
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use("/api/mobile/auth", authRouter);
app.use("/api/mobile", authRouter);
app.use("/api/artworks", artworkRouter);
app.use("/api/users", userRouter);
app.use("/api/events", eventRouter);
app.use("/api/exhibitions", exhibitionRouter);
app.use("/api/music", trackRouter);
app.use("/api/conversations", conversationRouter);
app.use("/api/search", searchRouter);
app.use("/api/upload", uploadRouter);

// ─── 404 ──────────────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// ─── Error handler (must be last) ────────────────────────────────────────────

app.use(errorHandler);

export default app;
