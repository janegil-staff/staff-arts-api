import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Commission } from "@/models/index";
import { getAuthUser } from "@/lib/jwt";

// GET /api/commissions
export async function GET(req) {
  try {
    const decoded = await getAuthUser(req);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || "client"; // client or artist
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const query = role === "artist" ? { artistId: decoded.userId } : { clientId: decoded.userId };
    if (status) query.status = status;

    const [commissions, total] = await Promise.all([
      Commission.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
        .populate("clientId", "displayName username avatar")
        .populate("artistId", "displayName username avatar")
        .lean(),
      Commission.countDocuments(query),
    ]);
    return NextResponse.json({ success: true, data: { commissions, total, page, pages: Math.ceil(total / limit) } });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// POST /api/commissions — request a commission
export async function POST(req) {
  try {
    const decoded = await getAuthUser(req);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const body = await req.json();
    if (!body.artistId || !body.title) return NextResponse.json({ success: false, error: "artistId and title required" }, { status: 400 });
    const commission = await Commission.create({ ...body, clientId: decoded.userId, status: "requested" });
    return NextResponse.json({ success: true, data: commission }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
