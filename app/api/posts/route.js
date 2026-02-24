import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Post from "@/models/Post";

// GET /api/posts
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
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/posts
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const body = await req.json();
    const post = await Post.create({ ...body, authorId: session.user.id });

    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
