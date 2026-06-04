"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AnnouncementBar from "../components/AnnouncementBar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../../lib/context/CartContext";
import { useAuth } from "../../lib/context/AuthContext";

type Branch   = "bahawalpur" | "yazman";
type LocPhase = "idle" | "checking" | "allowed" | "denied" | "error";

const SHOP_PHONE = "03005558706";

const BRANCHES: Record<Branch, { name: string; area: string; address: string }> = {
  bahawalpur: { name: "Bahawalpur", area: "Main Branch",   address: "Bahawalpur, Punjab" },
  yazman:     { name: "Yazman",     area: "Yazman Branch", address: "Yazman, Punjab"     },
};

/* ── Reusable form field ── */
function Field({ label, type = "text", value, onChange, placeholder, required = true }: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder: string; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[12px] sm:text-[11px] tracking-[0.12em] uppercase font-bold text-gray-600">
        {label} {required && <span className="text-[#8b1c1c]">*</span>}
      </label>
      <input
        type={type} required={required} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-4 py-4 sm:py-3 text-[15px] sm:text-sm border-2 border-gray-200 outline-none focus:border-[#8b1c1c] bg-white text-gray-900 placeholder-gray-400 rounded-sm transition-colors"
      />
    </div>
  );
}

export default function CartPage() {
  const { items, setItemQty, removeItem, clearCart, totalItems, totalPrice } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [phone,   setPhone]   = useState("");
  const [address, setAddress] = useState("");
  const [notes,   setNotes]   = useState("");
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");

  const [branch,     setBranch]     = useState<Branch | null>(null);
  const [locPhase,   setLocPhase]   = useState<LocPhase>("idle");
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [locError,   setLocError]   = useState("");
  const [coords,     setCoords]     = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/account?redirect=/cart");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      setName(user.fullName ?? "");
      setEmail(user.email   ?? "");
      setPhone(user.phone   ?? "");
    }
  }, [user]);

  function selectBranch(b: Branch) {
    setBranch(b); setLocPhase("idle"); setCoords(null); setDistanceKm(null); setLocError("");
  }

  const checkLocation = useCallback(() => {
    if (!branch) return;
    if (!navigator.geolocation) { setLocError("GPS not supported. Please call us."); setLocPhase("error"); return; }
    setLocPhase("checking");
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        try {
          const res  = await fetch("/api/check-delivery", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat, lng, branch }),
          });
          const data = await res.json();
          setDistanceKm(data.distanceKm ?? null);
          setLocPhase(data.allowed ? "allowed" : "denied");
        } catch { setLocError("Could not verify location. Try again."); setLocPhase("error"); }
      },
      err => {
        setLocError(
          err.code === 1 ? "Location access denied. Please allow location in your browser."
          : err.code === 2 ? "Location unavailable. Try again or call us."
          : "Location request timed out. Please try again."
        );
        setLocPhase("error");
      },
      { timeout: 12000, maximumAge: 0, enableHighAccuracy: true },
    );
  }, [branch]);

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault(); setError(""); setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch, customerName: name, customerEmail: email,
          customerPhone: phone, address, notes,
          lat: coords?.lat, lng: coords?.lng,
          items: items.map(i => ({
            productId: i.id, name: i.name, variant: i.variant ?? "",
            qty: i.qty, price: i.price, categorySlug: i.categorySlug,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to place order."); return; }
      clearCart();
      setSuccess(`Order ${data.order.orderNumber} placed! We'll call you to confirm.`);
    } catch { setError("Network error. Please try again."); }
    finally   { setPlacing(false); }
  }

  const branchInfo = branch ? BRANCHES[branch] : null;

  if (authLoading || !user) {
    return (
      <>
        <AnnouncementBar /><Header />
        <main className="min-h-[60vh] bg-[#f5f0e8] flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-[#8b1c1c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Checking login…</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="min-h-[60vh] bg-[#f5f0e8]">

        {/* ── Success screen ── */}
        {success && (
          <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
            <div className="bg-white rounded-sm border border-green-200 p-8 text-center max-w-md w-full shadow-sm">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h2 className="font-playfair font-bold text-2xl text-gray-900 mb-2">Order Placed!</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">{success}</p>
              <Link href="/" className="block w-full py-4 bg-[#8b1c1c] text-white text-[13px] tracking-[0.2em] uppercase font-bold hover:bg-[#6b1414] transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}

        {!success && (
          <div className="max-w-5xl mx-auto px-3 sm:px-5 py-6 sm:py-10">

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h1 className="font-playfair font-bold text-2xl sm:text-3xl text-gray-900">Your Basket</h1>
              {items.length > 0 && (
                <span className="text-[12px] text-gray-400">{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
              )}
            </div>

            {/* ── Empty basket ── */}
            {items.length === 0 && (
              <div className="bg-white border border-gray-200 p-12 text-center rounded-sm">
                <div className="text-5xl mb-4">🛒</div>
                <p className="text-gray-500 font-semibold text-lg mb-2">Your basket is empty</p>
                <p className="text-gray-400 text-sm mb-6">Add some delicious items to get started</p>
                <Link href="/category/regular-pizza"
                  className="inline-block px-8 py-4 bg-[#8b1c1c] text-white text-[13px] tracking-[0.2em] uppercase font-bold hover:bg-[#6b1414] transition-colors">
                  Browse Menu
                </Link>
              </div>
            )}

            {items.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

                {/* ══════════ CART ITEMS ══════════ */}
                <div className="lg:col-span-2 flex flex-col gap-3">

                  {/* Items list */}
                  <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
                    {/* Header row */}
                    <div className="px-4 sm:px-5 py-3 bg-gray-50 border-b border-gray-100 flex justify-between">
                      <span className="text-[11px] tracking-[0.2em] uppercase text-gray-500 font-bold">Item</span>
                      <span className="text-[11px] tracking-[0.2em] uppercase text-gray-500 font-bold">Total</span>
                    </div>

                    {items.map(item => {
                      const key = item.variant ? `${item.id}::${item.variant}` : item.id;
                      return (
                        <div key={key} className="px-4 sm:px-5 py-5 border-b border-gray-50 last:border-b-0">
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-[16px] sm:text-[15px] font-bold text-gray-900 leading-snug">{item.name}</p>
                              {item.variant && (
                                <span className="inline-block mt-1 px-2.5 py-0.5 bg-[#8b1c1c]/10 text-[#8b1c1c] text-[12px] font-semibold rounded">
                                  {item.variant}
                                </span>
                              )}
                              <p className="text-[13px] text-gray-400 mt-1.5">PKR {item.price.toLocaleString()} each</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[16px] font-extrabold text-[#8b1c1c]">
                                PKR {(item.price * item.qty).toLocaleString()}
                              </span>
                              <button onClick={() => removeItem(item.id, item.variant)}
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" aria-label="Remove">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Qty stepper */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border-2 border-gray-200 rounded-sm overflow-hidden">
                              <button onClick={() => setItemQty(item.id, item.variant, item.qty - 1)}
                                className="w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center text-[#8b1c1c] font-bold text-xl hover:bg-[#8b1c1c] hover:text-white transition-colors">
                                −
                              </button>
                              <span className="w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center text-[16px] font-bold text-gray-900 border-x-2 border-gray-200">
                                {item.qty}
                              </span>
                              <button onClick={() => setItemQty(item.id, item.variant, item.qty + 1)}
                                className="w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center text-[#8b1c1c] font-bold text-xl hover:bg-[#8b1c1c] hover:text-white transition-colors">
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Subtotal row */}
                    <div className="px-4 sm:px-5 py-4 bg-gray-50 border-t-2 border-gray-100 flex justify-between items-center">
                      <button onClick={clearCart}
                        className="text-[12px] text-gray-400 hover:text-red-500 tracking-wide uppercase font-semibold underline transition-colors">
                        Clear All
                      </button>
                      <div className="text-right">
                        <p className="text-[11px] text-gray-500 tracking-wide uppercase mb-0.5">Subtotal ({totalItems} items)</p>
                        <p className="text-[22px] sm:text-xl font-extrabold text-[#8b1c1c]">PKR {totalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ══════════ CHECKOUT STEPS ══════════ */}
                <div className="lg:col-span-1 flex flex-col gap-4">

                  {/* STEP 1 — Branch */}
                  <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
                    <div className="px-4 py-3 bg-[#8b1c1c] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-white text-[#8b1c1c] text-[11px] flex items-center justify-center font-extrabold shrink-0">1</span>
                      <span className="text-white font-bold text-[13px] tracking-[0.1em] uppercase">Choose Branch</span>
                    </div>
                    <div className="p-4 flex flex-col gap-3">
                      {(Object.entries(BRANCHES) as [Branch, typeof BRANCHES[Branch]][]).map(([key, b]) => (
                        <button key={key} onClick={() => selectBranch(key)}
                          className={`w-full text-left px-4 py-4 border-2 rounded-sm transition-all ${
                            branch === key
                              ? "border-[#8b1c1c] bg-[#8b1c1c]/5"
                              : "border-gray-200 hover:border-[#8b1c1c]/50 bg-white"
                          }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`text-[15px] font-extrabold ${branch === key ? "text-[#8b1c1c]" : "text-gray-800"}`}>
                                🏪 {b.name}
                              </p>
                              <p className="text-[12px] text-gray-500 mt-0.5 font-medium">{b.area}</p>
                              <p className="text-[11px] text-gray-400">{b.address}</p>
                            </div>
                            {branch === key ? (
                              <div className="w-7 h-7 rounded-full bg-[#8b1c1c] flex items-center justify-center shrink-0">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-full border-2 border-gray-200 shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* STEP 2 — Location */}
                  {branch && (
                    <div className={`border-2 rounded-sm overflow-hidden transition-colors ${
                      locPhase === "allowed" ? "border-green-400"
                      : locPhase === "denied" ? "border-red-400"
                      : locPhase === "error"  ? "border-yellow-400"
                      : "border-gray-200"
                    }`}>
                      <div className={`px-4 py-3 flex items-center gap-2 ${
                        locPhase === "allowed" ? "bg-green-600"
                        : locPhase === "denied" ? "bg-red-600"
                        : locPhase === "error"  ? "bg-yellow-500"
                        : "bg-[#8b1c1c]"
                      }`}>
                        <span className="w-6 h-6 rounded-full bg-white text-[#8b1c1c] text-[11px] flex items-center justify-center font-extrabold shrink-0">2</span>
                        <span className="text-white font-bold text-[13px] tracking-[0.1em] uppercase">Verify Location</span>
                      </div>

                      <div className="bg-white p-4">
                        {locPhase === "idle" && (
                          <>
                            <p className="text-[13px] text-gray-600 mb-4 leading-relaxed font-medium">
                              We deliver within <strong className="text-[#8b1c1c]">10 km</strong> of our <strong>{branchInfo?.name}</strong> branch. Tap below to verify.
                            </p>
                            <button onClick={checkLocation}
                              className="w-full py-4 bg-[#8b1c1c] text-white text-[14px] tracking-[0.1em] uppercase font-bold hover:bg-[#6b1414] transition-colors rounded-sm flex items-center justify-center gap-2">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                              </svg>
                              Check My Location
                            </button>
                          </>
                        )}

                        {locPhase === "checking" && (
                          <div className="flex items-center gap-3 py-3">
                            <div className="w-6 h-6 border-2 border-[#8b1c1c] border-t-transparent rounded-full animate-spin shrink-0" />
                            <p className="text-[14px] text-gray-600 font-medium">Detecting your location…</p>
                          </div>
                        )}

                        {locPhase === "allowed" && (
                          <div>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              </div>
                              <div>
                                <p className="text-[15px] font-extrabold text-green-800">You&apos;re in our zone!</p>
                                {distanceKm !== null && (
                                  <p className="text-[13px] text-green-700 font-medium">{distanceKm} km from {branchInfo?.name}</p>
                                )}
                              </div>
                            </div>
                            <button onClick={() => selectBranch(branch)}
                              className="text-[12px] text-gray-400 hover:text-[#8b1c1c] underline font-medium transition-colors">
                              ← Change branch
                            </button>
                          </div>
                        )}

                        {locPhase === "denied" && (
                          <div>
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                                </svg>
                              </div>
                              <div>
                                <p className="text-[15px] font-extrabold text-red-700">Outside delivery zone</p>
                                {distanceKm !== null && (
                                  <p className="text-[13px] text-red-600 font-medium">{distanceKm} km away — we cover 10 km</p>
                                )}
                              </div>
                            </div>
                            <button onClick={() => selectBranch(branch === "bahawalpur" ? "yazman" : "bahawalpur")}
                              className="w-full py-3.5 mb-2 border-2 border-[#8b1c1c] text-[#8b1c1c] text-[13px] font-bold uppercase tracking-wide hover:bg-[#8b1c1c] hover:text-white transition-colors rounded-sm">
                              Try {branch === "bahawalpur" ? "Yazman" : "Bahawalpur"} Branch
                            </button>
                            <a href={`tel:+92${SHOP_PHONE.slice(1)}`}
                              className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#8b1c1c] text-white text-[13px] font-bold uppercase tracking-wide hover:bg-[#6b1414] transition-colors rounded-sm">
                              📞 Call {SHOP_PHONE}
                            </a>
                          </div>
                        )}

                        {locPhase === "error" && (
                          <div>
                            <p className="text-[13px] text-yellow-800 mb-4 leading-relaxed font-medium">{locError}</p>
                            <button onClick={checkLocation}
                              className="w-full py-4 border-2 border-[#8b1c1c] text-[#8b1c1c] text-[14px] font-bold uppercase tracking-wide hover:bg-[#8b1c1c] hover:text-white transition-colors rounded-sm">
                              Try Again
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Nudge if no branch */}
                  {!branch && (
                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-sm p-5 text-center">
                      <p className="text-[14px] text-gray-400 leading-relaxed font-medium">
                        ☝️ Select a branch above to continue
                      </p>
                    </div>
                  )}

                  {/* Nudge if branch selected but location not verified */}
                  {branch && (locPhase === "idle" || locPhase === "checking" || locPhase === "error") && (
                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-sm p-5 text-center">
                      <p className="text-[14px] text-gray-400 leading-relaxed font-medium">
                        📍 Verify your location above to place an order
                      </p>
                    </div>
                  )}

                  {/* STEP 3 — Order form */}
                  {locPhase === "allowed" && (
                    <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
                      <div className="px-4 py-3 bg-[#8b1c1c] flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-white text-[#8b1c1c] text-[11px] flex items-center justify-center font-extrabold shrink-0">3</span>
                        <span className="text-white font-bold text-[13px] tracking-[0.1em] uppercase">Delivery Details</span>
                      </div>

                      <div className="p-4 sm:p-5">
                        <div className="flex items-center gap-2 mb-5 px-3 py-2.5 bg-[#8b1c1c]/8 rounded-sm">
                          <span className="text-lg">🏪</span>
                          <p className="text-[13px] font-bold text-[#8b1c1c]">{branchInfo?.name} Branch</p>
                        </div>

                        {error && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded font-medium">{error}</div>
                        )}

                        <form onSubmit={placeOrder} className="flex flex-col gap-4">
                          <Field label="Full Name"  value={name}    onChange={setName}    placeholder="Your full name" />
                          <Field label="Email"      value={email}   onChange={setEmail}   placeholder="your@email.com" type="email" required={false} />
                          <Field label="Phone"      value={phone}   onChange={setPhone}   placeholder="03xxxxxxxxx"   type="tel" />
                          <Field label="Address"    value={address} onChange={setAddress} placeholder="Full delivery address" />

                          <div className="flex flex-col gap-2">
                            <label className="text-[12px] tracking-[0.12em] uppercase font-bold text-gray-600">
                              Notes <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)}
                              placeholder="Special instructions…" rows={3}
                              className="px-4 py-3 text-[15px] sm:text-sm border-2 border-gray-200 outline-none focus:border-[#8b1c1c] bg-white text-gray-900 placeholder-gray-400 rounded-sm resize-none transition-colors" />
                          </div>

                          {/* Order summary */}
                          <div className="border-t-2 border-gray-100 pt-4 mt-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[13px] text-gray-500 font-medium">{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
                              <span className="text-[13px] text-gray-500 font-medium">Subtotal</span>
                            </div>
                            <div className="flex justify-between items-center mb-5">
                              <span className="text-[18px] font-extrabold text-gray-900">Total</span>
                              <span className="text-[22px] font-extrabold text-[#8b1c1c]">PKR {totalPrice.toLocaleString()}</span>
                            </div>

                            <button type="submit" disabled={placing}
                              className="w-full py-5 bg-[#8b1c1c] text-white text-[15px] tracking-[0.15em] uppercase font-extrabold hover:bg-[#6b1414] active:bg-[#5a1010] transition-colors disabled:opacity-60 rounded-sm shadow-md">
                              {placing ? (
                                <span className="flex items-center justify-center gap-2">
                                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Placing Order…
                                </span>
                              ) : "Place Order"}
                            </button>
                            <p className="text-[12px] text-gray-400 text-center mt-3 font-medium">
                              💵 Cash on delivery &nbsp;·&nbsp; Free delivery above Rs. 1500
                            </p>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
