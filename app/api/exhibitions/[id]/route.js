import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Exhibition from "@/models/Exhibition";
import { getAuthUser } from "@/lib/jwt";

// GET /api/exhibitions/[id]
export async function GET(req, { params }) {
  try {
    await connectDB();
    const ex = await Exhibition.findByIdAndUpdate(params.id, { $inc: { views: 1 } }, { new: true })
      .populate("curatorId", "displayName username avatar")
      .populate("artistIds", "displayName username avatar")
      .populate("artworkIds")
      .lean();
    if (!ex) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: ex });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// PUT /api/exhibitions/[id]
export async function PUT(req, { params }) {
  try {
    const decoded = await getAuthUser(req);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const ex = await Exhibition.findById(params.id);
    if (!ex) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    if (ex.curatorId.toString() !== decoded.userId) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    const body = await req.json();
    Object.assign(ex, body);
    await ex.save();
    return NextResponse.json({ success: true, data: ex });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/exhibitions/[id]
export async function DELETE(req, { params }) {
  try {
    const decoded = await getAuthUser(req);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const ex = await Exhibition.findById(params.id);
    if (!ex) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    if (ex.curatorId.toString() !== decoded.userId) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    await ex.deleteOne();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
