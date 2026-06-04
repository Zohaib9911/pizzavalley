import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "../../../lib/mongodb";
import Review from "../../../lib/models/Review";
import User from "../../../lib/models/User";

async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("pv_token")?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    await connectDB();
    return await User.findById(decoded.userId).select("_id fullName");
  } catch { return null; }
}

/* GET /api/reviews?productId=xxx */
export async function GET(request: NextRequest) {
  const productId = new URL(request.url).searchParams.get("productId");
  if (!productId) return Response.json({ error: "productId required." }, { status: 400 });

  await connectDB();
  const reviews = await Review.find({ productId }).sort({ createdAt: -1 }).lean();

  // Compute summary
  const count = reviews.length;
  const avg   = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  const dist  = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }));

  return Response.json({ reviews, summary: { avg: Math.round(avg * 10) / 10, count, dist } });
}

/* POST /api/reviews — submit or update own review */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Please log in to leave a review." }, { status: 401 });

  const { productId, rating, comment } = await request.json();

  if (!productId || !rating || !comment?.trim()) {
    return Response.json({ error: "productId, rating and comment are required." }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return Response.json({ error: "Rating must be 1–5." }, { status: 400 });
  }

  await connectDB();

  // Upsert — user can update their own review
  const review = await Review.findOneAndUpdate(
    { productId, userId: String(session._id) },
    {
      $set: {
        userName: session.fullName,
        rating,
        comment: comment.trim(),
      },
    },
    { upsert: true, new: true },
  );

  return Response.json({ review }, { status: 201 });
}

/* DELETE /api/reviews?productId=xxx — delete own review */
export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorised." }, { status: 401 });

  const productId = new URL(request.url).searchParams.get("productId");
  if (!productId) return Response.json({ error: "productId required." }, { status: 400 });

  await connectDB();
  await Review.findOneAndDelete({ productId, userId: String(session._id) });
  return Response.json({ message: "Review deleted." });
}
