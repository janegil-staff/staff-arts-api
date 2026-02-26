// app/api/events/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import User from "@/models/User"; 
import { getAuthUser } from "@/lib/jwt";
import "@/models/User";
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const [events, total] = await Promise.all([
      Event.find({})
        .sort({ date: -1, startDate: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("organizer", "displayName name avatar")
        .lean(),
      Event.countDocuments({}),
    ]);

    return NextResponse.json({
      success: true,
      data: { events, total, page, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.log("GET /api/events error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const decoded = await getAuthUser(req);
    if (!decoded)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );


    const body = await req.json();
    console.log(body);
    const event = await Event.create({
      ...body,
      organizer: decoded,  // or whatever your Event schema calls it
    });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (err) {
    console.log("POST /api/events error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}