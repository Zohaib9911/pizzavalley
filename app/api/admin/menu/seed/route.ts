/**
 * POST /api/admin/menu/seed
 * Seeds MongoDB with all static products from app/data/products.ts.
 * Safe to call multiple times — skips items that already exist by name+category.
 */
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "../../../../../lib/mongodb";
import MenuItem from "../../../../../lib/models/MenuItem";
import User from "../../../../../lib/models/User";
import { products } from "../../../../data/products";

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

export async function POST() {
  if (!(await isAdmin())) return Response.json({ error: "Forbidden." }, { status: 403 });

  await connectDB();

  let inserted = 0;
  let skipped  = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const exists = await MenuItem.exists({ name: p.name, categorySlug: p.categorySlug });
    if (exists) { skipped++; continue; }

    await MenuItem.create({
      name:         p.name,
      urduName:     p.urduName  ?? "",
      description:  p.description ?? "",
      categorySlug: p.categorySlug,
      variants:     p.variants,
      price:        p.price,
      badge:        p.badge    ?? "",
      dealItems:    p.dealItems ?? [],
      image:        "",
      isActive:     true,
      sortOrder:    i,
    });
    inserted++;
  }

  return Response.json({ message: `Seed complete. Inserted: ${inserted}, Skipped (already exist): ${skipped}.` });
}
