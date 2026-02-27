// socket-server.js
// Run SEPARATELY alongside Next.js: node socket-server.js
// Next.js runs on :3000, Socket.IO runs on :3001

const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const PORT = process.env.SOCKET_PORT || 3001;
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/staffarts";

// ── CONNECT TO DB ──
mongoose.connect(MONGO_URI).then(() => {
  console.log("📦 MongoDB connected");
});

// Import models after connection
const Message = require("./models/Message");
const Conversation = require("./models/Conversation");

// ── CREATE SERVER ──
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*", // tighten in production
    methods: ["GET", "POST"],
  },
});

// Track online users: userId → Set<socketId>
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🔌 Connected:", socket.id);

  // ── JOIN ──
  socket.on("join", (userId) => {
    socket.userId = userId;
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);
    socket.join(`user:${userId}`);
    console.log(`✅ ${userId} online (${onlineUsers.get(userId).size} devices)`);
  });

  // ── SEND MESSAGE ──
  socket.on("sendMessage", async (data) => {
    const { conversationId, senderId, receiverId, text, image, listingRef } = data;

    try {
      // Persist to DB
      const message = await Message.create({
        conversationId,
        senderId,
        receiverId,
        text: text || "",
        image: image || null,
        listingRef: listingRef || undefined,
      });

      // Update conversation
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: {
          text: text || (image ? "📷 Image" : ""),
          senderId,
          createdAt: message.createdAt,
        },
        updatedAt: new Date(),
        $inc: { [`unreadCount.${receiverId}`]: 1 },
      });

      const payload = {
        _id: message._id.toString(),
        conversationId,
        senderId,
        receiverId,
        text: message.text,
        image: message.image,
        listingRef: message.listingRef,
        read: false,
        createdAt: message.createdAt.toISOString(),
      };

      // Emit to both users
      io.to(`user:${receiverId}`).emit("newMessage", payload);
      io.to(`user:${senderId}`).emit("newMessage", payload);

      console.log(`💬 ${senderId} → ${receiverId}: ${text || "📷"}`);
    } catch (err) {
      console.error("❌ sendMessage error:", err);
      socket.emit("messageError", { error: "Failed to send message" });
    }
  });

  // ── TYPING ──
  socket.on("typing", ({ conversationId, userId, receiverId }) => {
    io.to(`user:${receiverId}`).emit("userTyping", { conversationId, userId });
  });

  socket.on("stopTyping", ({ conversationId, userId, receiverId }) => {
    io.to(`user:${receiverId}`).emit("userStopTyping", { conversationId, userId });
  });

  // ── MARK READ ──
  socket.on("markRead", async ({ conversationId, userId, otherUserId }) => {
    try {
      await Message.updateMany(
        { conversationId, receiverId: userId, read: false },
        { read: true }
      );
      await Conversation.findByIdAndUpdate(conversationId, {
        [`unreadCount.${userId}`]: 0,
      });
      io.to(`user:${otherUserId}`).emit("messagesRead", { conversationId, userId });
    } catch (err) {
      console.error("❌ markRead error:", err);
    }
  });

  // ── DISCONNECT ──
  socket.on("disconnect", () => {
    if (socket.userId) {
      const sockets = onlineUsers.get(socket.userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) onlineUsers.delete(socket.userId);
      }
    }
    console.log("❌ Disconnected:", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO server on http://localhost:${PORT}`);
});
