import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { signToken, signRefreshToken } from "@/lib/jwt";

// POST /api/mobile/auth/login
export async function POST(req) {
  console.log("ENTERING");
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password required" },
        { status: 400 },
      );
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );

    
    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 },
      );
    }
    const valid = await bcrypt.compare(password, user.password);
    console.log("BCRYPT VALID:", valid);

    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const token = await signToken(payload);
    const refreshToken = await signRefreshToken(payload);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          username: user.username,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio,
          location: user.location,
          verified: user.verified,
        },
        token,
        refreshToken,
      },
    });
  } catch (err) {
    console.error("Mobile login error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
