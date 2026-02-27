import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Artwork from "@/models/Artwork";
import User from "@/models/User";
import Event from "@/models/Event";
import Exhibition from "@/models/Exhibition";
import MusicTrack from "@/models/MusicTrack";

// GET /api/search?q=term&type=all|artworks|users|events|exhibitions|MusicTrackTrack
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const type = searchParams.get("type") || "all";
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!q || q.length < 2) {
      return NextResponse.json({ success: false, error: "Search query must be at least 2 characters" }, { status: 400 });
    }

    const regex = new RegExp(q, "i");
    const results = {};

    if (type === "all" || type === "artworks") {
      results.artworks = await Artwork.find({
        $or: [{ title: regex }, { description: regex }, { tags: regex }, { medium: regex }],
      })
        .limit(limit)
        .populate("artistId", "displayName username avatar")
        .select("title primaryImage medium pricing artistId")
        .lean();
    }

    if (type === "all" || type === "users") {
      results.users = await User.find({
        $or: [{ displayName: regex }, { username: regex }, { bio: regex }],
      })
        .limit(limit)
        .select("displayName username avatar role location verified")
        .lean();
    }

    if (type === "all" || type === "events") {
      results.events = await Event.find({
        $or: [{ title: regex }, { description: regex }, { tags: regex }],
      })
        .limit(limit)
        .select("title type startDate venue coverImage")
        .lean();
    }

    if (type === "all" || type === "exhibitions") {
      results.exhibitions = await Exhibition.find({
        $or: [{ title: regex }, { description: regex }, { tags: regex }],
      })
        .limit(limit)
        .populate("curatorId", "displayName username avatar")
        .select("title coverImage startDate status curatorId")
        .lean();
    }

    if (type === "all" || type === "MusicTrackTrack") {
      results.MusicTrack = await MusicTrack.find({
        $or: [{ title: regex }, { genre: regex }, { tags: regex }],
      })
        .limit(limit)
        .populate("artistId", "displayName username avatar")
        .select("title coverImage genre duration artistId")
        .lean();
    }

    return NextResponse.json({ success: true, data: results });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
