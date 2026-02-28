// lib/socketEmit.js
// Emit socket events from API routes using the global io instance

/**
 * Emit to a specific user's room
 */
export function emitToUser(userId, event, data) {
  try {
    const io = globalThis.__io;
    if (io) {
      io.to("user:" + userId).emit(event, data);
    }
  } catch (e) {
    console.log("[socketEmit] Failed:", e.message);
  }
}

/**
 * Emit to a conversation room
 */
export function emitToConversation(conversationId, event, data) {
  try {
    const io = globalThis.__io;
    if (io) {
      io.to("conv:" + conversationId).emit(event, data);
    }
  } catch (e) {
    console.log("[socketEmit] Failed:", e.message);
  }
}

/**
 * Check if a user is online
 */
export function isUserOnline(userId) {
  const users = globalThis.__onlineUsers;
  return users ? users.has(userId) : false;
}
