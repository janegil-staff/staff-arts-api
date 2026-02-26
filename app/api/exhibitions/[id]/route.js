import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Exhibition from "@/models/Exhibition";
import User from "@/models/User";           // ← add this
import { getAuthUser } from "@/lib/jwt";
import Artwork from "@/models/Artwork";

export async function GET(req, { params }) {
  const { id } = await params;
  try {
    await connectDB();
    const ex = await Exhibition.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { returnDocument: 'after' }            // ← fix this
    )
      .populate("organizer", "displayName name avatar")
      .populate("artists", "displayName name avatar")
      .populate("artworks")
      .lean();

    if (!ex) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: ex });
  } catch (err) {
    console.log("GET /api/exhibitions/[id] error:", err);  // ← add this
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
  const { id } = await params;
  try {
    await connectDB();

    // Auth: mobile token or web session
    let userId = await getAuthUser(req);
    if (!userId) {
      const session = await getServerSession(authOptions);
      if (session) userId = session.user.id;
    }
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const ex = await Exhibition.findById(id);
    if (!ex) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    // Only the organizer can delete
    if (ex.organizer.toString() !== userId.toString()) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await Exhibition.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.log("DELETE /api/exhibitions/[id] error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}