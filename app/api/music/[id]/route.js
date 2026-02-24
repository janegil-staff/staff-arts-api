import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Music from "@/models/Music";
import { getAuthUser } from "@/lib/jwt";

// GET /api/music/[id] — get track + increment plays
export async function GET(req, { params }) {
  try {
    await connectDB();
    const track = await Music.findByIdAndUpdate(params.id, { $inc: { plays: 1 } }, { new: true })
      .populate("artistId", "displayName username avatar")
      .lean();
    if (!track) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: track });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/music/[id]
export async function DELETE(req, { params }) {
  try {
    const decoded = await getAuthUser(req);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const track = await Music.findById(params.id);
    if (!track) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    if (track.artistId.toString() !== decoded.userId) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    await track.deleteOne();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
