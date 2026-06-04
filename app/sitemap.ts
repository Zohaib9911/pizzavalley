import type { MetadataRoute } from "next";
import { connectDB } from "../lib/mongodb";
import MenuItem from "../lib/models/MenuItem";

const BASE_URL = "https://pizzavalley.store";

const categorySlugs = [
  "regular-pizza", "special-pizza", "burger", "sandwich", "roll",
  "wraps", "fries", "pasta", "sharwarma", "cakes", "pastries",
  "fast-food-deals", "pizza-deals", "customized-cakes", "wings", "special-biscuits",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                 lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE_URL}/branches`,   lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/about`,      lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categorySlugs.map(slug => ({
    url:             `${BASE_URL}/category/${slug}`,
    lastModified:    now,
    changeFrequency: "weekly" as const,
    priority:        0.9,
  }));

  /* ── Fetch product pages from DB ── */
  let productPages: MetadataRoute.Sitemap = [];
  try {
    await connectDB();
    const items = await MenuItem.find({ isActive: true })
      .select("_id updatedAt")
      .lean() as { _id: unknown; updatedAt?: Date }[];

    productPages = items.map(item => ({
      url:             `${BASE_URL}/product/${String(item._id)}`,
      lastModified:    item.updatedAt ?? now,
      changeFrequency: "weekly" as const,
      priority:        0.8,
    }));
  } catch { /* DB unavailable — skip product pages */ }

  return [...staticPages, ...categoryPages, ...productPages];
}
