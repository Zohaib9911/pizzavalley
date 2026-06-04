"use client";

import { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setEmail("");
  };

  return (
    <section style={{ backgroundColor: "#e8e3d5" }}>
      <div
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 py-12 border-b border-gray-300"
        style={{ maxWidth: "1600px", margin: "auto", padding: "48px 25px" }}
      >
        {/* Left: Heading + subtitle */}
        <div className="shrink-0">
          <h2
            className="font-playfair font-bold text-black leading-tight"
            style={{ fontSize: "clamp(26px, 3.5vw, 46px)" }}
          >
            Enter the world of Pizza Valley
          </h2>
          <p className="text-black text-base mt-2">
            News, Bakery Creation &amp; Latest events in stores.
          </p>
        </div>

        {/* Right: Form */}
        {submitted ? (
          <p className="text-[#8b1c1c] text-sm font-medium">
            Thank you for subscribing!
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row w-full md:w-auto md:min-w-[420px] gap-0"
          >
            {/* Input with mail icon */}
            <label className="flex flex-1 items-center gap-3 bg-[#f0ebe0] border border-gray-300 px-4 cursor-text">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#888"
                strokeWidth="1.8"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 7l10 7 10-7" />
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address *"
                required
                className="flex-1 py-4 text-sm bg-transparent focus:outline-none text-gray-700 placeholder-gray-500 min-w-0"
              />
            </label>
            <button
              type="submit"
              className="py-4 px-8 text-white text-sm font-medium hover:opacity-90 w-full sm:w-auto shrink-0"
              style={{ backgroundColor: "#3d3d3d" }}
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
