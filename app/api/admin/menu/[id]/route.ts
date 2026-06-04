import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import { connectDB } from "../../../../../lib/mongodb";
import MenuItem from "../../../../../lib/models/MenuItem";
import User from "../../../../../lib/models/User";

cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
});

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

/* PATCH /api/admin/menu/[id] — update a menu item */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) return Response.json({ error: "Forbidden." }, { status: 403 });

  const { id } = await params;
  const body = await request.json();

  await connectDB();
  const item = await MenuItem.findByIdAndUpdate(id, { $set: body }, { new: true });
  if (!item) return Response.json({ error: "Item not found." }, { status: 404 });
  return Response.json({ item });
}

/* DELETE /api/admin/menu/[id] — delete a menu item (+ its Cloudinary image) */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) return Response.json({ error: "Forbidden." }, { status: 403 });

  const { id } = await params;
  await connectDB();
  const item = await MenuItem.findByIdAndDelete(id);
  if (!item) return Response.json({ error: "Item not found." }, { status: 404 });

  // Clean up Cloudinary image if present
  if (item.image && item.image.includes("cloudinary.com")) {
    try {
      const parts = item.image.split("/");
      const fileWithExt = parts[parts.length - 1];
      const publicId = `pizzavalley/menu/${fileWithExt.split(".")[0]}`;
      await cloudinary.uploader.destroy(publicId);
    } catch { /* non-critical */ }
  }

  return Response.json({ message: `"${item.name}" deleted.` });
}
