import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Artwork from "@/models/Artwork";
import "@/models/User";
import { getAuthUser } from "@/lib/jwt";

// GET /api/mobile/me/artworks — get current user's artworks
export async function GET(req) {
  try {
    const decoded = await getAuthUser(req);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log(decoded);
    await connectDB();

    const searchParams = new URL(req.url).searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sort = searchParams.get("sort") || "newest";

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { "pricing.price": 1 },
      price_desc: { "pricing.price": -1 },
    };

    const artworks = await Artwork.find({ artist: decoded })
      .sort(sortMap[sort] || sortMap.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Artwork.countDocuments({ artist: decoded });

    return NextResponse.json({
      success: true,
      data: {
        artworks,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("My artworks error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
