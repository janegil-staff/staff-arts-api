import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Event from "@/models/Event";

// GET /api/events
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const type = searchParams.get("type");
    const upcoming = searchParams.get("upcoming") !== "false";

    const filter = {};
    if (type) filter.type = type;
    if (upcoming) filter.startDate = { $gte: new Date() };

    const events = await Event.find(filter)
      .sort({ startDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("organizerId", "displayName username avatar")
      .lean();

    const total = await Event.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: { events, total, page, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/events
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const body = await req.json();
    const event = await Event.create({ ...body, organizerId: session.user.id });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
