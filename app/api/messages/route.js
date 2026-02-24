import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Message, Conversation } from "@/models/index";
import { getAuthUser } from "@/lib/jwt";

// GET /api/messages?conversationId=xxx — get messages
export async function GET(req) {
  try {
    const decoded = await getAuthUser(req);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    await connectDB();

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");
    if (!conversationId) return NextResponse.json({ success: false, error: "conversationId required" }, { status: 400 });

    // Verify user is participant
    const conv = await Conversation.findById(conversationId);
    if (!conv || !conv.participants.includes(decoded.userId)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("senderId", "displayName username avatar")
      .lean();

    // Mark as read
    await Message.updateMany({ conversationId, senderId: { $ne: decoded.userId }, read: false }, { read: true });

    return NextResponse.json({ success: true, data: messages.reverse() });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// POST /api/messages — send message
export async function POST(req) {
  try {
    const decoded = await getAuthUser(req);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    await connectDB();

    const { conversationId, text, attachments } = await req.json();
    if (!conversationId || !text?.trim()) {
      return NextResponse.json({ success: false, error: "conversationId and text required" }, { status: 400 });
    }

    const conv = await Conversation.findById(conversationId);
    if (!conv || !conv.participants.includes(decoded.userId)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const message = await Message.create({
      conversationId,
      senderId: decoded.userId,
      text: text.trim(),
      attachments: attachments || [],
    });

    // Update conversation
    conv.lastMessage = { text: text.trim(), senderId: decoded.userId, timestamp: new Date() };
    await conv.save();

    const populated = await Message.findById(message._id).populate("senderId", "displayName username avatar");
    return NextResponse.json({ success: true, data: populated }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
