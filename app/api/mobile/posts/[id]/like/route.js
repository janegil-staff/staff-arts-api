import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
import { getAuthUser } from "@/lib/jwt";

// POST /api/mobile/posts/[id]/like
export async function POST(req, { params }) {
  try {
    const decoded = await getAuthUser(req);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const post = await Post.findById(params.id);
    if (!post) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const idx = post.likes.indexOf(decoded.userId);
    if (idx > -1) {
      post.likes.splice(idx, 1);
    } else {
      post.likes.push(decoded.userId);
    }
    await post.save();

    return NextResponse.json({ success: true, liked: idx === -1, likeCount: post.likes.length });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
