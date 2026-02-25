import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Artwork from "@/models/Artwork";

// GET /api/artworks/[id]
export async function GET(req, { params }) {
  const { id } = await params;
  console.log("FOOBAAR", id);
  try {
    await connectDB();
    const artwork = await Artwork.findById(id)
      .populate("artist", "displayName username name avatar bio location verified")
      .lean();

    if (!artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    }

    // Increment views
    await Artwork.findByIdAndUpdate(id, { $inc: { views: 1 } });

    return NextResponse.json({ success: true, data: artwork });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT /api/artworks/[id]
export async function PUT(req, { params }) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const artwork = await Artwork.findById(id);
    if (!artwork)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (artwork.artistId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    Object.assign(artwork, body);
    await artwork.save();

    return NextResponse.json({ success: true, data: artwork });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/artworks/[id]
export async function DELETE(req, { params }) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const artwork = await Artwork.findById(id);
    if (!artwork)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (artwork.artistId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await artwork.deleteOne();
    return NextResponse.json({ success: true, message: "Artwork deleted" });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
