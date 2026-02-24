import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Artwork from "@/models/Artwork";

// POST /api/artworks/[id]/like — toggle like
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const artwork = await Artwork.findById(params.id);
    if (!artwork) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const userId = session.user.id;
    const index = artwork.likes.indexOf(userId);

    if (index > -1) {
      artwork.likes.splice(index, 1);
    } else {
      artwork.likes.push(userId);
    }
    await artwork.save();

    return NextResponse.json({
      success: true,
      liked: index === -1,
      likeCount: artwork.likes.length,
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
