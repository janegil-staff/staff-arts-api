// app/api/conversations/[id]/messages/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Message from "@/models/Message";

// GET /api/conversations/:id/messages?page=1&limit=30
export async function GET(request, { params }) {
  await dbConnect();

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 30;
  const skip = (page - 1) * limit;

  try {
    const messages = await Message.find({ conversationId: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Message.countDocuments({ conversationId: id });

    return NextResponse.json({
      messages: messages.reverse(),
      hasMore: skip + limit < total,
      total,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
