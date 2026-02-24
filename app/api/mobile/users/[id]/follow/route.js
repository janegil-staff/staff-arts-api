import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { getAuthUser } from "@/lib/jwt";

// POST /api/mobile/users/[id]/follow — toggle follow
export async function POST(req, { params }) {
  try {
    const decoded = await getAuthUser(req);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const targetUser = await User.findById(params.id);
    if (!targetUser) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    if (decoded.userId === params.id) {
      return NextResponse.json({ success: false, error: "Cannot follow yourself" }, { status: 400 });
    }

    const isFollowing = targetUser.followers.includes(decoded.userId);

    if (isFollowing) {
      await User.findByIdAndUpdate(params.id, { $pull: { followers: decoded.userId } });
      await User.findByIdAndUpdate(decoded.userId, { $pull: { following: params.id } });
    } else {
      await User.findByIdAndUpdate(params.id, { $addToSet: { followers: decoded.userId } });
      await User.findByIdAndUpdate(decoded.userId, { $addToSet: { following: params.id } });
    }

    return NextResponse.json({ success: true, following: !isFollowing });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
