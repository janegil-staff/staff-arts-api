// lib/socketHandlers.js
// Extract this logic and import into server.js for cleaner code
// Handles persisting messages and updating conversations in MongoDB

const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

async function saveMessage(data) {
  const message = await Message.create({
    conversationId: data.conversationId,
    senderId: data.senderId,
    receiverId: data.receiverId,
    text: data.text || "",
    image: data.image || null,
    listingRef: data.listingRef || undefined,
  });

  // Update conversation's lastMessage and unread count
  await Conversation.findByIdAndUpdate(data.conversationId, {
    lastMessage: {
      text: data.text || (data.image ? "📷 Image" : ""),
      senderId: data.senderId,
      createdAt: message.createdAt,
    },
    updatedAt: new Date(),
    $inc: { [`unreadCount.${data.receiverId}`]: 1 },
  });

  return message;
}

async function markMessagesRead(conversationId, userId) {
  // Mark all messages sent TO this user as read
  await Message.updateMany(
    {
      conversationId,
      receiverId: userId,
      read: false,
    },
    { read: true }
  );

  // Reset unread count
  await Conversation.findByIdAndUpdate(conversationId, {
    [`unreadCount.${userId}`]: 0,
  });
}

module.exports = { saveMessage, markMessagesRead };
