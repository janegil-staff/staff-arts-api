import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { signToken, signRefreshToken } from "@/lib/jwt";

// POST /api/mobile/auth/register
export async function POST(req) {
  try {
    await connectDB();
    const { email, password, name, displayName, role } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: "Email, password, and name required" },
        { status: 400 },
      );
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Email already in use" },
        { status: 409 },
      );
    }

    const username =
      name.toLowerCase().replace(/[^a-z0-9]/g, "") +
      Math.random().toString(36).slice(-4);

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      name,
      username,
      displayName,
      role: ["artist", "collector", "gallery"].includes(role)
        ? role
        : "collector",
    });

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const token = await signToken(payload);
    const refreshToken = await signRefreshToken(payload);

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            displayName: user.displayName,
            username: user.username,
            role: user.role,
            avatar: user.avatar || "",
          },
          token,
          refreshToken,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Mobile register error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
