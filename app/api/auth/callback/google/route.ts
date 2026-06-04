import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "../../../../../lib/mongodb";
import User from "../../../../../lib/models/User";

export async function GET(request: NextRequest) {
  // Always use the public URL for redirects — request.nextUrl.origin returns
  // the internal host (e.g. localhost:3002) when running behind a reverse proxy.
  const publicBase = (
    process.env.NEXT_PUBLIC_BASE_URL ?? request.nextUrl.origin
  ).replace(/\/$/, "");

  const { searchParams } = request.nextUrl;

  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // User cancelled or Google returned an error
  if (error || !code) {
    return Response.redirect(`${publicBase}/account?error=google_denied`);
  }

  // Verify CSRF state
  const cookieStore = await cookies();
  const savedState = cookieStore.get("google_oauth_state")?.value;
  cookieStore.delete("google_oauth_state");

  if (!state || state !== savedState) {
    return Response.redirect(`${publicBase}/account?error=invalid_state`);
  }

  try {
    const baseUrl = publicBase;
    const redirectUri = `${baseUrl}/api/auth/callback/google`;

    // ── 1. Exchange authorization code for tokens ──────────────────
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("[google-callback] token exchange failed:", tokens);
      return Response.redirect(`${publicBase}/account?error=google_failed`);
    }

    // ── 2. Fetch user profile from Google ──────────────────────────
    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );
    const profile = await profileRes.json();

    if (!profile.email) {
      return Response.redirect(`${publicBase}/account?error=google_no_email`);
    }

    // ── 3. Find or create user in MongoDB ──────────────────────────
    await connectDB();

    let user = await User.findOne({
      $or: [{ googleId: profile.sub }, { email: profile.email }],
    });

    if (!user) {
      // Brand-new user — create with Google details
      user = await User.create({
        fullName: profile.name ?? profile.email.split("@")[0],
        email: profile.email,
        googleId: profile.sub,
        password: "",
      });
    } else if (!user.googleId) {
      // Existing email/password account — link Google ID
      user.googleId = profile.sub;
      await user.save();
    }

    // ── 4. Issue our JWT cookie ────────────────────────────────────
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    cookieStore.set("pv_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    // Read and clear the post-login redirect cookie
    const redirectTo = cookieStore.get("pv_redirect")?.value || "";
    cookieStore.delete("pv_redirect");

    return Response.redirect(
      redirectTo ? `${publicBase}${redirectTo}` : `${publicBase}/account`
    );
  } catch (err) {
    console.error("[google-callback]", err);
    return Response.redirect(`${publicBase}/account?error=google_failed`);
  }
}
