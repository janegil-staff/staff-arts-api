import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Music from "@/models/Music";
import { getAuthUser } from "@/lib/jwt";

// GET /api/music
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const genre = searchParams.get("genre");
    const artistId = searchParams.get("artistId");
    const featured = searchParams.get("featured");

    const query = {};
    if (genre) query.genre = genre;
    if (artistId) query.artistId = artistId;
    if (featured === "true") query.featured = true;

    const [tracks, total] = await Promise.all([
      Music.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("artistId", "displayName username avatar")
        .lean(),
      Music.countDocuments(query),
    ]);

    return NextResponse.json({ success: true, data: { tracks, total, page, pages: Math.ceil(total / limit) } });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// POST /api/music — upload track
export async function POST(req) {
  try {
    const decoded = await getAuthUser(req);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const body = await req.json();
    if (!body.title || !body.audioUrl) return NextResponse.json({ success: false, error: "title and audioUrl required" }, { status: 400 });
    const track = await Music.create({ ...body, artistId: decoded.userId });
    return NextResponse.json({ success: true, data: track }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
