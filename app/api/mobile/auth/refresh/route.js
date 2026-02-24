import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyToken, signToken, signRefreshToken } from "@/lib/jwt";

// POST /api/mobile/auth/refresh
export async function POST(req) {
  try {
    const { refreshToken } = await req.json();
    if (!refreshToken) {
      return NextResponse.json({ success: false, error: "Refresh token required" }, { status: 400 });
    }

    const decoded = verifyToken(refreshToken);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid refresh token" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 401 });
    }

    const payload = { userId: user._id.toString(), email: user.email, role: user.role };
    const newToken = signToken(payload);
    const newRefreshToken = signRefreshToken(payload);

    return NextResponse.json({
      success: true,
      data: { token: newToken, refreshToken: newRefreshToken },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
