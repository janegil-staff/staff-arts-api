import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Conversation from "@/models/Conversation";
import User from "@/models/User";
import { getAuthUser } from "@/lib/jwt";

// GET /api/messages/conversations
export async function GET(req) {
  try {
    const userId = await getAuthUser(req);
    if (!userId)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    await connectDB();

    const conversations = await Conversation.find({ participants: userId })
      .sort({ lastMessageAt: -1 })
      .populate("participants", "displayName username avatar")
      .lean();

    return NextResponse.json({ success: true, data: conversations });
  } catch (err) {
    console.error("[conversations GET]", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}

// POST /api/messages/conversations
export async function POST(req) {
  try {
    const userId = await getAuthUser(req);
    if (!userId)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    await connectDB();

    const { participantId } = await req.json();
    if (!participantId)
      return NextResponse.json(
        { success: false, error: "participantId required" },
        { status: 400 },
      );

    let conv = await Conversation.findOne({
      participants: { $all: [userId, participantId], $size: 2 },
    }).populate("participants", "displayName username avatar");

    if (!conv) {
      conv = await Conversation.create({
        participants: [userId, participantId],
      });
      conv = await Conversation.findById(conv._id).populate(
        "participants",
        "displayName username avatar",
      );
    }

    return NextResponse.json({ success: true, data: conv });
  } catch (err) {
    console.error("[conversations POST]", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
