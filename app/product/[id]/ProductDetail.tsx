"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../../lib/context/CartContext";

/* ─── Types ─── */
interface Variant   { label: string; price: number; }
interface ProductItem {
  _id: string; name: string; urduName: string; description: string;
  ingredients: string; categorySlug: string; variants?: Variant[];
  price?: number; badge?: string; dealItems?: string[];
  image: string; isActive: boolean;
}
interface ReviewData {
  _id: string; userId: string; userName: string;
  rating: number; comment: string; createdAt: string;
}
interface Summary { avg: number; count: number; dist: { star: number; count: number }[]; }

/* ─── Star display ─── */
function Stars({ value, max = 5, size = 16, onClick }: {
  value: number; max?: number; size?: number;
  onClick?: (n: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div className="flex items-center gap-0.5" style={{ cursor: onClick ? "pointer" : "default" }}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.round(display);
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24"
            fill={filled ? "#e6a817" : "none"}
            stroke={filled ? "#e6a817" : "#d1d5db"}
            strokeWidth="1.5"
            onMouseEnter={() => onClick && setHovered(i + 1)}
            onMouseLeave={() => onClick && setHovered(0)}
            onClick={() => onClick?.(i + 1)}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        );
      })}
    </div>
  );
}

/* ─── Rating distribution bar ─── */
function DistBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-3 text-gray-500 shrink-0">{star}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#e6a817" stroke="#e6a817" strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div className="h-full bg-[#e6a817] rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right text-gray-400 shrink-0">{count}</span>
    </div>
  );
}

