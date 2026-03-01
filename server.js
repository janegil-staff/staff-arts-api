// server.js
import http from "http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer((req, res) => handle(req, res));

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Make io available to API routes
  globalThis.__io = io;

  io.on("connection", (socket) => {
    console.log("[Socket] Connected:", socket.id);

    // Join room (conversationId)
    socket.on("join", (roomId) => {
      console.log(`[Socket] ${socket.id} joining room:`, roomId);
      socket.join(roomId);
    });

    // Leave room
    socket.on("leave", (roomId) => {
      socket.leave(roomId);
    });

    // Real-time chat message
    socket.on("send-message", ({ roomId, message }) => {
      console.log("[Socket] Message to room:", roomId);
      io.to(roomId).emit("receive-message", message);
    });

    // Typing indicators
    socket.on("typing", ({ roomId, userId }) => {
      socket.to(roomId).emit("user-typing", { roomId, userId });
    });

    socket.on("stop-typing", ({ roomId, userId }) => {
      socket.to(roomId).emit("user-stop-typing", { roomId, userId });
    });

    socket.on("disconnect", () => {
      console.log("[Socket] Disconnected:", socket.id);
    });
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () =>
    console.log(`> Server ready on http://0.0.0.0:${port}`),
  );
});
