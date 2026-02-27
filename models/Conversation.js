// models/Conversation.js
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      text: String,
      senderId: mongoose.Schema.Types.ObjectId,
      createdAt: Date,
    },
    listingRef: {
      listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Artwork" },
      title: String,
      price: Number,
      currency: String,
      image: String,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1, updatedAt: -1 });

export default mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);
