import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import User from "@/models/User";
import { getAuthUser } from "@/lib/jwt";

// GET /api/messages?conversationId=xxx
export async function GET(req) {
  try {
    const userId = await getAuthUser(req);
    if (!userId)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    await connectDB();

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");
    if (!conversationId)
      return NextResponse.json(
        { success: false, error: "conversationId required" },
        { status: 400 },
      );

    const conv = await Conversation.findById(conversationId);
    if (!conv || !conv.participants.some((p) => p.toString() === userId)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("sender", "displayName username avatar")
      .lean();

    // Mark as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        readBy: { $ne: userId },
      },
      { $addToSet: { readBy: userId } },
    );

    return NextResponse.json({ success: true, data: messages.reverse() });
  } catch (err) {
    console.error("[messages GET]", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}

// POST /api/messages
export async function POST(req) {
  try {
    const userId = await getAuthUser(req);
    if (!userId)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    await connectDB();

    const { conversationId, text, image } = await req.json();
    if (!conversationId || !text?.trim()) {
      return NextResponse.json(
        { success: false, error: "conversationId and text required" },
        { status: 400 },
      );
    }

    const conv = await Conversation.findById(conversationId);
    if (!conv || !conv.participants.some((p) => p.toString() === userId)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: userId,
      content: text.trim(),
      images: image ? [{ url: image }] : [],
      readBy: [userId],
    });

    // Update conversation
    conv.lastMessage = text.trim();
    conv.lastMessageAt = new Date();
    await conv.save();

    const populated = await Message.findById(message._id).populate(
      "sender",
      "displayName username avatar",
    );

    return NextResponse.json(
      { success: true, data: populated },
      { status: 201 },
    );
  } catch (err) {
    console.error("[messages POST]", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