/* ─── Review card ─── */
function ReviewCard({ review, isOwn, onDelete }: {
  review: ReviewData; isOwn: boolean; onDelete: () => void;
}) {
  const date = new Date(review.createdAt).toLocaleDateString("en-PK", {
    day: "numeric", month: "short", year: "numeric",
  });
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#8b1c1c] text-white flex items-center justify-center text-sm font-bold shrink-0">
            {review.userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 flex items-center gap-1.5">
              {review.userName}
              {isOwn && <span className="text-[9px] tracking-wide bg-[#8b1c1c]/10 text-[#8b1c1c] px-1.5 py-0.5 rounded font-bold">YOU</span>}
            </p>
            <p className="text-[10px] text-gray-400">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Stars value={review.rating} size={13} />
          {isOwn && (
            <button onClick={onDelete} className="text-[10px] text-red-400 hover:text-red-600 transition-colors ml-1">
              Delete
            </button>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
    </div>
  );
}

/* ─── Reviews section ─── */
function ReviewSection({ productId }: { productId: string }) {
  const [reviews,  setReviews]  = useState<ReviewData[]>([]);
  const [summary,  setSummary]  = useState<Summary>({ avg: 0, count: 0, dist: [] });
  const [loading,  setLoading]  = useState(true);
  const [me,       setMe]       = useState<{ _id: string } | null>(null);
  const [myRating, setMyRating] = useState(0);
  const [comment,  setComment]  = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");

  /* Load reviews + check auth */
  useEffect(() => {
    const loadAll = async () => {
      const [reviewRes, meRes] = await Promise.all([
        fetch(`/api/reviews?productId=${productId}`),
        fetch("/api/auth/me"),
      ]);
      const rd = await reviewRes.json();
      const md = await meRes.json();
      setReviews(rd.reviews ?? []);
      setSummary(rd.summary ?? { avg: 0, count: 0, dist: [] });
      setMe(md.user ?? null);

      // Pre-fill if user already reviewed
      if (md.user && rd.reviews) {
        const existing = rd.reviews.find((r: ReviewData) => r.userId === md.user._id);
        if (existing) { setMyRating(existing.rating); setComment(existing.comment); }
      }
      setLoading(false);
    };
    loadAll();
  }, [productId]);

  async function submitReview() {
    if (!myRating) { setError("Please select a star rating."); return; }
    if (!comment.trim()) { setError("Please write a comment."); return; }
    setError(""); setSubmitting(true);
    try {
      const res  = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating: myRating, comment }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to submit."); return; }

      // Refresh reviews
      const rd = await fetch(`/api/reviews?productId=${productId}`).then(r => r.json());
      setReviews(rd.reviews ?? []);
      setSummary(rd.summary ?? { avg: 0, count: 0, dist: [] });
      setSuccess("Your review has been saved!");
      setTimeout(() => setSuccess(""), 3000);
    } finally { setSubmitting(false); }
  }

  async function deleteReview() {
    await fetch(`/api/reviews?productId=${productId}`, { method: "DELETE" });
    setMyRating(0); setComment("");
    const rd = await fetch(`/api/reviews?productId=${productId}`).then(r => r.json());
    setReviews(rd.reviews ?? []);
    setSummary(rd.summary ?? { avg: 0, count: 0, dist: [] });
  }

  const myReview = me ? reviews.find(r => r.userId === me._id) : undefined;

  return (
    <section className="mt-12 pt-10 border-t border-gray-200">
      <h2 className="font-playfair font-bold text-2xl text-gray-900 mb-8">Customer Reviews</h2>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <div className="w-4 h-4 border-2 border-[#8b1c1c] border-t-transparent rounded-full animate-spin" />
          Loading reviews…
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">

          {/* ── Rating summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-lg p-5 sm:p-6 shadow-sm lg:sticky lg:top-4">
              <div className="text-center mb-4">
                <p className="text-5xl font-bold text-gray-900">{summary.avg.toFixed(1)}</p>
                <Stars value={summary.avg} size={20} />
                <p className="text-xs text-gray-400 mt-1">{summary.count} review{summary.count !== 1 ? "s" : ""}</p>
              </div>
              <div className="space-y-1.5">
                {summary.dist.map(d => (
                  <DistBar key={d.star} star={d.star} count={d.count} total={summary.count} />
                ))}
              </div>
            </div>
          </div>

          {/* ── Reviews + form ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Review form */}
            {me ? (
              <div className="bg-[#f5f0e8] border border-[#e8ddd0] rounded-lg p-5">
                <h3 className="font-semibold text-sm text-gray-800 mb-4">
                  {myReview ? "Update your review" : "Write a Review"}
                </h3>

                {/* Star picker */}
                <div className="mb-4">
                  <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-gray-500 mb-2">Your Rating</p>
                  <Stars value={myRating} size={28} onClick={setMyRating} />
                  {myRating > 0 && (
                    <p className="text-[11px] text-gray-500 mt-1">
                      {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][myRating]}
                    </p>
                  )}
                </div>

                {/* Comment */}
                <div className="mb-4">
                  <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-gray-500 mb-2">Your Comment</p>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    className="w-full border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#8b1c1c] resize-none"
                    placeholder="Share your experience with this item…"
                  />
                  <p className="text-[10px] text-gray-400 text-right mt-0.5">{comment.length}/1000</p>
                </div>

                {error   && <p className="text-xs text-red-500 mb-3">{error}</p>}
                {success && <p className="text-xs text-green-600 mb-3">✓ {success}</p>}

                <div className="flex gap-2">
                  <button onClick={submitReview} disabled={submitting}
                    className="px-6 py-2.5 bg-[#8b1c1c] text-white text-[11px] tracking-[0.15em] uppercase font-semibold hover:bg-[#6b1414] transition-colors disabled:opacity-50">
                    {submitting ? "Saving…" : myReview ? "Update Review" : "Submit Review"}
                  </button>
                  {myReview && (
                    <button onClick={deleteReview}
                      className="px-4 py-2.5 border border-red-300 text-red-500 text-[11px] tracking-wide uppercase hover:bg-red-50 transition-colors">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-[#f5f0e8] border border-[#e8ddd0] rounded-lg p-5 text-center">
                <p className="text-sm text-gray-600 mb-3">Log in to leave a review</p>
                <Link href="/account"
                  className="inline-block px-6 py-2.5 bg-[#8b1c1c] text-white text-[11px] tracking-[0.15em] uppercase font-semibold hover:bg-[#6b1414] transition-colors">
                  Sign In
                </Link>
              </div>
            )}

            {/* Review list */}
            {reviews.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">
                <div className="text-4xl mb-3">💬</div>
                No reviews yet — be the first to review this item!
              </div>
            ) : (
              reviews.map(r => (
                <ReviewCard
                  key={r._id}
                  review={r}
                  isOwn={me?._id === r.userId}
                  onDelete={deleteReview}
                />
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/* ─── Main ProductDetail component ─── */
export default function ProductDetail({
  item, catName, displayImg,
}: {
  item: Record<string, unknown>;
  catName: string;
  displayImg: string;
}) {
  const p = item as unknown as ProductItem;
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [qty, setQty]                 = useState(0);
  const { addItem, setItemQty }       = useCart();

  const currentVariant = p.variants?.[selectedIdx];
  const currentPrice   = currentVariant?.price ?? p.price ?? 0;

  // Parse ingredients into list
  const ingredientList = p.ingredients
    ? p.ingredients.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)
    : [];

  function handleAdd() {
    addItem({
      id:           p._id,
      name:         p.name,
      variant:      currentVariant?.label,
      price:        currentPrice,
      categorySlug: p.categorySlug,
    });
    setQty(1);
  }
  function handleQty(delta: number) {
    const next = Math.max(0, qty + delta);
    setItemQty(p._id, currentVariant?.label, next);
    setQty(next);
  }

  return (
    <main className="min-h-[60vh] bg-[#f5f0e8] pb-28 md:pb-0">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 flex flex-wrap items-center gap-1">
            <Link href="/" className="hover:text-[#8b1c1c]">Home</Link>
            <span>/</span>
            <Link href={`/category/${p.categorySlug}`} className="hover:text-[#8b1c1c]">{catName}</Link>
            <span>/</span>
            <span className="text-gray-600 truncate max-w-[160px]">{p.name}</span>
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-0 sm:px-4 py-0 sm:py-10">

        {/* ── Hero section ── */}
        <div className="grid md:grid-cols-2 gap-0 md:gap-10 lg:gap-14 mb-0 md:mb-12">

          {/* Image — full width on mobile, no extra padding */}
          <div className="relative bg-white md:rounded-xl border-0 md:border border-gray-100 md:shadow-sm overflow-hidden w-full"
            style={{ aspectRatio: "4/3" }}>
            <Image
              src={displayImg}
              alt={p.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover sm:object-contain sm:p-6"
            />
            {p.badge && (
              <span className="absolute top-3 left-3 bg-[#f5c518] text-black text-[11px] font-extrabold px-3 py-1">
                {p.badge}
              </span>
            )}
            {!p.isActive && (
              <span className="absolute top-3 right-3 bg-gray-800/80 text-white text-[10px] px-3 py-1 rounded">
                Unavailable
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center px-4 sm:px-0 pt-5 md:pt-0">

            {/* Category */}
            <Link href={`/category/${p.categorySlug}`}
              className="text-[11px] tracking-[0.25em] uppercase text-[#8b1c1c] font-bold mb-2 hover:underline w-fit">
              {catName}
            </Link>

            {/* Name */}
            <h1 className="font-playfair font-bold text-[26px] sm:text-3xl lg:text-4xl text-gray-900 leading-tight mb-1">
              {p.name}
            </h1>
            {p.urduName && (
              <p className="text-[15px] text-gray-400 text-right mb-3" dir="rtl">{p.urduName}</p>
            )}

            {/* Description */}
            {p.description && (
              <p className="text-gray-500 text-[14px] sm:text-sm leading-relaxed mb-5">{p.description}</p>
            )}

            {/* Variants */}
            {p.variants?.length ? (
              <div className="mb-5">
                <p className="text-[11px] tracking-[0.2em] uppercase font-bold text-gray-400 mb-3">Select Size</p>
                <div className="flex flex-wrap gap-2.5">
                  {p.variants.map((v, i) => (
                    <button key={v.label} onClick={() => { setSelectedIdx(i); setQty(0); }}
                      className={`flex-1 min-w-[90px] sm:flex-none px-4 py-3 sm:py-2 text-[14px] sm:text-sm font-bold border-2 transition-all rounded-sm ${
                        selectedIdx === i
                          ? "bg-[#8b1c1c] border-[#8b1c1c] text-white shadow-sm"
                          : "bg-white border-gray-200 text-gray-700 hover:border-[#8b1c1c] hover:text-[#8b1c1c]"
                      }`}>
                      {v.label}
                      <span className={`block text-[12px] font-semibold mt-0.5 ${selectedIdx === i ? "text-red-200" : "text-gray-400"}`}>
                        PKR {v.price.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Price */}
            <div className="mb-6">
              <span className="text-[32px] sm:text-3xl font-extrabold text-[#8b1c1c]">
                PKR {currentPrice.toLocaleString()}
              </span>
              {p.variants?.length && (
                <span className="text-[13px] text-gray-400 ml-2 font-medium">per item</span>
              )}
            </div>

            {/* Add to basket — hidden on mobile (shown in sticky bar below) */}
            <div className="hidden md:block">
              {p.isActive ? (
                qty === 0 ? (
                  <button onClick={handleAdd}
                    className="w-full px-10 py-4 bg-[#8b1c1c] text-white text-[13px] tracking-[0.2em] uppercase font-bold hover:bg-[#6b1414] active:scale-95 transition-all">
                    Add to Basket
                  </button>
                ) : (
                  <div className="flex items-center border-2 border-[#8b1c1c] w-full">
                    <button onClick={() => handleQty(-1)}
                      className="flex-1 py-4 text-[#8b1c1c] font-bold text-xl hover:bg-[#8b1c1c] hover:text-white transition-colors">−</button>
                    <span className="flex-1 text-center text-lg font-bold text-gray-900">{qty}</span>
                    <button onClick={() => handleQty(+1)}
                      className="flex-1 py-4 text-[#8b1c1c] font-bold text-xl hover:bg-[#8b1c1c] hover:text-white transition-colors">+</button>
                  </div>
                )
              ) : (
                <p className="text-sm text-gray-500 italic">This item is currently not available.</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Sticky bottom bar (mobile only) ── */}
        {p.isActive && (
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-gray-100 px-4 py-3 shadow-2xl md:hidden">
            <div className="flex items-center gap-3">
              <div className="min-w-0">
                <p className="text-[12px] text-gray-500 font-medium truncate">{p.name}{currentVariant ? ` · ${currentVariant.label}` : ""}</p>
                <p className="text-[18px] font-extrabold text-[#8b1c1c] leading-none">PKR {currentPrice.toLocaleString()}</p>
              </div>
              {qty === 0 ? (
                <button onClick={handleAdd}
                  className="ml-auto shrink-0 px-8 py-4 bg-[#8b1c1c] text-white text-[14px] tracking-[0.1em] uppercase font-extrabold hover:bg-[#6b1414] active:bg-[#5a1010] transition-colors rounded-sm">
                  Add to Basket
                </button>
              ) : (
                <div className="ml-auto shrink-0 flex items-center border-2 border-[#8b1c1c] rounded-sm overflow-hidden">
                  <button onClick={() => handleQty(-1)}
                    className="w-12 h-12 text-[#8b1c1c] font-bold text-xl hover:bg-[#8b1c1c] hover:text-white transition-colors">−</button>
                  <span className="w-10 text-center text-[16px] font-bold text-gray-900">{qty}</span>
                  <button onClick={() => handleQty(+1)}
                    className="w-12 h-12 text-[#8b1c1c] font-bold text-xl hover:bg-[#8b1c1c] hover:text-white transition-colors">+</button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="px-4 sm:px-0">

        {/* ── Info cards row ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8 mt-6 sm:mt-0">

          {/* Description */}
          {p.description && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-[10px] tracking-[0.25em] uppercase font-bold text-gray-400 mb-3 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                </svg>
                Description
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">{p.description}</p>
            </div>
          )}

          {/* Ingredients */}
          {ingredientList.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-[10px] tracking-[0.25em] uppercase font-bold text-gray-400 mb-3 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 0 1 10 10c0 5-4 9-9 10a10 10 0 0 1-1 0 10 10 0 0 1-10-10A10 10 0 0 1 12 2z"/>
                  <path d="M12 8v4l3 3"/>
                </svg>
                Ingredients
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {ingredientList.map((ing, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-[#f5f0e8] border border-[#e8ddd0] px-2.5 py-1 text-xs text-gray-700 rounded-full">
                    <span className="text-[#8b1c1c]">•</span> {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Deal items */}
          {p.dealItems?.length ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-[10px] tracking-[0.25em] uppercase font-bold text-gray-400 mb-3 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/>
                  <line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
                  <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
                </svg>
                Deal Includes
              </h2>
              <ul className="space-y-1.5">
                {p.dealItems.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-[#8b1c1c] font-bold mt-px shrink-0">›</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {/* ── Reviews ── */}
        <ReviewSection productId={p._id} />
        </div>{/* end px-4 wrapper */}
      </div>
    </main>
  );
}
