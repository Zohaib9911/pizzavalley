import { NextRequest } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import MenuItem from "../../../lib/models/MenuItem";

/* GET /api/menu?category=slug  — public menu endpoint */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  await connectDB();
  const query: Record<string, unknown> = { isActive: true };
  if (category) query.categorySlug = category;

  const items = await MenuItem.find(query)
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  return Response.json({ items });
}
