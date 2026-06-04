"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Result {
  id: string;
  name: string;
  categorySlug: string;
  price: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  "regular-pizza":    "Regular Pizza",
  "special-pizza":    "Special Pizza",
  "burger":           "Burger",
  "sandwich":         "Sandwich",
  "roll":             "Roll",
  "wraps":            "Wraps",
  "fries":            "Fries",
  "pasta":            "Pasta",
  "sharwarma":        "Shawarma",
  "fast-food-deals":  "Deals",
  "pizza-deals":      "Pizza Deals",
  "cakes":            "Cakes",
  "customized-cakes": "Custom Cakes",
  "pastries":         "Pastries",
  "wings":            "Wings",
  "special-biscuits": "Biscuits",
};

interface Props {
  onClose: () => void;
}

export default function SearchOverlay({ onClose }: Props) {
  const router = useRouter();
  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState<Result[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [active,   setActive]   = useState(-1);
  const inputRef  = useRef<HTMLInputElement>(null);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Auto-focus input */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /* Close on Escape */
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

  /* Debounced search */
  const search = useCallback((q: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!q.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setActive(-1);
      } catch { setResults([]); }
      finally   { setLoading(false); }
    }, 250);
  }, []);

  function handleChange(v: string) {
    setQuery(v);
    search(v);
  }

  function goTo(result: Result) {
    router.push(`/product/${result.id}`);
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!results.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActive(i => Math.max(i - 1, -1)); }
    if (e.key === "Enter" && active >= 0) { e.preventDefault(); goTo(results[active]); }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Search panel — stop propagation so clicking inside doesn't close */}
      <div
        className="bg-white w-full shadow-2xl animate-fade-in-up"
        style={{ animationDuration: "0.2s" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100">
          {/* Search icon */}
          <svg className="text-gray-400 shrink-0" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pizza, burger, roll…"
            className="flex-1 text-[16px] sm:text-[15px] text-gray-900 placeholder-gray-400 outline-none bg-transparent"
          />

          {/* Loading spinner */}
          {loading && (
            <div className="w-5 h-5 border-2 border-[#8b1c1c] border-t-transparent rounded-full animate-spin shrink-0" />
          )}

          {/* Close */}
          <button onClick={onClose} className="shrink-0 p-1 text-gray-400 hover:text-gray-700 transition-colors" aria-label="Close search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Results dropdown */}
        {query.trim().length > 0 && (
          <div className="max-h-[60vh] overflow-y-auto">
            {results.length === 0 && !loading && (
              <div className="px-5 py-8 text-center text-gray-400 text-[14px]">
                No results for &ldquo;<span className="font-semibold text-gray-600">{query}</span>&rdquo;
              </div>
            )}

            {results.map((r, i) => (
              <button
                key={r.id}
                onClick={() => goTo(r)}
                className={`w-full flex items-center justify-between px-5 sm:px-6 py-4 text-left border-b border-gray-50 last:border-b-0 transition-colors ${
                  active === i ? "bg-[#8b1c1c]/6" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Pizza slice icon */}
                  <div className="w-9 h-9 rounded-full bg-[#8b1c1c]/10 flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b1c1c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 19.8h20L12 2z"/><line x1="12" y1="2" x2="2" y2="19.8"/><line x1="12" y1="2" x2="22" y2="19.8"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    {/* Highlight matching text */}
                    <p className="text-[15px] font-bold text-gray-900 leading-snug truncate">
                      {highlightMatch(r.name, query)}
                    </p>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                      {CATEGORY_LABELS[r.categorySlug] ?? r.categorySlug}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 ml-3 text-right">
                  <p className="text-[14px] font-extrabold text-[#8b1c1c]">
                    PKR {r.price.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-gray-400">starting</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Empty state hint */}
        {!query.trim() && (
          <div className="px-5 py-6 flex flex-wrap gap-2">
            <p className="w-full text-[11px] text-gray-400 tracking-wide uppercase font-semibold mb-1">Popular searches</p>
            {["Nawabi Pizza", "Burger", "Bonfire Pizza", "Wings", "Deals"].map(term => (
              <button
                key={term}
                onClick={() => handleChange(term)}
                className="px-3 py-1.5 text-[13px] border border-gray-200 rounded-full text-gray-600 hover:border-[#8b1c1c] hover:text-[#8b1c1c] transition-colors font-medium"
              >
                {term}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* Highlight the matching portion in bold */
function highlightMatch(text: string, query: string) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-100 text-gray-900 font-extrabold rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}
