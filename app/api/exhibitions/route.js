import connectDB from "@/lib/db";
import Exhibition from "@/models/Exhibition";
import User from "@/models/User";          // ← add this line
import { getAuthUser } from "@/lib/jwt";
import { NextResponse } from "next/server";

// GET /api/exhibitions — list exhibitions
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");

    const query = {};
    if (status) query.status = status;
    if (featured === "true") query.featured = true;

    const [exhibitions, total] = await Promise.all([
      Exhibition.find(query)
        .sort({ startDate: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("organizer", "displayName name avatar")
        .populate("artists", "displayName name avatar")
        .lean(),
      Exhibition.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: { exhibitions, total, page, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.log("GET /api/exhibitions error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}

// POST /api/exhibitions — create exhibition
export async function POST(req) {
  try {
    const decoded = await getAuthUser(req);
    if (!decoded)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );

    await connectDB();
    const body = await req.json();

    const exhibition = await Exhibition.create({ ...body, organizer: decoded });

    return NextResponse.json(
      { success: true, data: exhibition },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
