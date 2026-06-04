"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AnnouncementBar from "../components/AnnouncementBar";
import Header from "../components/Header";
import Footer from "../components/Footer";

/* ── Types ── */
type Phase =
  | "idle"        // initial — show "check location" CTA
  | "locating"    // GPS in progress
  | "allowed"     // within delivery zone
  | "denied"      // outside zone
  | "geo_error"   // browser denied / unavailable
  | "submitting"  // POST /api/orders in progress
  | "success";    // order placed

interface Coords { lat: number; lng: number; }
interface ItemRow { name: string; variant: string; qty: number; }

const SHOP_PHONE = "03005558706";
const VARIANTS   = ["", "Small", "Medium", "Large", "Regular", "Family"];

/* ── Icons ── */
function PinIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
function CheckCircle({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}
function XCircle({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  );
}
function PhoneIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4h6v2"/>
    </svg>
  );
}

/* ── Pulse ring animation component ── */
function PulseRing() {
  return (
    <div className="relative flex items-center justify-center w-20 h-20">
      <span className="absolute inline-flex h-full w-full rounded-full bg-[#8b1c1c] opacity-20 animate-ping"/>
      <span className="absolute inline-flex h-14 w-14 rounded-full bg-[#8b1c1c] opacity-10 animate-ping" style={{ animationDelay: "0.3s" }}/>
      <div className="relative z-10 w-14 h-14 rounded-full bg-[#8b1c1c] flex items-center justify-center shadow-lg">
        <PinIcon className="text-white w-7 h-7" />
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function OrderPage() {
  const [phase,      setPhase]      = useState<Phase>("idle");
  const [coords,     setCoords]     = useState<Coords | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [geoError,   setGeoError]   = useState("");
  const [formError,  setFormError]  = useState("");
  const [orderNum,   setOrderNum]   = useState("");

  /* Contact fields */
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [phone,   setPhone]   = useState("");
  const [address, setAddress] = useState("");
  const [notes,   setNotes]   = useState("");

  /* Dynamic item rows */
  const [rows, setRows] = useState<ItemRow[]>([
    { name: "", variant: "", qty: 1 },
  ]);

  /* Pre-fill from session */
  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setName(d.user.fullName ?? "");
          setEmail(d.user.email   ?? "");
          setPhone(d.user.phone   ?? "");
        }
      })
      .catch(() => {});
  }, []);

  /* ── Location check ── */
  const checkLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError("Your browser doesn't support geolocation. Please call us to order.");
      setPhase("geo_error");
      return;
    }
    setPhase("locating");
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });

        try {
          const res  = await fetch("/api/check-delivery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat, lng }),
          });
          const data = await res.json();
          setDistanceKm(data.distanceKm ?? null);
          setPhase(data.allowed ? "allowed" : "denied");
        } catch {
          setGeoError("Could not verify your location. Please try again.");
          setPhase("geo_error");
        }
      },
      err => {
        const msg =
          err.code === 1 ? "Location access was denied. Please allow location in your browser settings and try again."
          : err.code === 2 ? "Your location is currently unavailable. Try again or call us."
          : "Location request timed out. Please try again.";
        setGeoError(msg);
        setPhase("geo_error");
      },
      { timeout: 12000, maximumAge: 0, enableHighAccuracy: true },
    );
  }, []);

  /* ── Item row helpers ── */
  function addRow() {
    setRows(prev => [...prev, { name: "", variant: "", qty: 1 }]);
  }
  function removeRow(i: number) {
    setRows(prev => prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i));
  }
  function updateRow<K extends keyof ItemRow>(i: number, field: K, value: ItemRow[K]) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  }

  /* ── Submit order ── */
  async function submitOrder(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    const validRows = rows.filter(r => r.name.trim());
    if (!validRows.length) {
      setFormError("Please add at least one item.");
      return;
    }
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setFormError("Name, phone and delivery address are required.");
      return;
    }

    setPhase("submitting");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName:  name,
          customerEmail: email || "",
          customerPhone: phone,
          address,
          notes,
          lat: coords?.lat,
          lng: coords?.lng,
          items: validRows.map(r => ({
            productId:    "delivery-order",
            name:         r.name.trim(),
            variant:      r.variant,
            qty:          r.qty,
            price:        0,          // admin confirms pricing by phone
            categorySlug: "delivery",
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Failed to place order. Please try again.");
        setPhase("allowed");
        return;
      }
      setOrderNum(data.order.orderNumber);
      setPhase("success");
    } catch {
      setFormError("Network error. Please try again.");
      setPhase("allowed");
    }
  }

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="min-h-[70vh] bg-[#f5f0e8] py-10 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Breadcrumb */}
          <p className="text-[11px] tracking-[0.25em] uppercase text-gray-400 mb-6">
            <Link href="/" className="hover:text-[#8b1c1c]">Home</Link>&nbsp;/&nbsp;
            <span className="text-gray-600">Order Online</span>
          </p>

          {/* ── SUCCESS ── */}
          {phase === "success" && (
            <div className="bg-white border border-gray-200 rounded p-10 text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="text-green-600 w-8 h-8" />
              </div>
              <h2 className="font-playfair font-bold text-2xl text-gray-900 mb-2">Order Received!</h2>
              <p className="text-sm text-gray-600 mb-1">
                Your order <span className="font-mono font-bold text-[#8b1c1c]">{orderNum}</span> has been placed.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                We'll call you shortly on <strong>{phone}</strong> to confirm your order and total.
              </p>
              <div className="bg-[#f5f0e8] rounded p-4 mb-6 text-sm text-gray-600">
                <p className="font-semibold text-gray-700 mb-1">📞 Expect a call from us</p>
                <p>Our team will confirm your items, pricing and estimated delivery time.</p>
              </div>
              <Link href="/"
                className="inline-block px-8 py-3 bg-[#8b1c1c] text-white text-[11px] tracking-[0.2em] uppercase hover:bg-[#6b1414] transition-colors">
                Back to Home
              </Link>
            </div>
          )}

          {/* ── IDLE — check location CTA ── */}
          {phase === "idle" && (
            <div className="bg-white border border-gray-200 rounded overflow-hidden shadow-sm">
              {/* Hero band */}
              <div className="bg-[#8b1c1c] px-8 py-10 text-center text-white">
                <div className="flex justify-center mb-5">
                  <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center ring-4 ring-white/20">
                    <PinIcon className="text-white w-8 h-8" />
                  </div>
                </div>
                <h1 className="font-playfair font-bold text-2xl sm:text-3xl mb-2">
                  Delivery Order
                </h1>
                <p className="text-red-100 text-sm">
                  Pizza Valley &amp; Sweet Valley — Bahawalpur
                </p>
              </div>

              {/* Info card */}
              <div className="px-8 py-8 text-center">
                <div className="inline-flex items-center gap-2 bg-[#f5f0e8] px-4 py-2 rounded-full mb-6">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
                  <span className="text-[11px] tracking-[0.15em] uppercase font-semibold text-gray-600">
                    Delivery within 5 km · Bahawalpur
                  </span>
                </div>

                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Are we delivering to your area?
                </h2>
                <p className="text-sm text-gray-500 mb-8 leading-relaxed max-w-sm mx-auto">
                  We currently deliver within a <strong>5 km radius</strong> of our shop.
                  Click the button below to check if you're in our delivery zone.
                </p>

                <button
                  onClick={checkLocation}
                  className="w-full sm:w-auto px-10 py-4 bg-[#8b1c1c] text-white text-[11px] tracking-[0.25em] uppercase font-semibold hover:bg-[#6b1414] transition-colors rounded-sm shadow-md hover:shadow-lg">
                  📍 Check My Location
                </button>

                <p className="text-[10px] text-gray-400 mt-4">
                  Your browser will ask for location permission — we only use it to check delivery eligibility.
                </p>

                {/* Call option */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-3">Prefer to order by phone?</p>
                  <a href={`tel:+92${SHOP_PHONE.slice(1)}`}
                    className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium hover:border-[#8b1c1c] hover:text-[#8b1c1c] transition-colors rounded-sm">
                    <PhoneIcon /> Call {SHOP_PHONE}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ── LOCATING — spinner ── */}
          {phase === "locating" && (
            <div className="bg-white border border-gray-200 rounded p-12 text-center shadow-sm">
              <div className="flex justify-center mb-6">
                <PulseRing />
              </div>
              <h2 className="font-playfair font-bold text-xl text-gray-800 mb-2">Detecting your location…</h2>
              <p className="text-sm text-gray-400">Please allow location access when your browser prompts you.</p>
            </div>
          )}

          {/* ── DENIED — outside zone ── */}
          {phase === "denied" && (
            <div className="bg-white border border-gray-200 rounded overflow-hidden shadow-sm">
              <div className="bg-red-600 px-8 py-8 text-center text-white">
                <XCircle className="w-12 h-12 mx-auto mb-3 text-white/80" />
                <h2 className="font-playfair font-bold text-2xl mb-1">Outside Delivery Zone</h2>
                <p className="text-red-100 text-sm">
                  {distanceKm !== null
                    ? `You're ${distanceKm} km away from our shop.`
                    : "You're outside our delivery area."}
                </p>
              </div>

              <div className="px-8 py-8 text-center">
                <div className="bg-red-50 border border-red-100 rounded p-4 mb-6 text-sm text-red-700 leading-relaxed">
                  <p className="font-semibold mb-1">Sorry, we can't deliver to your location.</p>
                  <p>We currently deliver within a <strong>5 km radius</strong> of our Bahawalpur shop only.</p>
                </div>

                <p className="text-sm text-gray-600 font-medium mb-5">You can still order by phone — we'll see what we can do!</p>

                <a href={`tel:+92${SHOP_PHONE.slice(1)}`}
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#8b1c1c] text-white text-[11px] tracking-[0.2em] uppercase font-semibold hover:bg-[#6b1414] transition-colors rounded-sm shadow-md mb-4">
                  <PhoneIcon className="text-white" /> Call {SHOP_PHONE}
                </a>

                <div className="mt-4">
                  <button onClick={() => setPhase("idle")}
                    className="text-xs text-gray-400 hover:text-gray-600 underline">
                    ← Try a different location
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── GEO ERROR ── */}
          {phase === "geo_error" && (
            <div className="bg-white border border-gray-200 rounded p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Location Error</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{geoError}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={checkLocation}
                  className="flex-1 py-3 bg-[#8b1c1c] text-white text-[11px] tracking-[0.2em] uppercase font-semibold hover:bg-[#6b1414] transition-colors rounded-sm">
                  Try Again
                </button>
                <a href={`tel:+92${SHOP_PHONE.slice(1)}`}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 text-[11px] tracking-[0.2em] uppercase font-semibold text-center hover:border-[#8b1c1c] hover:text-[#8b1c1c] transition-colors rounded-sm flex items-center justify-center gap-2">
                  <PhoneIcon /> Call Us Instead
                </a>
              </div>
            </div>
          )}

          {/* ── ALLOWED + SUBMITTING — show order form ── */}
          {(phase === "allowed" || phase === "submitting") && (
            <div className="space-y-4">

              {/* Zone confirmed banner */}
              <div className="bg-green-50 border border-green-200 rounded px-5 py-4 flex items-center gap-3">
                <CheckCircle className="text-green-600 w-6 h-6 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    You're in our delivery zone!
                    {distanceKm !== null && (
                      <span className="font-normal text-green-700"> ({distanceKm} km from our shop)</span>
                    )}
                  </p>
                  <p className="text-xs text-green-600 mt-0.5">Fill in the form below and we'll call to confirm your order.</p>
                </div>
              </div>

              {/* Order form */}
              <form onSubmit={submitOrder} className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">

                {/* ── Section: Items ── */}
                <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                  <h2 className="text-[11px] tracking-[0.25em] uppercase font-bold text-gray-700 mb-4">
                    What would you like? <span className="text-[#8b1c1c]">*</span>
                  </h2>

                  <div className="space-y-3">
                    {rows.map((row, i) => (
                      <div key={i} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center p-3 bg-[#f5f0e8]/60 rounded border border-gray-200">
                        {/* Item name */}
                        <input
                          type="text"
                          placeholder="Item name (e.g. Nawabi Pizza)"
                          value={row.name}
                          onChange={e => updateRow(i, "name", e.target.value)}
                          className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 outline-none focus:border-[#8b1c1c] bg-white text-gray-900 placeholder-gray-400 rounded-sm"
                        />

                        {/* Variant */}
                        <select
                          value={row.variant}
                          onChange={e => updateRow(i, "variant", e.target.value)}
                          className="w-full sm:w-28 px-2 py-2 text-sm border border-gray-300 outline-none focus:border-[#8b1c1c] bg-white text-gray-700 rounded-sm cursor-pointer">
                          {VARIANTS.map(v => (
                            <option key={v} value={v}>{v || "Any Size"}</option>
                          ))}
                        </select>

                        {/* Qty */}
                        <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden shrink-0">
                          <button type="button"
                            onClick={() => updateRow(i, "qty", Math.max(1, row.qty - 1))}
                            className="px-3 py-2 text-[#8b1c1c] font-bold hover:bg-[#8b1c1c] hover:text-white transition-colors text-sm">
                            −
                          </button>
                          <span className="px-3 py-2 text-sm font-semibold min-w-[32px] text-center bg-white">{row.qty}</span>
                          <button type="button"
                            onClick={() => updateRow(i, "qty", row.qty + 1)}
                            className="px-3 py-2 text-[#8b1c1c] font-bold hover:bg-[#8b1c1c] hover:text-white transition-colors text-sm">
                            +
                          </button>
                        </div>

                        {/* Remove */}
                        <button type="button"
                          onClick={() => removeRow(i)}
                          disabled={rows.length === 1}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-20 disabled:cursor-not-allowed shrink-0">
                          <TrashIcon />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button type="button" onClick={addRow}
                    className="mt-3 flex items-center gap-1.5 text-[11px] tracking-wide text-[#8b1c1c] font-semibold uppercase hover:underline">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add Another Item
                  </button>
                </div>

                {/* ── Section: Contact & Delivery ── */}
                <div className="px-6 py-6 space-y-4">
                  <h2 className="text-[11px] tracking-[0.25em] uppercase font-bold text-gray-700 mb-2">
                    Delivery Details
                  </h2>

                  {formError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                      {formError}
                    </div>
                  )}

                  {[
                    { label: "Full Name",        value: name,    setter: setName,    type: "text",  placeholder: "Your full name",          required: true  },
                    { label: "Phone Number",      value: phone,   setter: setPhone,   type: "tel",   placeholder: "03xxxxxxxxx",             required: true  },
                    { label: "Email (optional)",  value: email,   setter: setEmail,   type: "email", placeholder: "your@email.com",          required: false },
                    { label: "Delivery Address",  value: address, setter: setAddress, type: "text",  placeholder: "House #, Street, Area",   required: true  },
                  ].map(f => (
                    <div key={f.label} className="flex flex-col gap-1">
                      <label className="text-[10px] tracking-[0.15em] uppercase font-semibold text-gray-500">
                        {f.label} {f.required && <span className="text-[#8b1c1c]">*</span>}
                      </label>
                      <input
                        type={f.type}
                        required={f.required}
                        value={f.value}
                        onChange={e => f.setter(e.target.value)}
                        placeholder={f.placeholder}
                        className="px-3 py-2.5 text-sm border border-gray-300 outline-none focus:border-[#8b1c1c] bg-white text-gray-900 placeholder-gray-400 rounded-sm"
                      />
                    </div>
                  ))}

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] tracking-[0.15em] uppercase font-semibold text-gray-500">
                      Special Instructions
                    </label>
                    <textarea
                      value={notes} onChange={e => setNotes(e.target.value)}
                      placeholder="Any special requests, allergies, landmark for delivery…"
                      rows={3}
                      className="px-3 py-2.5 text-sm border border-gray-300 outline-none focus:border-[#8b1c1c] bg-white text-gray-900 placeholder-gray-400 resize-none rounded-sm"
                    />
                  </div>
                </div>

                {/* ── Submit ── */}
                <div className="px-6 pb-6">
                  <div className="bg-[#f5f0e8] rounded p-4 mb-5 text-xs text-gray-600 leading-relaxed">
                    <p className="font-semibold text-gray-700 mb-1">📞 How this works</p>
                    <p>After you submit, our team will call you on the number above to confirm your items, total price and estimated delivery time. Payment is <strong>cash on delivery</strong>.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={phase === "submitting"}
                    className="w-full py-4 bg-[#8b1c1c] text-white text-[11px] tracking-[0.25em] uppercase font-semibold hover:bg-[#6b1414] transition-colors disabled:opacity-60 rounded-sm shadow-md">
                    {phase === "submitting" ? "Placing Order…" : "Place Delivery Order"}
                  </button>

                  <p className="text-[10px] text-gray-400 text-center mt-3">
                    Cash on delivery · We'll call to confirm · Free delivery within 5 km
                  </p>
                </div>
              </form>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
