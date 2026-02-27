import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Artwork from "@/models/Artwork";
import mongoose from "mongoose";

// GET /api/users/[username]
export async function GET(req, { params }) {
  try {
    await connectDB();

    const { username: identifier } = await params;

    var query;
    if (
      mongoose.Types.ObjectId.isValid(identifier) &&
      identifier.length === 24
    ) {
      query = { _id: identifier };
    } else {
      query = { username: identifier };
    }

    const user = await User.findOne(query).select("-password").lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const artworkCount = await Artwork.countDocuments({
      artist: user._id,
      status: { $ne: "sold" },
    });

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
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
