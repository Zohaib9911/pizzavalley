import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "../../../../lib/mongodb";
import User from "../../../../lib/models/User";

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, password, phone } = await request.json();

    // Validation
    if (!fullName || !email || !password) {
      return Response.json({ error: "All fields are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      // If the email is linked to Google, tell the user to sign in with Google
      if (existing.googleId) {
        return Response.json(
          { error: "This email is linked to a Google account. Please sign in with Google." },
          { status: 409 }
        );
      }
      return Response.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone?.trim() ?? "",
    });

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const cookieStore = await cookies();
    cookieStore.set("pv_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return Response.json(
      {
        message: "Account created successfully.",
        user: {
          id:       user._id,
          fullName: user.fullName,
          email:    user.email,
          phone:    user.phone,
          isAdmin:  user.isAdmin,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[signup]", err);
    if (err.code === 11000) {
      return Response.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
