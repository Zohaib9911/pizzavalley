import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "../../../../lib/mongodb";
import User from "../../../../lib/models/User";
import Order from "../../../../lib/models/Order";
import MenuItem from "../../../../lib/models/MenuItem";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("pv_token")?.value;
    if (!token) return Response.json({ error: "Unauthorised." }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    await connectDB();
    const requester = await User.findById(decoded.userId).select("isAdmin");
    if (!requester?.isAdmin) return Response.json({ error: "Forbidden." }, { status: 403 });

    const [users, orders, totalMenuItems] = await Promise.all([
      User.find({}).select("-password -googleId -__v").sort({ createdAt: -1 }),
      Order.find({}).sort({ createdAt: -1 }),
      MenuItem.countDocuments({}),
    ]);

    const totalRevenue = orders
      .filter(o => o.status !== "cancelled")
      .reduce((s, o) => s + o.subtotal, 0);

    const statusCounts = orders.reduce((acc: Record<string, number>, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    }, {});

    return Response.json({
      stats: {
        totalUsers:      users.length,
        totalOrders:     orders.length,
        totalRevenue,
        statusCounts,
        totalMenuItems,
      },
      users,
      orders,
    });
  } catch (err) {
    console.error("[admin/dashboard]", err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}
