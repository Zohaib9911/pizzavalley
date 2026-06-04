/**
 * Admin reviews endpoint
 * GET  /api/admin/reviews          — all reviews with product info joined
 * DELETE /api/admin/reviews?id=xxx — delete any review by _id
 */
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { connectDB } from "../../../../lib/mongodb";
import Review from "../../../../lib/models/Review";
import MenuItem from "../../../../lib/models/MenuItem";
import User from "../../../../lib/models/User";

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

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Forbidden." }, { status: 403 });

  await connectDB();
  const reviews = await Review.find({}).sort({ createdAt: -1 }).lean();

  // Batch-fetch product info for all unique productIds
  const productIds = [...new Set(reviews.map(r => r.productId))].filter(id => {
    try { new mongoose.Types.ObjectId(id); return true; } catch { return false; }
  });
  const items = await MenuItem.find({ _id: { $in: productIds } })
    .select("name categorySlug image badge")
    .lean();
  const itemMap = Object.fromEntries(items.map(i => [String(i._id), i]));

  const enriched = reviews.map(r => ({
    ...r,
    _id:     String(r._id),
    product: itemMap[r.productId] ?? null,
  }));

  // Summary stats
  const totalCount = reviews.length;
  const avgRating  = totalCount
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / totalCount) * 10) / 10
    : 0;

  return Response.json({ reviews: enriched, totalCount, avgRating });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "Forbidden." }, { status: 403 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Review id required." }, { status: 400 });

  await connectDB();
  const deleted = await Review.findByIdAndDelete(id);
  if (!deleted) return Response.json({ error: "Review not found." }, { status: 404 });
  return Response.json({ message: "Review deleted." });
}
