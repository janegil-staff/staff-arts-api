import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Order } from "@/models/index";
import { getAuthUser } from "@/lib/jwt";

// GET /api/orders — list user's orders (as buyer or seller)
export async function GET(req) {
  try {
    const decoded = await getAuthUser(req);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || "buyer"; // buyer or seller
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const query = role === "seller" ? { sellerId: decoded.userId } : { buyerId: decoded.userId };
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("buyerId", "displayName username avatar")
        .populate("sellerId", "displayName username avatar")
        .populate("artworkId", "title primaryImage pricing")
        .lean(),
      Order.countDocuments(query),
    ]);

    return NextResponse.json({ success: true, data: { orders, total, page, pages: Math.ceil(total / limit) } });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// POST /api/orders — create order (purchase)
export async function POST(req) {
  try {
    const decoded = await authenticateRequest(req);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const body = await req.json();
    const order = await Order.create({
      ...body,
      buyerId: decoded.userId,
      status: "pending",
    });
    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
