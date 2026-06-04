import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import { connectDB } from "../../../../lib/mongodb";
import User from "../../../../lib/models/User";

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

/* POST /api/admin/upload — upload image → Cloudinary, return URL */
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "Forbidden." }, { status: 403 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return Response.json({ error: "No file provided." }, { status: 400 });

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: "pizzavalley/menu",
      transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto:good" }],
    });

    return Response.json({ url: result.secure_url });
  } catch (err) {
    console.error("[upload]", err);
    return Response.json({ error: "Upload failed." }, { status: 500 });
  }
}
