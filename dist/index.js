"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const PORT = process.env.PORT ?? 3000;
const start = async () => {
    await (0, db_1.connectDB)();
    const httpServer = http_1.default.createServer(app_1.default);
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
    // Attach io to app so controllers can access it
    app_1.default.set("io", io);
    io.on("connection", (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);
        socket.on("join_user_room", (userId) => {
            socket.join(`user_${userId}`);
        });
        // Client joins their conversation rooms
        socket.on("join_conversation", (conversationId) => {
            socket.join(conversationId);
            console.log(`📥 Socket ${socket.id} joined room: ${conversationId}`);
        });
        socket.on("leave_conversation", (conversationId) => {
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
//# sourceMappingURL=index.js.map