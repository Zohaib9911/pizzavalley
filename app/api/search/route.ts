import { NextRequest } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import MenuItem from "../../../lib/models/MenuItem";
import { products } from "../../data/products";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 1) return Response.json({ results: [] });

  const lower = q.toLowerCase();

  try {
    /* ── Try DB first ── */
    await connectDB();
    const dbItems = await MenuItem.find({
      isActive: true,
      name: { $regex: q, $options: "i" },
    })
      .limit(8)
      .select("_id name categorySlug variants price")
      .lean();

    if (dbItems.length > 0) {
      const results = dbItems.map(item => ({
        id:           String(item._id),
        name:         item.name,
        categorySlug: item.categorySlug,
        price:        item.variants?.length
          ? Math.min(...item.variants.map((v: { price: number }) => v.price))
          : item.price ?? 0,
      }));
      return Response.json({ results });
    }
  } catch { /* fall through to static */ }

  /* ── Fall back to static product list ── */
  const results = products
    .filter(p => p.name.toLowerCase().includes(lower))
    .slice(0, 8)
    .map(p => ({
      id:           p.id,
      name:         p.name,
      categorySlug: p.categorySlug,
      price:        p.variants?.length
        ? Math.min(...p.variants.map(v => v.price))
        : p.price ?? 0,
    }));

  return Response.json({ results });
}
