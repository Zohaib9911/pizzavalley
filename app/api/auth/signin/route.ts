import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "../../../../lib/mongodb";
import User from "../../../../lib/models/User";

export async function POST(request: NextRequest) {
  try {
    const { email, password, remember } = await request.json();

    if (!email || !password) {
      return Response.json({ error: "Email and password are required." }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return Response.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return Response.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // remember me: 30 days vs 7 days
    const expiresIn = remember ? "30d" : "7d";
    const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn }
    );

    const cookieStore = await cookies();
    cookieStore.set("pv_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    return Response.json({
      message: "Signed in successfully.",
      user: { id: user._id, fullName: user.fullName, email: user.email },
    });
  } catch (err) {
    console.error("[signin]", err);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
