import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import User from "@/models/User"; // ← Required for populate
import "@/models/User";
import { getAuthUser } from "@/lib/jwt";

export async function GET(req, { params }) {
  const { id } = await params;
  try {
    await connectDB();
    const event = await Event.findById(id)
      .populate("organizer", "displayName name username avatar")
      .lean();
    if (!event)
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 },
      );
    return NextResponse.json({ success: true, data: event });
  } catch (err) {
    console.log("GET /api/events/[id] error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  try {
    await connectDB();

    let userId = await getAuthUser(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const ev = await Event.findById(id);
    if (!ev) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 },
      );
    }

    // Check organizer field — adjust if your Event schema uses a different field name
    const ownerId = ev.organizer || ev.creator || ev.user;
    if (ownerId.toString() !== userId.toString()) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    await Event.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.log("DELETE /api/events/[id] error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
