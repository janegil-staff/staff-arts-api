import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Conversation } from "@/models/index";
import { getAuthUser } from "@/lib/jwt";

// GET /api/messages/conversations — list user's conversations
export async function GET(req) {
  try {
    const decoded = await getAuthUser(req);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    await connectDB();

    const conversations = await Conversation.find({ participants: decoded.userId })
      .sort({ updatedAt: -1 })
      .populate("participants", "displayName username avatar")
      .lean();

    return NextResponse.json({ success: true, data: conversations });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// POST /api/messages/conversations — create or get existing conversation
export async function POST(req) {
  try {
    const decoded = await getAuthUser(req);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { participantId } = await req.json();
    if (!participantId) return NextResponse.json({ success: false, error: "participantId required" }, { status: 400 });

    // Check if conversation already exists
    let conv = await Conversation.findOne({
      participants: { $all: [decoded.userId, participantId], $size: 2 },
    }).populate("participants", "displayName username avatar");

    if (!conv) {
      conv = await Conversation.create({ participants: [decoded.userId, participantId] });
      conv = await Conversation.findById(conv._id).populate("participants", "displayName username avatar");
    }

    return NextResponse.json({ success: true, data: conv });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
