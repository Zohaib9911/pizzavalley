import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("pv_token");
  return Response.json({ message: "Signed out successfully." });
}
