import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Notification } from "@/models/index";
import { getAuthUser } from "@/lib/jwt";

// GET /api/notifications
export async function GET(req) {
  try {
    const decoded = await getAuthUser(req);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "30");
    const unreadOnly = searchParams.get("unread") === "true";

    const query = { userId: decoded.userId };
    if (unreadOnly) query.read = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ userId: decoded.userId, read: false }),
    ]);

    return NextResponse.json({ success: true, data: { notifications, total, unreadCount, page, pages: Math.ceil(total / limit) } });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// PUT /api/notifications — mark as read (body: { ids: [...] } or { all: true })
export async function PUT(req) {
  try {
    const decoded = await authenticateRequest(req);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { ids, all } = await req.json();

    if (all) {
      await Notification.updateMany({ userId: decoded.userId, read: false }, { read: true });
    } else if (ids?.length) {
      await Notification.updateMany({ _id: { $in: ids }, userId: decoded.userId }, { read: true });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
