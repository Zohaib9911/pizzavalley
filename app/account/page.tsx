"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../lib/context/AuthContext";
import AnnouncementBar from "../components/AnnouncementBar";
import Header from "../components/Header";
import Footer from "../components/Footer";

interface UserData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  isAdmin: boolean;
}

/* ── Eye toggle ── */
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/* ── Reusable input field ── */
function Field({ label, type, value, onChange, placeholder, required = true }: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string; required?: boolean;
}) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] tracking-[0.15em] uppercase font-semibold text-gray-600">
        {label} {required && <span className="text-[#8b1c1c]">*</span>}
      </label>
      <div className="relative">
        <input
          type={isPass && show ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-3 pr-10 text-sm border border-gray-300 outline-none focus:border-[#8b1c1c] transition-colors bg-white text-gray-900 placeholder-gray-400"
        />
        {isPass && (
          <button type="button" onClick={() => setShow(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <EyeIcon open={show} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Google Sign-In button ── */
function GoogleButton({ redirectTo }: { redirectTo?: string | null }) {
  const href = redirectTo
    ? `/api/auth/google?redirect=${encodeURIComponent(redirectTo)}`
    : "/api/auth/google";
  return (
    <a
      href={href}
      className="flex items-center justify-center gap-3 w-full py-3 border border-gray-300 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
    >
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.5 30.2 0 24 0 14.6 0 6.6 5.5 2.8 13.5l7.9 6.1C12.5 13.1 17.8 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z"/>
        <path fill="#FBBC05" d="M10.7 28.4A14.4 14.4 0 019.5 24c0-1.5.3-3 .8-4.4l-7.9-6.1A23.9 23.9 0 000 24c0 3.9.9 7.5 2.6 10.7l8.1-6.3z"/>
        <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.2 0-11.5-4.2-13.4-9.9l-8.1 6.3C6.6 42.5 14.6 48 24 48z"/>
      </svg>
      Continue with Google
    </a>
  );
}

/* ── Divider ── */
function Divider() {
  return (
    <div className="flex items-center gap-3 text-gray-400">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-[11px] tracking-widest uppercase">or</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

/* ── Logged-in dashboard ── */
function Dashboard({ user, onSignOut }: { user: UserData; onSignOut: () => void }) {
  const tiles = [
    { label: "My Orders",        icon: "📦", href: "/orders",  desc: "Track your order status" },
    { label: "My Addresses",     icon: "📍", href: "#",        desc: "Saved delivery addresses" },
    { label: "Wishlist",         icon: "❤️", href: "#",        desc: "Your saved favourites"   },
    { label: "Account Settings", icon: "⚙️", href: "#",        desc: "Update your profile"     },
    ...(user.isAdmin ? [{ label: "Admin Panel", icon: "🛡️", href: "/admin", desc: "Manage orders & users" }] : []),
  ];

  return (
    <div className="bg-white shadow-sm" style={{ border: "1px solid #e5e5e5" }}>
      {/* Header */}
      <div className="px-6 sm:px-8 py-6 border-b border-gray-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#8b1c1c] flex items-center justify-center text-white text-lg font-bold shrink-0">
          {user.fullName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{user.fullName}</p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
          {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
        </div>
        {user.isAdmin && (
          <span className="ml-auto shrink-0 px-2 py-0.5 bg-[#8b1c1c] text-white text-[9px] tracking-widest uppercase font-bold rounded">
            Admin
          </span>
        )}
      </div>

      {/* Dashboard tiles */}
      <div className="px-6 sm:px-8 py-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tiles.map(item => (
          <Link key={item.label} href={item.href}
            className="flex items-start gap-3 px-4 py-3.5 border border-gray-200 text-left hover:border-[#8b1c1c] hover:shadow-sm transition-all group">
            <span className="text-xl mt-0.5 shrink-0">{item.icon}</span>
            <div>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-[#8b1c1c] transition-colors">{item.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{item.desc}</p>
            </div>
            <svg className="ml-auto shrink-0 mt-1 text-gray-300 group-hover:text-[#8b1c1c] transition-colors" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </Link>
        ))}
      </div>

      {/* Sign out */}
      <div className="px-6 sm:px-8 pb-6">
        <button onClick={onSignOut}
          className="w-full py-3 border border-gray-300 text-[11px] tracking-[0.2em] uppercase text-gray-600 hover:bg-[#8b1c1c] hover:text-white hover:border-[#8b1c1c] transition-colors font-medium">
          Sign Out
        </button>
      </div>
    </div>
  );
}

/* ── Error messages for OAuth errors in the URL ── */
const OAUTH_ERRORS: Record<string, string> = {
  google_denied:  "Google sign-in was cancelled.",
  google_failed:  "Google sign-in failed. Please try again.",
  google_no_email:"Google didn't return an email. Please try another method.",
  invalid_state:  "Security check failed. Please try signing in again.",
};

/* ── Main page (inner — needs Suspense because of useSearchParams) ── */
function AccountPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refresh: refreshAuth } = useAuth();
  const redirectTo = searchParams.get("redirect") || null;
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(() => {
    // Show OAuth error from URL if present (handled client-side after mount)
    return "";
  });
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState<UserData | null>(null);

  // Sign In state
  const [siEmail,    setSiEmail]    = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [siRemember, setSiRemember] = useState(false);

  // Sign Up state
  const [suName,     setSuName]     = useState("");
  const [suEmail,    setSuEmail]    = useState("");
  const [suPhone,    setSuPhone]    = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suConfirm,  setSuConfirm]  = useState("");

  /* Check session + handle OAuth errors */
  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError && OAUTH_ERRORS[oauthError]) {
      setError(OAUTH_ERRORS[oauthError]);
    }

    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => { if (data.user) setUser(data.user); })
      .finally(() => setLoading(false));
  }, [searchParams]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(""); setSubmitting(true);
    try {
      const res  = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: siEmail, password: siPassword, remember: siRemember }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setUser(data.user);
      await refreshAuth();
      if (redirectTo) router.replace(redirectTo);
    } catch { setError("Network error. Please try again."); }
    finally   { setSubmitting(false); }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (suPassword !== suConfirm) { setError("Passwords do not match."); return; }
    setSubmitting(true);
    try {
      const res  = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: suName, email: suEmail, password: suPassword, phone: suPhone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setUser(data.user);
      await refreshAuth();
      router.replace(redirectTo ?? "/");
    } catch { setError("Network error. Please try again."); }
    finally   { setSubmitting(false); }
  }

  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    setUser(null);
    await refreshAuth();
    setSiEmail(""); setSiPassword("");
  }

  const changeTab = (t: "signin" | "signup") => {
    setTab(t); setError(""); setSuccess("");
  };

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="min-h-[70vh] bg-[#f5f0e8] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          {/* Breadcrumb */}
          <p className="text-center text-[11px] tracking-[0.25em] uppercase text-gray-400 mb-6">
            <Link href="/" className="hover:text-[#8b1c1c]">Home</Link>
            &nbsp;/&nbsp;My Account
          </p>

          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex flex-col items-center">
              <span className="font-playfair italic font-bold text-[#8b1c1c] leading-none" style={{ fontSize: "28px" }}>
                Pizza Valley
              </span>
              <span className="text-[9px] tracking-[0.35em] uppercase text-gray-400 mt-0.5">
                Sweet Valley
              </span>
            </Link>
          </div>

          {loading ? (
            <div className="bg-white border border-gray-200 p-8 text-center text-sm text-gray-400 animate-pulse">
              Loading…
            </div>
          ) : user ? (
            <Dashboard user={user} onSignOut={handleSignOut} />
          ) : (
            <div className="bg-white shadow-sm" style={{ border: "1px solid #e5e5e5" }}>

              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                {(["signin", "signup"] as const).map(t => (
                  <button key={t} onClick={() => changeTab(t)}
                    className={`flex-1 py-4 text-[11px] tracking-[0.2em] uppercase font-semibold transition-colors ${
                      tab === t
                        ? "text-[#8b1c1c] border-b-2 border-[#8b1c1c] -mb-px"
                        : "text-gray-500 hover:text-gray-700"
                    }`}>
                    {t === "signin" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>

              {/* Error / success banners */}
              {error && (
                <div className="mx-6 sm:mx-8 mt-5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                  {error}
                </div>
              )}
              {success && (
                <div className="mx-6 sm:mx-8 mt-5 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded">
                  {success}
                </div>
              )}

              {/* ── Sign In ── */}
              {tab === "signin" && (
                <form className="flex flex-col gap-5 p-6 sm:p-8" onSubmit={handleSignIn}>
                  <GoogleButton redirectTo={redirectTo} />
                  <Divider />

                  <Field label="Email Address" type="email"     value={siEmail}    onChange={setSiEmail}    placeholder="you@example.com" />
                  <Field label="Password"      type="password"  value={siPassword} onChange={setSiPassword} placeholder="••••••••" />

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={siRemember} onChange={e => setSiRemember(e.target.checked)} className="w-4 h-4 accent-[#8b1c1c]" />
                      <span className="text-[11px] tracking-wide text-gray-600">Remember me</span>
                    </label>
                    <button type="button" className="text-[11px] tracking-wide text-[#8b1c1c] hover:underline">
                      Forgot Password?
                    </button>
                  </div>

                  <button type="submit" disabled={submitting}
                    className="w-full py-3.5 bg-[#8b1c1c] text-white text-[11px] tracking-[0.2em] uppercase font-semibold hover:bg-[#6b1414] transition-colors disabled:opacity-60">
                    {submitting ? "Signing In…" : "Sign In"}
                  </button>

                  <p className="text-center text-[11px] text-gray-500">
                    Don&apos;t have an account?{" "}
                    <button type="button" onClick={() => changeTab("signup")} className="text-[#8b1c1c] font-semibold hover:underline">
                      Create one
                    </button>
                  </p>
                </form>
              )}

              {/* ── Create Account ── */}
              {tab === "signup" && (
                <form className="flex flex-col gap-5 p-6 sm:p-8" onSubmit={handleSignUp}>
                  <GoogleButton redirectTo={redirectTo} />
                  <Divider />

                  <Field label="Full Name"        type="text"     value={suName}     onChange={setSuName}     placeholder="Your full name" />
                  <Field label="Email Address"    type="email"    value={suEmail}    onChange={setSuEmail}    placeholder="you@example.com" />
                  <Field label="Phone Number"     type="tel"      value={suPhone}    onChange={setSuPhone}    placeholder="e.g. 03001234567" required={false} />
                  <Field label="Password"         type="password" value={suPassword} onChange={setSuPassword} placeholder="Min. 8 characters" />
                  <Field label="Confirm Password" type="password" value={suConfirm}  onChange={setSuConfirm}  placeholder="Repeat your password" />

                  <button type="submit" disabled={submitting}
                    className="w-full py-3.5 bg-[#8b1c1c] text-white text-[11px] tracking-[0.2em] uppercase font-semibold hover:bg-[#6b1414] transition-colors disabled:opacity-60">
                    {submitting ? "Creating Account…" : "Create Account"}
                  </button>

                  <p className="text-center text-[11px] text-gray-500">
                    Already have an account?{" "}
                    <button type="button" onClick={() => changeTab("signin")} className="text-[#8b1c1c] font-semibold hover:underline">
                      Sign in
                    </button>
                  </p>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

/* ── Shell — Suspense required whenever useSearchParams is used ── */
export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center text-sm text-gray-400">
        Loading…
      </div>
    }>
      <AccountPageContent />
    </Suspense>
  );
}
