import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "../../../../../lib/mongodb";
import Order from "../../../../../lib/models/Order";
import User from "../../../../../lib/models/User";

async function isAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("pv_token")?.value;
    if (!token) return false;
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    await connectDB();
    const user = await User.findById(decoded.userId).select("isAdmin");
    return !!user?.isAdmin;
  } catch { return false; }
}

/* PATCH /api/admin/orders/[id] — update status */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return Response.json({ error: "Forbidden." }, { status: 403 });

  const { id } = await params;
  const { status } = await request.json();

  const allowed = ["pending","confirmed","preparing","out_for_delivery","delivered","cancelled"];
  if (!allowed.includes(status)) {
    return Response.json({ error: "Invalid status." }, { status: 400 });
  }

  await connectDB();
  const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
  if (!order) return Response.json({ error: "Order not found." }, { status: 404 });
  return Response.json({ order });
}

/* DELETE /api/admin/orders/[id] — permanently delete an order */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return Response.json({ error: "Forbidden." }, { status: 403 });

  const { id } = await params;
  await connectDB();
  const order = await Order.findByIdAndDelete(id);
  if (!order) return Response.json({ error: "Order not found." }, { status: 404 });
  return Response.json({ message: `Order ${order.orderNumber} deleted.` });
}
