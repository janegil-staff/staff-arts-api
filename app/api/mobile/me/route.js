import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Artwork from "@/models/Artwork";
import { getAuthUser } from "@/lib/jwt";

// GET /api/mobile/me — full current user with stats
export async function GET(req) {
  try {
    const decoded = await getAuthUser(req);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findById(decoded).select("-password").lean();
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    const artworkCount = await Artwork.countDocuments({ artist: decoded });

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        followerCount: user.followers?.length || 0,
        followingCount: user.following?.length || 0,
        artworkCount,
      },
    });
  } catch (err) {
    console.error("Me error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
