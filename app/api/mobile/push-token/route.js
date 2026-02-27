
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { getAuthUser } from "@/lib/jwt";

// POST — save push token after login
export async function POST(req) {
  try {
    const decoded = await getAuthUser(req);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { pushToken } = await req.json();

    if (!pushToken) {
      return NextResponse.json({ success: false, error: "pushToken required" }, { status: 400 });
    }

    // If this token belongs to another user (device switched accounts), remove it
    await User.updateMany(
      { pushTokens: pushToken, _id: { $ne: decoded.userId } },
      { $pull: { pushTokens: pushToken } },
    );

    // Add token to this user (won't duplicate thanks to $addToSet)
    await User.findByIdAndUpdate(decoded.userId, {
      $addToSet: { pushTokens: pushToken },
    });

    return NextResponse.json({ success: true, data: { saved: true } });
  } catch (err) {
    console.error("[push-token] Error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// DELETE — remove push token on logout
export async function DELETE(req) {
  try {
    const decoded = await getAuthUser(req);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { pushToken } = await req.json();

    if (pushToken) {
      await User.findByIdAndUpdate(decoded.userId, {
        $pull: { pushTokens: pushToken },
      });
    }

    return NextResponse.json({ success: true, data: { removed: true } });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
