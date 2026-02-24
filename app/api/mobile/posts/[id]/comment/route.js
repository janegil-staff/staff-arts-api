import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
import { getAuthUser } from "@/lib/jwt";

// POST /api/mobile/posts/[id]/comment
export async function POST(req, { params }) {
  try {
    const decoded = await getAuthUser(req);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { text } = await req.json();
    if (!text?.trim()) return NextResponse.json({ success: false, error: "Comment text required" }, { status: 400 });

    const post = await Post.findByIdAndUpdate(
      params.id,
      { $push: { comments: { userId: decoded.userId, text: text.trim(), createdAt: new Date() } } },
      { new: true }
    ).populate("comments.userId", "displayName username avatar");

    if (!post) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: post.comments });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
