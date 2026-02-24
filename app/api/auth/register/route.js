import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password, displayName, role } = await req.json();

    if (!email || !password || !displayName) {
      return NextResponse.json(
        { error: "Email, password, and display name are required" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const username =
      displayName.toLowerCase().replace(/[^a-z0-9]/g, "") +
      Math.random().toString(36).slice(-4);

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      displayName,
      username,
      role: ["artist", "collector", "gallery"].includes(role) ? role : "collector",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
