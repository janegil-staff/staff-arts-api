import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Artwork from "@/models/Artwork";
import { getAuthUser } from "@/lib/jwt";
import User from "@/models/User";
import "@/models/User";

// GET /api/artworks — list artworks with filters
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const medium = searchParams.get("medium");
    const style = searchParams.get("style");
    const status = searchParams.get("status") || "available";
    const sort = searchParams.get("sort") || "newest";
    const search = searchParams.get("search");
    const artist = searchParams.get("artist");
    const featured = searchParams.get("featured");
    const forSale = searchParams.get("forSale");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const filter = {};
    if (medium) filter.medium = { $regex: new RegExp("^" + medium + "$", "i") };
    if (style) filter.style = { $regex: new RegExp("^" + style + "$", "i") };
    if (status !== "all") filter.status = status;
    if (artist) filter.artist = artist;
    if (featured === "true") filter.featured = true;
    if (forSale === "true") filter.forSale = true;
    if (forSale === "false") filter.forSale = false;
    if (search) filter.$text = { $search: search };

    // Price range filter
    const currency = searchParams.get("currency");
    if (currency) filter.currency = currency;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      popular: { views: -1 },
    };

    const artworks = await Artwork.find(filter)
      .sort(sortMap[sort] || sortMap.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("artist", "name username displayName name avatar verified")
      .lean();

    const total = await Artwork.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: { artworks, total, page, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Get artworks error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/artworks — create artwork (web + mobile)
export async function POST(req) {
  try {
    var userId = await getAuthUser(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    var body = await req.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    var images = body.images || [];
    var primaryImage = "";
    if (images.length > 0) {
      primaryImage =
        typeof images[0] === "string" ? images[0] : images[0].url || "";
    }

    var artwork = await Artwork.create({
      title: body.title.trim(),
      description: body.description || "",
      images: images,
      primaryImage: primaryImage,
      artist: userId,
      medium: body.medium || "",
      style: body.style || "",
      category: body.category || "",
      dimensions: body.dimensions || undefined,
      year: body.year || undefined,
      status: "available",
      forSale: body.forSale || false,
      price: body.forSale ? body.price || 0 : 0,
      currency: body.currency || "USD",
    });

    return NextResponse.json({ success: true, data: artwork }, { status: 201 });
  } catch (err) {
    console.error("Create artwork error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
