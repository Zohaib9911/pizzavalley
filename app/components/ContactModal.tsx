"use client";

import { useState, useEffect } from "react";

interface Props {
  onClose: () => void;
}

export default function ContactModal({ onClose }: Props) {
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [phone,   setPhone]   = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");

  /* Close on Escape key */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* Prevent body scroll */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, phone, message }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      setSuccess(data.message);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-md shadow-2xl relative animate-in fade-in slide-in-from-bottom-4 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-playfair font-bold text-xl text-gray-900">Contact Us</h2>
            <p className="text-[11px] text-gray-400 mt-0.5 tracking-wide">We usually reply within a few hours</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {success ? (
            /* Success state */
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <p className="font-playfair font-bold text-lg text-gray-900 mb-2">Message Sent!</p>
              <p className="text-sm text-gray-500 mb-6">{success}</p>
              <button
                onClick={onClose}
                className="px-8 py-2.5 bg-[#8b1c1c] text-white text-[11px] tracking-[0.2em] uppercase font-semibold hover:bg-[#6b1414] transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                  {error}
                </div>
              )}

              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] tracking-[0.15em] uppercase font-semibold text-gray-500">
                  Full Name <span className="text-[#8b1c1c]">*</span>
                </label>
                <input
                  type="text" required value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  className="px-3 py-2.5 text-sm border border-gray-300 outline-none focus:border-[#8b1c1c] bg-white text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] tracking-[0.15em] uppercase font-semibold text-gray-500">
                  Email Address <span className="text-[#8b1c1c]">*</span>
                </label>
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="px-3 py-2.5 text-sm border border-gray-300 outline-none focus:border-[#8b1c1c] bg-white text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] tracking-[0.15em] uppercase font-semibold text-gray-500">
                  Mobile Number <span className="text-[#8b1c1c]">*</span>
                </label>
                <input
                  type="tel" required value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="03xxxxxxxxx"
                  className="px-3 py-2.5 text-sm border border-gray-300 outline-none focus:border-[#8b1c1c] bg-white text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] tracking-[0.15em] uppercase font-semibold text-gray-500">
                  How Can We Help? <span className="text-[#8b1c1c]">*</span>
                </label>
                <textarea
                  required value={message} rows={4}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Tell us what's on your mind…"
                  className="px-3 py-2.5 text-sm border border-gray-300 outline-none focus:border-[#8b1c1c] bg-white text-gray-900 placeholder-gray-400 resize-none"
                />
              </div>

              <button
                type="submit" disabled={sending}
                className="w-full py-3 bg-[#8b1c1c] text-white text-[11px] tracking-[0.2em] uppercase font-semibold hover:bg-[#6b1414] transition-colors disabled:opacity-60 mt-1"
              >
                {sending ? "Sending…" : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
