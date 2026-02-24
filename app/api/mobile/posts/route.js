import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
import { getAuthUser } from "@/lib/jwt";

// GET /api/mobile/posts — feed (public)
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("authorId", "displayName username avatar role verified")
      .populate("linkedArtworkId", "title primaryImage pricing")
      .populate("comments.userId", "displayName username avatar")
      .lean();

    const total = await Post.countDocuments();

    return NextResponse.json({
      success: true,
      data: { posts, total, page, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// POST /api/mobile/posts — create post
export async function POST(req) {
  try {
    const decoded = await getAuthUser(req);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const body = await req.json();
    const post = await Post.create({ ...body, authorId: decoded.userId });
    const populated = await Post.findById(post._id)
      .populate("authorId", "displayName username avatar role verified");

    return NextResponse.json({ success: true, data: populated }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
