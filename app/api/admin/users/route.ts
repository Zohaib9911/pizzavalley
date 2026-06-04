/**
 * Admin-only API to manage users.
 *
 * GET    /api/admin/users          — list all users
 * POST   /api/admin/users          — { userId, isAdmin: bool } toggle admin flag
 * PATCH  /api/admin/users          — { userId, isBanned: bool } toggle bad-user flag
 * DELETE /api/admin/users          — { userId } permanently delete a user
 */
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "../../../../lib/mongodb";
import User from "../../../../lib/models/User";

async function getRequestingUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("pv_token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    await connectDB();
    return await User.findById(decoded.userId).select("isAdmin");
  } catch {
    return null;
  }
}

/* ── GET: list all users ── */
export async function GET() {
  const requester = await getRequestingUser();
  if (!requester?.isAdmin) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  await connectDB();
  const users = await User.find({}).select("-password -googleId -__v").sort({ createdAt: -1 });
  return Response.json({ users });
}

/* ── POST: toggle isAdmin ── */
export async function POST(request: NextRequest) {
  const requester = await getRequestingUser();
  if (!requester?.isAdmin) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const { userId, isAdmin } = await request.json();
  if (!userId || typeof isAdmin !== "boolean") {
    return Response.json({ error: "userId and isAdmin (boolean) are required." }, { status: 400 });
  }

  // Prevent self-demotion
  if (userId === requester._id.toString() && !isAdmin) {
    return Response.json({ error: "You cannot remove your own admin access." }, { status: 400 });
  }

  await connectDB();
  const updated = await User.findByIdAndUpdate(
    userId,
    { $set: { isAdmin } },
    { new: true, select: "-password -googleId" }
  );

  if (!updated) {
    return Response.json({ error: "User not found." }, { status: 404 });
  }

  return Response.json({
    message: `${updated.email} is now ${isAdmin ? "an admin" : "a regular user"}.`,
    user: updated,
  });
}

/* ── PATCH: toggle isBanned (bad user flag) ── */
export async function PATCH(request: NextRequest) {
  const requester = await getRequestingUser();
  if (!requester?.isAdmin) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const { userId, isBanned } = await request.json();
  if (!userId || typeof isBanned !== "boolean") {
    return Response.json({ error: "userId and isBanned (boolean) are required." }, { status: 400 });
  }

  // Prevent banning yourself
  if (userId === requester._id.toString()) {
    return Response.json({ error: "You cannot flag yourself as a bad user." }, { status: 400 });
  }

  await connectDB();
  const updated = await User.findByIdAndUpdate(
    userId,
    { $set: { isBanned } },
    { new: true, select: "-password -googleId" }
  );

  if (!updated) {
    return Response.json({ error: "User not found." }, { status: 404 });
  }

  return Response.json({
    message: `${updated.email} has been ${isBanned ? "flagged as a bad user" : "unflagged"}.`,
    user: updated,
  });
}

/* ── DELETE: permanently remove a user ── */
export async function DELETE(request: NextRequest) {
  const requester = await getRequestingUser();
  if (!requester?.isAdmin) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const { userId } = await request.json();
  if (!userId) {
    return Response.json({ error: "userId is required." }, { status: 400 });
  }

  // Prevent self-deletion
  if (userId === requester._id.toString()) {
    return Response.json({ error: "You cannot delete your own account from here." }, { status: 400 });
  }

  await connectDB();
  const deleted = await User.findByIdAndDelete(userId);

  if (!deleted) {
    return Response.json({ error: "User not found." }, { status: 404 });
  }

  return Response.json({ message: `User ${deleted.email} has been permanently removed.` });
}
