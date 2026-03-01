// lib/socketEmit.js
// Emit socket events from API routes

export function emitToRoom(roomId, event, data) {
  try {
    const io = globalThis.__io;
    if (io) io.to(roomId).emit(event, data);
  } catch (e) {}
}
