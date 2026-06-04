import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "../../../lib/mongodb";
import Order from "../../../lib/models/Order";
import User from "../../../lib/models/User";
import { haversineKm } from "../../../lib/haversine";
import { sendOrderEmail } from "../../../lib/mailer";

const RADIUS_KM = parseFloat(process.env.DELIVERY_RADIUS_KM ?? "5");

const BRANCHES = {
  bahawalpur: {
    lat:  parseFloat(process.env.SHOP_LAT   ?? "29.357258"),
    lng:  parseFloat(process.env.SHOP_LNG   ?? "71.693754"),
    name: "Bahawalpur",
  },
  yazman: {
    lat:  parseFloat(process.env.YAZMAN_LAT ?? "29.130616"),
    lng:  parseFloat(process.env.YAZMAN_LNG ?? "71.747700"),
    name: "Yazman",
  },
} as const;

async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("pv_token")?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    await connectDB();
    return await User.findById(decoded.userId).select("_id fullName email phone isAdmin");
  } catch { return null; }
}

/* ── POST /api/orders — place a new order ── */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName, customerEmail, customerPhone,
      address, items, notes,
      lat, lng,
      branch = "bahawalpur",   // "bahawalpur" | "yazman"
    } = body;

    if (!customerName || !customerPhone || !address || !items?.length) {
      return Response.json(
        { error: "Name, phone, address and at least one item are required." },
        { status: 400 },
      );
    }

    const shop = BRANCHES[branch as keyof typeof BRANCHES] ?? BRANCHES.bahawalpur;

    // ── Server-side location re-verification against the selected branch ──
    let deliveryLat: number | null         = null;
    let deliveryLng: number | null         = null;
    let deliveryDistanceKm: number | null  = null;

    if (typeof lat === "number" && typeof lng === "number") {
      const distance = haversineKm(shop.lat, shop.lng, lat, lng);
      if (distance > RADIUS_KM) {
        return Response.json(
          {
            error: `Your location (${distance.toFixed(1)} km) is outside our ${RADIUS_KM} km delivery zone from the ${shop.name} branch.`,
            distanceKm: Math.round(distance * 10) / 10,
          },
          { status: 422 },
        );
      }
      deliveryLat        = lat;
      deliveryLng        = lng;
      deliveryDistanceKm = Math.round(distance * 10) / 10;
    }

    const subtotal = items.reduce(
      (sum: number, item: { price: number; qty: number }) => sum + item.price * item.qty,
      0,
    );

    // Connect first, then resolve session (getSession also calls connectDB internally
    // when a token exists, but we call it here too so anonymous orders always connect)
    await connectDB();
    const session = await getSession();

    const order = await Order.create({
      userId:        session?._id ?? null,
      branch,
      customerName,
      customerEmail: customerEmail ?? "",
      customerPhone,
      address,
      items,
      subtotal,
      notes:              notes ?? "",
      deliveryLat,
      deliveryLng,
      deliveryDistanceKm,
    });

    /* ── Save phone number to user profile (fire-and-forget) ── */
    if (session && customerPhone) {
      User.findByIdAndUpdate(
        session._id,
        { $set: { phone: customerPhone } },
      ).exec().catch(err => console.error("[orders] phone update failed:", err));
    }

    /* ── Send order email via Resend (fire-and-forget) ── */
    if (process.env.RESEND_API_KEY) {
      sendOrderEmail({
        orderNumber:       order.orderNumber,
        customerName:      order.customerName,
        customerPhone:     order.customerPhone,
        customerEmail:     order.customerEmail,
        address:           order.address,
        items:             order.items,
        subtotal:          order.subtotal,
        notes:             order.notes,
        deliveryLat:       order.deliveryLat,
        deliveryLng:       order.deliveryLng,
        deliveryDistanceKm: order.deliveryDistanceKm,
        branch:            order.branch,
      }).catch(err => console.error("[email notify]", err));
    }

    /* ── ntfy.sh Push Notification (fire-and-forget) ── */
    {
      const branch  = order.branch === "yazman" ? "Yazman" : "Bahawalpur";
      const itemSummary = order.items
        .map((i: { qty: number; name: string; variant?: string }) =>
          i.variant ? `${i.qty}x ${i.name} (${i.variant})` : `${i.qty}x ${i.name}`)
        .join(", ");
      const total   = `PKR ${Number(order.subtotal).toLocaleString()}`;
      const mapsUrl = order.deliveryLat && order.deliveryLng
        ? `https://maps.google.com/?q=${order.deliveryLat},${order.deliveryLng}`
        : null;

      const body = [
        `👤 ${order.customerName} | 📞 ${order.customerPhone}`,
        `🏪 ${branch} Branch`,
        `📦 ${itemSummary}`,
        `💰 ${total}`,
        `📍 ${order.address}`,
        mapsUrl ? `🗺 ${mapsUrl}` : null,
        order.notes ? `📝 ${order.notes}` : null,
      ].filter(Boolean).join("\n");

      const ntfyTopic = order.branch === "yazman"
        ? "pizzavalley-orders-Yazman"
        : "pizzavalley-orders-Bahawalpur";

      fetch(`https://ntfy.sh/${ntfyTopic}`, {
        method: "POST",
        headers: {
          "Title":    `New Order ${order.orderNumber} - ${branch}`,
          "Priority": "high",
          "Tags":     "pizza,rotating_light",
          "Content-Type": "text/plain",
        },
        body: Buffer.from(body, "utf8"),
      }).catch(err => console.error("[ntfy notify]", err));
    }

    /* ── Notify n8n → Telegram (fire-and-forget, keep if still needed) ── */
    if (process.env.N8N_WEBHOOK_URL) {
      fetch(process.env.N8N_WEBHOOK_URL, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(order.toObject()),
      }).catch(err => console.error("[n8n notify]", err));
    }

    return Response.json({ message: "Order placed!", order }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[orders POST] FULL ERROR:", err);
    console.error("[orders POST] message:", message);
    return Response.json({ error: "Failed to place order.", detail: message }, { status: 500 });
  }
}

/* ── GET /api/orders — get current user's orders ── */
export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorised." }, { status: 401 });

  await connectDB();
  const orders = await Order.find({ userId: session._id }).sort({ createdAt: -1 });
  return Response.json({ orders });
}
