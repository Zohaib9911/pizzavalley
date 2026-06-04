import { NextRequest } from "next/server";
import { haversineKm } from "../../../lib/haversine";

const RADIUS_KM = parseFloat(process.env.DELIVERY_RADIUS_KM ?? "5");

const BRANCHES = {
  bahawalpur: {
    lat:  parseFloat(process.env.SHOP_LAT    ?? "29.357258"),
    lng:  parseFloat(process.env.SHOP_LNG    ?? "71.693754"),
    name: "Bahawalpur",
  },
  yazman: {
    lat:  parseFloat(process.env.YAZMAN_LAT  ?? "29.130616"),
    lng:  parseFloat(process.env.YAZMAN_LNG  ?? "71.747700"),
    name: "Yazman",
  },
} as const;

/* POST /api/check-delivery — { lat: number, lng: number, branch?: "bahawalpur" | "yazman" } */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lat, lng, branch = "bahawalpur" } = body;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return Response.json({ error: "lat and lng must be numbers." }, { status: 400 });
    }

    const shop = BRANCHES[branch as keyof typeof BRANCHES] ?? BRANCHES.bahawalpur;
    const distance = haversineKm(shop.lat, shop.lng, lat, lng);
    const distKm   = Math.round(distance * 10) / 10;
    const allowed  = distance <= RADIUS_KM;

    return Response.json({
      allowed,
      distanceKm: distKm,
      radiusKm:   RADIUS_KM,
      branch:     branch,
      branchName: shop.name,
      message: allowed
        ? `You're ${distKm} km from our ${shop.name} branch — within the delivery zone! 🎉`
        : `You're ${distKm} km from our ${shop.name} branch. We only deliver within ${RADIUS_KM} km.`,
    });
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
}
