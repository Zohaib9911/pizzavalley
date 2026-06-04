import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "../../../../lib/mongodb";
import User from "../../../../lib/models/User";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("pv_token")?.value;

    if (!token) {
      return Response.json({ user: null }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    await connectDB();
    const user = await User.findById(decoded.userId).select(
      "-password -googleId -__v"
    );

    if (!user) {
      return Response.json({ user: null }, { status: 401 });
    }

    return Response.json({
      user: {
        id:       user._id,
        fullName: user.fullName,
        email:    user.email,
        phone:    user.phone ?? "",
        isAdmin:  user.isAdmin,
      },
    });
  } catch {
    return Response.json({ user: null }, { status: 401 });
  }
}
