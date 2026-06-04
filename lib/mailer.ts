// Uses Resend HTTP API (port 443) — works even when SMTP is blocked by server firewall

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: string;
  items: { name: string; variant?: string; qty: number; price: number }[];
  subtotal: number;
  notes?: string;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  deliveryDistanceKm?: number | null;
  branch?: string;
  createdAt?: Date;
}

export async function sendOrderEmail(order: OrderEmailData) {
  const now = new Date().toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
    hour12: true,
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const branch = order.branch
    ? order.branch.charAt(0).toUpperCase() + order.branch.slice(1)
    : "Bahawalpur";

  const itemsRows = (order.items || []).map(i => {
    const variant = i.variant ? ` <span style="color:#666;font-size:12px;">(${i.variant})</span>` : "";
    const lineTotal = i.price > 0 ? `PKR ${(i.price * i.qty).toLocaleString()}` : "—";
    return `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0e8dc;">${i.qty}x</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0e8dc;">${i.name}${variant}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0e8dc;text-align:right;font-weight:600;color:#8b1c1c;">${lineTotal}</td>
      </tr>`;
  }).join("");

  let locationBlock = `
    <tr>
      <td style="padding:6px 0;color:#555;font-size:13px;width:130px;">Address</td>
      <td style="padding:6px 0;font-size:13px;font-weight:500;">${order.address || "Not provided"}</td>
    </tr>`;

  if (order.deliveryLat && order.deliveryLng) {
    const lat = Number(order.deliveryLat).toFixed(5);
    const lng = Number(order.deliveryLng).toFixed(5);
    const mapsUrl = `https://maps.google.com/?q=${order.deliveryLat},${order.deliveryLng}`;
    const dist = order.deliveryDistanceKm ? ` <span style="color:#888;font-size:12px;">(${order.deliveryDistanceKm} km from ${branch} branch)</span>` : "";
    locationBlock += `
      <tr>
        <td style="padding:6px 0;color:#555;font-size:13px;">GPS</td>
        <td style="padding:6px 0;font-size:13px;">${lat}N, ${lng}E${dist}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#555;font-size:13px;">Maps</td>
        <td style="padding:6px 0;font-size:13px;"><a href="${mapsUrl}" style="color:#8b1c1c;font-weight:600;">Open in Google Maps</a></td>
      </tr>`;
  }

  const total = order.subtotal > 0
    ? `PKR ${Number(order.subtotal).toLocaleString()}`
    : "TBD — confirm with customer";

  const notesRow = order.notes ? `
    <tr>
      <td style="padding:6px 0;color:#555;font-size:13px;">Notes</td>
      <td style="padding:6px 0;font-size:13px;font-style:italic;">${order.notes}</td>
    </tr>` : "";

  const emailRow = order.customerEmail ? `
    <tr>
      <td style="padding:6px 0;color:#555;font-size:13px;">Email</td>
      <td style="padding:6px 0;font-size:13px;">${order.customerEmail}</td>
    </tr>` : "";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#8b1c1c;padding:24px 30px;">
            <table width="100%">
              <tr>
                <td>
                  <p style="margin:0;color:#f5d0d0;font-size:11px;letter-spacing:2px;text-transform:uppercase;">New Order Received</p>
                  <h1 style="margin:6px 0 0;color:#fff;font-size:26px;letter-spacing:1px;">Pizza ${order.orderNumber}</h1>
                </td>
                <td align="right">
                  <span style="display:inline-block;background:rgba(255,255,255,0.15);color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;letter-spacing:1px;">
                    ${branch} Branch
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Customer Info -->
        <tr>
          <td style="padding:24px 30px 0;">
            <p style="margin:0 0 12px;font-size:11px;color:#999;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Customer Details</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;color:#555;font-size:13px;width:130px;">Name</td>
                <td style="padding:6px 0;font-size:13px;font-weight:600;">${order.customerName}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#555;font-size:13px;">Phone</td>
                <td style="padding:6px 0;font-size:13px;"><a href="tel:${order.customerPhone}" style="color:#8b1c1c;font-weight:600;text-decoration:none;">${order.customerPhone}</a></td>
              </tr>
              ${emailRow}
              ${locationBlock}
              ${notesRow}
            </table>
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="padding:20px 30px 0;"><div style="border-top:1px solid #f0e8dc;"></div></td></tr>

        <!-- Order Items -->
        <tr>
          <td style="padding:20px 30px 0;">
            <p style="margin:0 0 12px;font-size:11px;color:#999;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Order Items</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0e8dc;border-radius:4px;overflow:hidden;">
              <tr style="background:#fdf8f2;">
                <th style="padding:8px 12px;text-align:left;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #f0e8dc;width:40px;">Qty</th>
                <th style="padding:8px 12px;text-align:left;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #f0e8dc;">Item</th>
                <th style="padding:8px 12px;text-align:right;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #f0e8dc;">Total</th>
              </tr>
              ${itemsRows}
              <tr style="background:#fdf8f2;">
                <td colspan="2" style="padding:12px;font-weight:700;font-size:14px;border-top:2px solid #f0e8dc;">Order Total</td>
                <td style="padding:12px;font-weight:700;font-size:16px;color:#8b1c1c;text-align:right;border-top:2px solid #f0e8dc;">${total}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 30px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#aaa;">${now} (Pakistan Time)</p>
            <p style="margin:8px 0 0;font-size:11px;color:#ccc;">Pizza Valley Order Management System</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");

  const toEmail = process.env.GMAIL_USER ?? process.env.NOTIFY_EMAIL;
  if (!toEmail) throw new Error("No recipient email configured (GMAIL_USER or NOTIFY_EMAIL)");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Pizza Valley Orders <orders@pizzavalley.store>",
      to: [toEmail],
      subject: `New Order ${order.orderNumber} - ${order.customerName} (${branch})`,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend API error ${res.status}: ${text}`);
  }
}
