import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

// GET /api/users — list users with filters
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const role = searchParams.get("role"); // artist, collector, gallery
    const featured = searchParams.get("featured");
    const verified = searchParams.get("verified");
    const search = searchParams.get("search");

    const query = {};
    if (role) query.role = role;
    if (featured === "true") query.featured = true;
    if (verified === "true") query.verified = true;
    if (search) {
      query.$or = [
        { displayName: new RegExp(search, "i") },
        { username: new RegExp(search, "i") },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-passwordHash")
        .lean(),
      User.countDocuments(query),
    ]);

    const usersWithCounts = users.map((u) => ({
      ...u,
      followerCount: u.followers?.length || 0,
      followingCount: u.following?.length || 0,
    }));

    return NextResponse.json({ success: true, data: { users: usersWithCounts, total, page, pages: Math.ceil(total / limit) } });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
