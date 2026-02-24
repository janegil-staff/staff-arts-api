import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Commission } from "@/models/index";
import { getAuthUser } from "@/lib/jwt";

// GET /api/commissions/[id]
export async function GET(req, { params }) {
  try {
    const decoded = await getAuthUser(req);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const c = await Commission.findById(params.id)
      .populate("clientId", "displayName username avatar")
      .populate("artistId", "displayName username avatar")
      .populate("messages.senderId", "displayName username avatar")
      .lean();
    if (!c) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    if (c.clientId._id.toString() !== decoded.userId && c.artistId._id.toString() !== decoded.userId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ success: true, data: c });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// PUT /api/commissions/[id] — update status, add message, add deliverable
export async function PUT(req, { params }) {
  try {
    const decoded = await getAuthUser(req);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const c = await Commission.findById(params.id);
    if (!c) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    const isClient = c.clientId.toString() === decoded.userId;
    const isArtist = c.artistId.toString() === decoded.userId;
    if (!isClient && !isArtist) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

    const body = await req.json();

    // Update status
    if (body.status) {
      const allowed = isArtist ? ["accepted", "in_progress", "completed"] : ["cancelled"];
      if (allowed.includes(body.status)) c.status = body.status;
    }
    // Add message
    if (body.message) {
      c.messages.push({ senderId: decoded.userId, text: body.message, timestamp: new Date() });
    }
    // Add deliverable (artist only)
    if (body.deliverable && isArtist) {
      c.deliverables.push(body.deliverable);
    }
    // Approve deliverable (client only)
    if (body.approveDeliverableIndex !== undefined && isClient) {
      c.deliverables[body.approveDeliverableIndex].approved = true;
    }

    await c.save();
    return NextResponse.json({ success: true, data: c });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
