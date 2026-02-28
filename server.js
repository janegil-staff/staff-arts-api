// server.js
// Custom server: Next.js + Socket.io on the same port
// Start with: node server.js (not next start)

import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000", 10);
const JWT_SECRET = process.env.AUTH_SECRET || "change-me-in-production";

// ── Next.js ──
const app = next({ dev });
const handle = app.getRequestHandler();

// Track online users: userId -> Set of socket IDs
const onlineUsers = new Map();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  // ── Socket.io ──
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
  });

  // Make io available to API routes via global
  globalThis.__io = io;
  globalThis.__onlineUsers = onlineUsers;

  // Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      socket.userId = payload.userId || payload.id;
      if (!socket.userId) return next(new Error("Invalid token"));
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log(`[Socket] Connected: ${userId} (${socket.id})`);

    // Track online
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join personal room
    socket.join(`user:${userId}`);

    // Conversation rooms
    socket.on("join-conversation", (conversationId) => {
      socket.join(`conv:${conversationId}`);
    });

    socket.on("leave-conversation", (conversationId) => {
      socket.leave(`conv:${conversationId}`);
    });

    // Typing indicators
    socket.on("typing", ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit("user-typing", {
        conversationId,
        userId,
      });
    });

    socket.on("stop-typing", ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit("user-stop-typing", {
        conversationId,
        userId,
      });
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`[Socket] Disconnected: ${userId} (${socket.id})`);
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) onlineUsers.delete(userId);
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`[Server] Next.js + Socket.io running on port ${port}`);
    console.log(`[Server] Mode: ${dev ? "development" : "production"}`);
  });
});