// src/index.ts
import "dotenv/config";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT ?? 3000;

const start = async (): Promise<void> => {
  await connectDB();

  const httpServer = http.createServer(app);

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Attach io to app so controllers can access it
  app.set("io", io);

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Client joins their conversation rooms
    socket.on("join_conversation", (conversationId: string) => {
      socket.join(conversationId);
      console.log(`📥 Socket ${socket.id} joined room: ${conversationId}`);
    });

    socket.on("leave_conversation", (conversationId: string) => {
      socket.leave(conversationId);
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`🚀 Art API running on http://localhost:${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV ?? "development"}`);
    console.log(`🔌 Socket.io ready`);
  });
};

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
