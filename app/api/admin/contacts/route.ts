import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import User from "../../../../lib/models/User";
import Contact from "../../../../lib/models/Contact";

async function getAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("pv_token")?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    await connectDB();
    const user = await User.findById(decoded.userId).select("isAdmin");
    return user?.isAdmin ? user : null;
  } catch { return null; }
}

/* GET /api/admin/contacts — list all contact messages */
export async function GET() {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  await connectDB();
  const contacts = await Contact.find().sort({ createdAt: -1 });
  return Response.json({ contacts });
}

/* PATCH /api/admin/contacts/[id] — mark as read */
export async function PATCH(request: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  const { id, read } = await request.json();
  await connectDB();
  await Contact.findByIdAndUpdate(id, { read });
  return Response.json({ ok: true });
}

/* DELETE /api/admin/contacts — delete a contact */
export async function DELETE(request: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  const { id } = await request.json();
  await connectDB();
  await Contact.findByIdAndDelete(id);
  return Response.json({ ok: true });
}
