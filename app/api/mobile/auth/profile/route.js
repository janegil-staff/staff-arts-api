import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { getAuthUser } from "@/lib/jwt";

// GET /api/mobile/auth/profile — get current user profile
export async function GET(req) {
  try {
    const decoded = await getAuthUser(req);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(decoded.userId)
      .select("-passwordHash -__v")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        website: user.website,
        coverImage: user.coverImage,
        socialLinks: user.socialLinks,
        verified: user.verified,
        followerCount: user.followers ? user.followers.length : 0,
        followingCount: user.following ? user.following.length : 0,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Get profile error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT /api/mobile/auth/profile — update profile
export async function PUT(req) {
  try {
    const decoded = await getAuthUser(req);
 
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const allowed = [
      "displayName",
      "bio",
      "location",
      "website",
      "avatar",
      "coverImage",
      "socialLinks",
    ];
    const updates = {};
    for (let i = 0; i < allowed.length; i++) {
      if (body[allowed[i]] !== undefined) {
        updates[allowed[i]] = body[allowed[i]];
      }
    }

    
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(decoded, updates, { new: true })
      .select("-password")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        website: user.website,
        coverImage: user.coverImage,
        socialLinks: user.socialLinks,
        verified: user.verified,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


















