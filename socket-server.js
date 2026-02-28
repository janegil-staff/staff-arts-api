// socket-server.js — runs alongside Next.js on port 4000
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const PORT = process.env.SOCKET_PORT || 4000;
const JWT_SECRET = process.env.AUTH_SECRET || "change-me-in-production";

const httpServer = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200);
    res.end("ok");
    return;
  }
  // Internal emit endpoint for Next.js API routes
  if (req.url === "/emit" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      try {
        const { room, event, data } = JSON.parse(body);
        io.to(room).emit(event, data);
        res.writeHead(200);
        res.end("ok");
      } catch (e) {
        res.writeHead(400);
        res.end("Bad request");
      }
    });
    return;
  }
  res.writeHead(404);
  res.end();
});

const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

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

const onlineUsers = new Map();

io.on("connection", (socket) => {
  const userId = socket.userId;
  console.log(`[Socket] Connected: ${userId} (${socket.id})`);
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socket.id);
  socket.join(`user:${userId}`);

  // Join/leave conversation rooms
  socket.on("join-conversation", (id) => socket.join(`conv:${id}`));
  socket.on("leave-conversation", (id) => socket.leave(`conv:${id}`));

  // Send message — broadcast to conversation room
  socket.on("sendMessage", (data) => {
    const { conversationId, receiverId } = data;
    if (conversationId) {
      socket.to(`conv:${conversationId}`).emit("newMessage", data);
      // Also emit to receiver's personal room in case they're not in the conv room
      if (receiverId) {
        socket.to(`user:${receiverId}`).emit("newMessage", data);
      }
    }
  });

  // Mark messages as read
  socket.on("markRead", (data) => {
    const { otherUserId, conversationId } = data;
    if (otherUserId) {
      io.to(`user:${otherUserId}`).emit("messagesRead", {
        conversationId,
        readBy: userId,
      });
    }
  });

  // Typing indicators (both formats for compatibility)
  socket.on("typing", (data) => {
    const convId = data.conversationId || data;
    socket.to(`conv:${convId}`).emit("userTyping", { conversationId: convId, userId });
    socket.to(`conv:${convId}`).emit("user-typing", { conversationId: convId, userId });
  });
  socket.on("stopTyping", (data) => {
    const convId = data.conversationId || data;
    socket.to(`conv:${convId}`).emit("userStopTyping", { conversationId: convId, userId });
    socket.to(`conv:${convId}`).emit("user-stop-typing", { conversationId: convId, userId });
  });
  socket.on("stop-typing", (data) => {
    const convId = data.conversationId || data;
    socket.to(`conv:${convId}`).emit("userStopTyping", { conversationId: convId, userId });
    socket.to(`conv:${convId}`).emit("user-stop-typing", { conversationId: convId, userId });
  });

  // Auto-join conversation rooms the user is part of
  socket.on("joinMyConversations", (conversationIds) => {
    if (Array.isArray(conversationIds)) {
      conversationIds.forEach((id) => socket.join(`conv:${id}`));
    }
  });

  socket.on("disconnect", () => {
    const sockets = onlineUsers.get(userId);
    if (sockets) { sockets.delete(socket.id); if (sockets.size === 0) onlineUsers.delete(userId); }
  });
});

httpServer.listen(PORT, () => console.log(`[Socket] Running on port ${PORT}`));
