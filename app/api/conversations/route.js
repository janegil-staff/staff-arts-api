// app/api/conversations/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Conversation from "@/models/Conversation";

// GET /api/conversations?userId=xxx
export async function GET(request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  try {
    const conversations = await Conversation.find({ participants: userId })
      .populate("participants", "name avatar")
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json(conversations);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/conversations
export async function POST(request) {
  await dbConnect();

  const body = await request.json();
  const { senderId, receiverId, listingRef } = body;

  if (!senderId || !receiverId) {
    return NextResponse.json(
      { error: "senderId and receiverId required" },
      { status: 400 }
    );
  }

  try {
    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("participants", "name avatar");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        listingRef: listingRef || undefined,
        unreadCount: { [senderId]: 0, [receiverId]: 0 },
      });
      conversation = await conversation.populate("participants", "name avatar");
    }

    return NextResponse.json(conversation);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
