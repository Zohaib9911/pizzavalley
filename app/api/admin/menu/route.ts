import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "../../../../lib/mongodb";
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

/* GET /api/admin/menu — all items for the admin panel */
export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Forbidden." }, { status: 403 });
  await connectDB();
  const items = await MenuItem.find({})
    .sort({ categorySlug: 1, sortOrder: 1, createdAt: 1 })
    .lean();
  return Response.json({ items });
}

/* POST /api/admin/menu — create a new menu item */
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "Forbidden." }, { status: 403 });

  const body = await request.json();
  if (!body.name?.trim() || !body.categorySlug) {
    return Response.json({ error: "Name and category are required." }, { status: 400 });
  }

  await connectDB();
  const item = await MenuItem.create(body);
  return Response.json({ item }, { status: 201 });
}
