/**
 * POST /api/webhooks/order-status
 *
 * Called by n8n when the admin taps a status button in Telegram.
 * Verifies the shared secret, updates order status in MongoDB.
 */
import { NextRequest } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import Order from "../../../../lib/models/Order";

const ALLOWED_STATUSES = [
  "pending", "confirmed", "preparing",
  "out_for_delivery", "delivered", "cancelled",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNumber, status, secret } = body;

    /* ── Verify shared secret ── */
    if (!secret || secret !== process.env.WEBHOOK_SECRET) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    /* ── Validate inputs ── */
    if (!orderNumber || !status) {
      return Response.json(
        { error: "orderNumber and status are required." },
        { status: 400 },
      );
    }
    if (!ALLOWED_STATUSES.includes(status)) {
      return Response.json({ error: "Invalid status." }, { status: 400 });
    }

    /* ── Update in MongoDB ── */
    await connectDB();
    const order = await Order.findOneAndUpdate(
      { orderNumber },
      { $set: { status } },
      { new: true },
    );

    if (!order) {
      return Response.json({ error: "Order not found." }, { status: 404 });
    }

    console.log(`[webhook] Order ${orderNumber} → ${status}`);
    return Response.json({
      success: true,
      orderNumber: order.orderNumber,
      status:      order.status,
      customerName: order.customerName,
    });
  } catch (err) {
    console.error("[webhook/order-status]", err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}
