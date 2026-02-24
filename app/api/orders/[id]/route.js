import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Order } from "@/models/index";
import { getAuthUser } from "@/lib/jwt";

// GET /api/orders/[id]
export async function GET(req, { params }) {
  try {
    const decoded = await getAuthUser(req);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const order = await Order.findById(params.id)
      .populate("buyerId", "displayName username avatar")
      .populate("sellerId", "displayName username avatar")
      .populate("artworkId")
      .lean();
    if (!order) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    if (order.buyerId._id.toString() !== decoded.userId && order.sellerId._id.toString() !== decoded.userId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ success: true, data: order });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// PUT /api/orders/[id] — update status (seller only)
export async function PUT(req, { params }) {
  try {
    const decoded = await authenticateRequest(req);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const order = await Order.findById(params.id);
    if (!order) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    if (order.sellerId.toString() !== decoded.userId) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    const { status, shipping } = await req.json();
    if (status) order.status = status;
    if (shipping) Object.assign(order.shipping, shipping);
    await order.save();
    return NextResponse.json({ success: true, data: order });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
