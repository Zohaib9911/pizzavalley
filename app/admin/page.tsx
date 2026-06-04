"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { categories } from "../data/categories";
import { categoryImages } from "../data/products";

/* ─────────────────────────── Types ─────────────────────────── */
interface User {
  _id: string; fullName: string; email: string;
  phone?: string; isAdmin: boolean; isBanned: boolean; createdAt: string;
}
interface OrderItem { name: string; variant?: string; qty: number; price: number; }
interface Order {
  _id: string; orderNumber: string; customerName: string; customerEmail: string;
  customerPhone: string; address: string; items: OrderItem[];
  subtotal: number; status: string; notes?: string; createdAt: string;
  branch?: "bahawalpur" | "yazman";
}
interface Variant { label: string; price: number; }
interface MenuItem {
  _id: string; name: string; urduName: string; description: string;
  ingredients: string; categorySlug: string; variants?: Variant[]; price?: number;
  badge: string; dealItems: string[]; image: string;
  isActive: boolean; sortOrder: number; createdAt: string;
}
interface Stats {
  totalUsers: number; totalOrders: number; totalRevenue: number;
  totalMenuItems: number; statusCounts: Record<string, number>;
}
interface ReviewProduct { name: string; categorySlug: string; image: string; badge: string; }
interface ReviewRow {
  _id: string; productId: string; userId: string; userName: string;
  rating: number; comment: string; createdAt: string;
  product: ReviewProduct | null;
}
interface ContactRow {
  _id: string; name: string; email: string; phone: string;
  message: string; read: boolean; createdAt: string;
}

type ConfirmTarget =
  | { kind: "user";    user: User }
  | { kind: "order";   order: Order }
  | { kind: "item";    item: MenuItem }
  | { kind: "review";  review: ReviewRow }
  | { kind: "contact"; contact: ContactRow };

/* ─────────────────────────── Helpers ─────────────────────────── */
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800", confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-orange-100 text-orange-800", out_for_delivery: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",  cancelled: "bg-red-100 text-red-800",
};
const STATUS_LABELS: Record<string, string> = {
  pending: "Pending", confirmed: "Confirmed", preparing: "Preparing",
  out_for_delivery: "Out for Delivery", delivered: "Delivered", cancelled: "Cancelled",
};
const CAT_MAP = Object.fromEntries(categories.map(c => [c.slug, c.name]));

function StarRow({ value, size = 12 }: { value: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i < Math.round(value) ? "#e6a817" : "none"}
          stroke={i < Math.round(value) ? "#e6a817" : "#d1d5db"}
          strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

function Badge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
function BranchPill({ branch }: { branch?: "bahawalpur" | "yazman" }) {
  if (!branch) return null;
  const isYazman = branch === "yazman";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${isYazman ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"}`}>
      {isYazman ? "Yazman" : "Bahawalpur"}
    </span>
  );
}
function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-gray-200 p-5 rounded">
      <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

/* ─────────────────────── Confirm Modal ─────────────────────── */
function ConfirmModal({ target, onConfirm, onCancel }:
  { target: ConfirmTarget; onConfirm: () => void; onCancel: () => void }) {
  const isOrder   = target.kind === "order";
  const isItem    = target.kind === "item";
  const isReview  = target.kind === "review";
  const isContact = target.kind === "contact";
  const title    = isOrder ? "Delete Order?" : isItem ? "Delete Item?" : isReview ? "Delete Comment?" : isContact ? "Delete Message?" : "Remove User?";
  const btnLabel = isOrder ? "Yes, Delete Order" : isItem ? "Yes, Delete Item" : isReview ? "Yes, Delete Comment" : isContact ? "Yes, Delete Message" : "Yes, Remove";
  const detail = isOrder ? (
    <><p className="text-sm font-semibold text-gray-800">{target.order.orderNumber}</p>
      <p className="text-xs text-gray-500">{target.order.customerName} · {target.order.customerPhone}</p></>
  ) : isItem ? (
    <><p className="text-sm font-semibold text-gray-800">{target.item.name}</p>
      <p className="text-xs text-gray-500">{CAT_MAP[target.item.categorySlug] ?? target.item.categorySlug}</p></>
  ) : isReview ? (
    <><p className="text-sm font-semibold text-gray-800">{target.review.userName}</p>
      <p className="text-xs text-gray-500 line-clamp-2">&ldquo;{target.review.comment}&rdquo;</p></>
  ) : isContact ? (
    <><p className="text-sm font-semibold text-gray-800">{target.contact.name}</p>
      <p className="text-xs text-gray-500 line-clamp-2">{target.contact.email} · {target.contact.phone}</p></>
  ) : (
    <><p className="text-sm font-semibold text-gray-800">{target.user.fullName}</p>
      <p className="text-xs text-gray-500">{target.user.email}</p></>
  );
  const warning = isOrder
    ? "Permanently deleting this order will remove it from the system and it will no longer appear in the customer's order history."
    : isItem
    ? "Permanently deleting this item will remove it from your menu and all category pages."
    : isReview
    ? "This comment will be permanently removed from the product page and cannot be recovered."
    : isContact
    ? "This contact message will be permanently deleted."
    : "Permanently deleting this user will remove all their account data.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{title}</p>
            <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded p-3 mb-4 border border-gray-200">{detail}</div>
        <p className="text-xs text-gray-500 mb-5 leading-relaxed">{warning}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 text-[11px] tracking-wide uppercase font-semibold border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 text-[11px] tracking-wide uppercase font-semibold bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
            {btnLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Item Modal (create / edit) ─────────────────────── */
const EMPTY_ITEM: Omit<MenuItem, "_id" | "createdAt"> = {
  name: "", urduName: "", description: "", ingredients: "",
  categorySlug: categories[0]?.slug ?? "",
  variants: undefined, price: undefined, badge: "", dealItems: [],
  image: "", isActive: true, sortOrder: 0,
};

function ItemModal({ item, onSave, onClose }:
  { item: MenuItem | null; onSave: (data: Partial<MenuItem>) => Promise<void>; onClose: () => void }) {

  const isNew = !item;
  const [form, setForm]           = useState({ ...(item ?? EMPTY_ITEM) });
  const [pricingMode, setPricingMode] = useState<"single" | "variants">(
    item?.variants?.length ? "variants" : "single"
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function set(key: keyof typeof form, val: unknown) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  /* ── image upload ── */
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      set("image", data.url);
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  /* ── variants ── */
  function addVariant() {
    set("variants", [...(form.variants ?? []), { label: "", price: 0 }]);
  }
  function removeVariant(i: number) {
    set("variants", (form.variants ?? []).filter((_, idx) => idx !== i));
  }
  function setVariant(i: number, key: "label" | "price", val: string | number) {
    const next = [...(form.variants ?? [])];
    next[i] = { ...next[i], [key]: val };
    set("variants", next);
  }

  /* ── deal items ── */
  function addDealItem() { set("dealItems", [...(form.dealItems ?? []), ""]); }
  function removeDealItem(i: number) { set("dealItems", (form.dealItems ?? []).filter((_, idx) => idx !== i)); }
  function setDealItem(i: number, val: string) {
    const next = [...(form.dealItems ?? [])]; next[i] = val; set("dealItems", next);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.categorySlug) return;
    setSaving(true);
    const payload: Partial<MenuItem> = {
      ...form,
      variants:  pricingMode === "variants" ? (form.variants ?? []).filter(v => v.label) : undefined,
      price:     pricingMode === "single"   ? (form.price ?? 0) : undefined,
      dealItems: (form.dealItems ?? []).filter(Boolean),
    };
    await onSave(payload);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:px-4 sm:py-6 overflow-y-auto">
      <div className="bg-white sm:rounded-lg shadow-2xl w-full sm:max-w-2xl sm:my-auto max-h-[95dvh] sm:max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-playfair font-bold text-lg text-gray-900">
            {isNew ? "New Menu Item" : `Edit: ${item.name}`}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto overscroll-contain">

          {/* Image */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase font-bold text-gray-500 mb-2">Item Image</label>
            <div className="flex items-start gap-4">
              <div className="w-28 h-28 rounded border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-[#f5f0e8] shrink-0">
                {form.image ? (
                  <Image src={form.image} alt="preview" width={112} height={112} className="object-contain w-full h-full p-2" />
                ) : (
                  <div className="text-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" className="mx-auto mb-1">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <p className="text-[9px] text-gray-400">No image</p>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full py-2 border border-gray-300 text-[11px] tracking-wide text-gray-600 hover:border-[#8b1c1c] hover:text-[#8b1c1c] transition-colors disabled:opacity-50">
                  {uploading ? "Uploading…" : "Choose Image"}
                </button>
                {form.image && (
                  <button onClick={() => set("image", "")} className="mt-1.5 text-[10px] text-red-500 hover:underline">
                    Remove image
                  </button>
                )}
                {uploadErr && <p className="mt-1 text-[10px] text-red-500">{uploadErr}</p>}
                <p className="mt-1.5 text-[9px] text-gray-400">Uploaded to Cloudinary. Max 5MB. PNG / JPG / WebP.</p>
              </div>
            </div>
          </div>

          {/* Name + Urdu name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase font-bold text-gray-500 mb-1.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input value={form.name} onChange={e => set("name", e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#8b1c1c]" placeholder="e.g. Nawabi Pizza" />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase font-bold text-gray-500 mb-1.5">Urdu Name</label>
              <input value={form.urduName} onChange={e => set("urduName", e.target.value)} dir="rtl"
                className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#8b1c1c]" placeholder="نوابی پیزا" />
            </div>
          </div>

          {/* Category + Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase font-bold text-gray-500 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select value={form.categorySlug} onChange={e => set("categorySlug", e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#8b1c1c] bg-white">
                {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase font-bold text-gray-500 mb-1.5">Badge</label>
              <input value={form.badge} onChange={e => set("badge", e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#8b1c1c]" placeholder="e.g. Deal 01" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase font-bold text-gray-500 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={2}
              className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#8b1c1c] resize-none" placeholder="Short item description…" />
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase font-bold text-gray-500 mb-1.5">
              Ingredients
              <span className="ml-1 font-normal text-gray-400 normal-case tracking-normal">(comma or line separated)</span>
            </label>
            <textarea value={form.ingredients} onChange={e => set("ingredients", e.target.value)} rows={2}
              className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#8b1c1c] resize-none"
              placeholder="Mozzarella, Tomato Sauce, Chicken, Bell Peppers…" />
          </div>

          {/* Pricing mode */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase font-bold text-gray-500 mb-2">Pricing</label>
            <div className="flex gap-2 mb-3">
              {(["single", "variants"] as const).map(m => (
                <button key={m} onClick={() => setPricingMode(m)}
                  className={`px-3 py-1.5 text-[11px] tracking-wide border transition-colors ${pricingMode === m ? "bg-[#8b1c1c] text-white border-[#8b1c1c]" : "border-gray-300 text-gray-600 hover:border-[#8b1c1c]"}`}>
                  {m === "single" ? "Single Price" : "Size Variants"}
                </button>
              ))}
            </div>

            {pricingMode === "single" && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 shrink-0">PKR</span>
                <input type="number" min={0} value={form.price ?? ""} onChange={e => set("price", Number(e.target.value))}
                  className="w-36 border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#8b1c1c]" placeholder="0" />
              </div>
            )}

            {pricingMode === "variants" && (
              <div className="space-y-2">
                {(form.variants ?? []).map((v, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input value={v.label} onChange={e => setVariant(i, "label", e.target.value)}
                      className="flex-1 border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-[#8b1c1c]" placeholder="Size (e.g. Small)" />
                    <span className="text-xs text-gray-400 shrink-0">PKR</span>
                    <input type="number" min={0} value={v.price} onChange={e => setVariant(i, "price", Number(e.target.value))}
                      className="w-28 border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-[#8b1c1c]" />
                    <button onClick={() => removeVariant(i)} className="text-red-400 hover:text-red-600 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ))}
                <button onClick={addVariant} className="text-[11px] text-[#8b1c1c] hover:underline flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add size variant
                </button>
              </div>
            )}
          </div>

          {/* Deal items */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase font-bold text-gray-500 mb-2">Deal Items</label>
            <div className="space-y-2">
              {(form.dealItems ?? []).map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={item} onChange={e => setDealItem(i, e.target.value)}
                    className="flex-1 border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-[#8b1c1c]" placeholder="e.g. 1 Zinger Burger" />
                  <button onClick={() => removeDealItem(i)} className="text-red-400 hover:text-red-600">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
              <button onClick={addDealItem} className="text-[11px] text-[#8b1c1c] hover:underline flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add deal item
              </button>
            </div>
          </div>

          {/* Sort order + Active */}
          <div className="flex items-center gap-6">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase font-bold text-gray-500 mb-1.5">Sort Order</label>
              <input type="number" min={0} value={form.sortOrder} onChange={e => set("sortOrder", Number(e.target.value))}
                className="w-24 border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#8b1c1c]" />
            </div>
            <label className="flex items-center gap-2 mt-5 cursor-pointer select-none">
              <input type="checkbox" checked={form.isActive} onChange={e => set("isActive", e.target.checked)} className="w-4 h-4 accent-[#8b1c1c]" />
              <span className="text-sm text-gray-700">Active (visible on site)</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-[11px] tracking-wide uppercase font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !form.name.trim()}
            className="px-6 py-2.5 text-[11px] tracking-wide uppercase font-semibold bg-[#8b1c1c] text-white hover:bg-[#6b1414] transition-colors disabled:opacity-50">
            {saving ? "Saving…" : isNew ? "Create Item" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Main Page ─────────────────────────── */
export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab]           = useState<"overview" | "orders" | "users" | "items" | "reviews" | "contacts">("overview");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [stats, setStats]       = useState<Stats | null>(null);
  const [users, setUsers]       = useState<User[]>([]);
  const [orders, setOrders]     = useState<Order[]>([]);
  const [menuItems, setMenuItems]         = useState<MenuItem[]>([]);
  const [itemsLoaded, setItemsLoaded]     = useState(false);
  const [itemCatFilter, setItemCatFilter] = useState("all");
  const [reviews, setReviews]             = useState<ReviewRow[]>([]);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [reviewStats, setReviewStats]     = useState({ totalCount: 0, avgRating: 0 });
  const [reviewSearch, setReviewSearch]   = useState("");
  const [contacts, setContacts]           = useState<ContactRow[]>([]);
  const [contactsLoaded, setContactsLoaded] = useState(false);
  const [updatingId, setUpdatingId]       = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null);
  const [editingItem, setEditingItem]     = useState<MenuItem | null | "new">(null);
  const [actionMsg, setActionMsg]         = useState("");
  const [seeding, setSeeding]             = useState(false);

  /* ── load dashboard ── */
  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then(r => {
        if (r.status === 401) { router.push("/account"); return null; }
        if (r.status === 403) { setError("Access denied — admin only."); return null; }
        return r.json();
      })
      .then(d => {
        if (!d) return;
        setStats(d.stats); setUsers(d.users); setOrders(d.orders);
      })
      .catch(() => setError("Failed to load dashboard."))
      .finally(() => setLoading(false));
  }, [router]);

  /* ── load menu items when tab opens ── */
  useEffect(() => {
    if (tab !== "items" || itemsLoaded) return;
    fetch("/api/admin/menu")
      .then(r => r.json())
      .then(d => { if (d.items) setMenuItems(d.items); setItemsLoaded(true); })
      .catch(() => flash("Failed to load items."));
  }, [tab, itemsLoaded]);

  /* ── load reviews when tab opens ── */
  useEffect(() => {
    if (tab !== "reviews" || reviewsLoaded) return;
    fetch("/api/admin/reviews")
      .then(r => r.json())
      .then(d => {
        setReviews(d.reviews ?? []);
        setReviewStats({ totalCount: d.totalCount ?? 0, avgRating: d.avgRating ?? 0 });
        setReviewsLoaded(true);
      })
      .catch(() => flash("Failed to load reviews."));
  }, [tab, reviewsLoaded]);

  /* ── load contacts when tab opens ── */
  useEffect(() => {
    if (tab !== "contacts" || contactsLoaded) return;
    fetch("/api/admin/contacts")
      .then(r => r.json())
      .then(data => { setContacts(data.contacts ?? []); setContactsLoaded(true); })
      .catch(() => flash("Failed to load contacts."));
  }, [tab, contactsLoaded]);

  function flash(msg: string) { setActionMsg(msg); setTimeout(() => setActionMsg(""), 3500); }

  /* ── status update ── */
  async function updateStatus(orderId: string, status: string) {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: data.order.status } : o));
    } finally { setUpdatingId(null); }
  }

  /* ── user actions ── */
  async function toggleAdmin(userId: string, isAdmin: boolean) {
    const res = await fetch("/api/admin/users", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isAdmin }),
    });
    const data = await res.json();
    if (res.ok) { setUsers(prev => prev.map(u => u._id === userId ? { ...u, isAdmin } : u)); flash(data.message); }
    else flash(data.error ?? "Failed.");
  }
  async function toggleBan(userId: string, isBanned: boolean) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isBanned }),
    });
    const data = await res.json();
    if (res.ok) { setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBanned } : u)); flash(data.message); }
    else flash(data.error ?? "Failed.");
  }
  async function deleteUser(userId: string) {
    const res = await fetch("/api/admin/users", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    setConfirmTarget(null);
    if (res.ok) { setUsers(prev => prev.filter(u => u._id !== userId)); flash(data.message); }
    else flash(data.error ?? "Failed to delete user.");
  }

  /* ── order delete ── */
  async function deleteOrder(orderId: string) {
    const res = await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" });
    const data = await res.json();
    setConfirmTarget(null);
    if (res.ok) { setOrders(prev => prev.filter(o => o._id !== orderId)); flash(data.message); }
    else flash(data.error ?? "Failed to delete order.");
  }

  /* ── menu item save (create / update) ── */
  async function saveItem(payload: Partial<MenuItem>) {
    const isNew = editingItem === "new";
    const url   = isNew ? "/api/admin/menu" : `/api/admin/menu/${(editingItem as MenuItem)._id}`;
    const method = isNew ? "POST" : "PATCH";

    const res  = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();

    if (res.ok) {
      if (isNew) {
        setMenuItems(prev => [...prev, data.item]);
        if (stats) setStats({ ...stats, totalMenuItems: stats.totalMenuItems + 1 });
      } else {
        setMenuItems(prev => prev.map(i => i._id === data.item._id ? data.item : i));
      }
      flash(isNew ? `"${data.item.name}" created!` : `"${data.item.name}" updated!`);
      setEditingItem(null);
    } else {
      flash(data.error ?? "Failed to save item.");
    }
  }

  /* ── menu item delete ── */
  async function deleteItem(itemId: string) {
    const res  = await fetch(`/api/admin/menu/${itemId}`, { method: "DELETE" });
    const data = await res.json();
    setConfirmTarget(null);
    if (res.ok) {
      setMenuItems(prev => prev.filter(i => i._id !== itemId));
      if (stats) setStats({ ...stats, totalMenuItems: stats.totalMenuItems - 1 });
      flash(data.message);
    } else flash(data.error ?? "Failed.");
  }

  /* ── review delete ── */
  async function deleteReview(reviewId: string) {
    const res  = await fetch(`/api/admin/reviews?id=${reviewId}`, { method: "DELETE" });
    const data = await res.json();
    setConfirmTarget(null);
    if (res.ok) {
      setReviews(prev => prev.filter(r => r._id !== reviewId));
      setReviewStats(prev => ({ ...prev, totalCount: prev.totalCount - 1 }));
      flash(data.message);
    } else flash(data.error ?? "Failed to delete review.");
  }

  /* ── contact delete ── */
  async function deleteContact(contactId: string) {
    const res  = await fetch("/api/admin/contacts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: contactId }),
    });
    const data = await res.json();
    setConfirmTarget(null);
    if (res.ok) {
      setContacts(prev => prev.filter(c => c._id !== contactId));
      flash("Message deleted.");
    } else flash(data.error ?? "Failed to delete message.");
  }

  /* ── contact mark read ── */
  async function markContactRead(contactId: string, read: boolean) {
    await fetch("/api/admin/contacts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: contactId, read }),
    });
    setContacts(prev => prev.map(c => c._id === contactId ? { ...c, read } : c));
  }

  /* ── seed ── */
  async function seedItems() {
    setSeeding(true);
    try {
      const res  = await fetch("/api/admin/menu/seed", { method: "POST" });
      const data = await res.json();
      flash(data.message ?? "Seeded!");
      setItemsLoaded(false); // reload
    } finally { setSeeding(false); }
  }

  function handleConfirm() {
    if (!confirmTarget) return;
    if (confirmTarget.kind === "user")   deleteUser(confirmTarget.user._id);
    if (confirmTarget.kind === "order")  deleteOrder(confirmTarget.order._id);
    if (confirmTarget.kind === "item")   deleteItem(confirmTarget.item._id);
    if (confirmTarget.kind === "review")  deleteReview(confirmTarget.review._id);
    if (confirmTarget.kind === "contact") deleteContact(confirmTarget.contact._id);
  }

  /* ─── render guards ─── */
  if (loading) return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
      <p className="text-gray-400 animate-pulse">Loading dashboard…</p>
    </div>
  );
  if (error) return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/" className="text-[#8b1c1c] underline text-sm">← Back to site</Link>
      </div>
    </div>
  );

  const bannedCount    = users.filter(u => u.isBanned).length;
  const filteredItems  = itemCatFilter === "all" ? menuItems : menuItems.filter(i => i.categorySlug === itemCatFilter);
  const unreadContacts = contacts.filter(c => !c.read).length;

  const tabs = [
    { id: "overview",  label: "Overview" },
    { id: "orders",    label: `Orders (${orders.length})` },
    { id: "users",     label: `Users (${users.length})` },
    { id: "items",     label: `Items (${stats?.totalMenuItems ?? menuItems.length})` },
    { id: "reviews",   label: `Reviews${reviewsLoaded ? ` (${reviewStats.totalCount})` : ""}` },
    { id: "contacts",  label: `Messages${contactsLoaded ? ` (${contacts.length})` : ""}${unreadContacts > 0 ? ` • ${unreadContacts} new` : ""}` },
  ] as const;

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Modals */}
      {confirmTarget && <ConfirmModal target={confirmTarget} onConfirm={handleConfirm} onCancel={() => setConfirmTarget(null)} />}
      {editingItem !== null && (
        <ItemModal
          item={editingItem === "new" ? null : editingItem}
          onSave={saveItem}
          onClose={() => setEditingItem(null)}
        />
      )}

      {/* Top bar */}
      <header className="bg-[#8b1c1c] text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2 min-w-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span className="font-playfair font-bold text-base sm:text-lg truncate">Admin Dashboard</span>
          <span className="hidden sm:inline text-[10px] tracking-widest uppercase text-red-200 shrink-0">· Pizza Valley</span>
        </div>
        <Link href="/" className="text-[11px] tracking-wide text-red-200 hover:text-white flex items-center gap-1 shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
          <span className="hidden xs:inline">Back to site</span>
          <span className="xs:hidden">← Home</span>
        </Link>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5 sm:py-8">

        {/* Flash */}
        {actionMsg && (
          <div className="mb-4 px-4 py-3 bg-white border border-gray-200 rounded text-sm text-gray-700 shadow-sm flex items-center gap-2">
            <span className="text-green-500">✓</span> {actionMsg}
          </div>
        )}

        {/* Tabs — horizontally scrollable on mobile */}
        <div className="overflow-x-auto -mx-4 px-4 mb-8">
          <div className="flex gap-0.5 border-b border-gray-300 min-w-max">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-3 sm:px-5 py-2.5 sm:py-3 text-[10px] sm:text-[11px] tracking-[0.1em] sm:tracking-[0.15em] uppercase font-semibold transition-colors -mb-px whitespace-nowrap ${
                  tab === t.id ? "border-b-2 border-[#8b1c1c] text-[#8b1c1c]" : "text-gray-500 hover:text-gray-700"
                }`}>
                {t.label}
                {t.id === "users" && bannedCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-[8px] font-bold">{bannedCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Users"    value={stats.totalUsers} />
              <StatCard label="Total Orders"   value={stats.totalOrders} />
              <StatCard label="Revenue"        value={`PKR ${stats.totalRevenue.toLocaleString()}`} sub="Excluding cancelled" />
              <StatCard label="Menu Items"     value={stats.totalMenuItems} sub="In database" />
            </div>
            <div className="bg-white border border-gray-200 p-6 rounded">
              <h3 className="text-[11px] tracking-[0.2em] uppercase font-bold text-gray-500 mb-4">Orders by Status</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.entries(STATUS_LABELS).map(([s, label]) => (
                  <div key={s} className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-xl font-bold text-gray-900">{stats.statusCounts[s] ?? 0}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-[11px] tracking-[0.2em] uppercase font-bold text-gray-500">Recent Orders</h3>
                <button onClick={() => setTab("orders")} className="text-[11px] text-[#8b1c1c] hover:underline">View all →</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-100 text-[10px] tracking-[0.15em] uppercase text-gray-400">
                    <th className="px-4 py-3 text-left">Order</th>
                    <th className="px-4 py-3 text-left">Branch</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Date</th>
                  </tr></thead>
                  <tbody>
                    {orders.slice(0, 5).map(o => (
                      <tr key={o._id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono font-semibold text-xs text-[#8b1c1c]">{o.orderNumber}</td>
                        <td className="px-4 py-3"><BranchPill branch={o.branch} /></td>
                        <td className="px-4 py-3"><p className="font-medium">{o.customerName}</p><p className="text-xs text-gray-400">{o.customerPhone}</p></td>
                        <td className="px-4 py-3 font-semibold">PKR {o.subtotal.toLocaleString()}</td>
                        <td className="px-4 py-3"><Badge status={o.status} /></td>
                        <td className="px-4 py-3 text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString("en-PK")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === "orders" && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white border border-gray-200 p-12 text-center text-gray-400 text-sm rounded">No orders yet.</div>
            ) : orders.map(o => (
              <div key={o._id} className="bg-white border border-gray-200 rounded overflow-hidden">
                <div className="px-4 sm:px-5 py-4 border-b border-gray-100">
                  {/* Top row: order number + amount + status controls */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-mono font-bold text-[#8b1c1c] text-sm">{o.orderNumber}</p>
                        <BranchPill branch={o.branch} />
                        <Badge status={o.status} />
                      </div>
                      <p className="text-[10px] text-gray-400">{new Date(o.createdAt).toLocaleString("en-PK")}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <p className="font-bold text-sm text-gray-900">PKR {o.subtotal.toLocaleString()}</p>
                      <select value={o.status} disabled={updatingId === o._id}
                        onChange={e => updateStatus(o._id, e.target.value)}
                        className="text-[11px] border border-gray-300 px-2 py-1.5 outline-none focus:border-[#8b1c1c] bg-white cursor-pointer disabled:opacity-50 max-w-[140px]">
                        {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  {/* Bottom row: customer + address + delete */}
                  <div className="flex flex-wrap justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900">{o.customerName}</p>
                      <p className="text-xs text-gray-500">{o.customerPhone}</p>
                      {o.customerEmail && <p className="text-xs text-gray-400 truncate max-w-[200px]">{o.customerEmail}</p>}
                      <p className="text-xs text-gray-600 mt-1">📍 {o.address}</p>
                      {o.notes && <p className="text-xs text-gray-400 italic mt-0.5">"{o.notes}"</p>}
                    </div>
                    <button onClick={() => setConfirmTarget({ kind: "order", order: o })}
                      className="self-end text-[10px] px-2.5 py-1 border border-red-300 text-red-500 rounded hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors flex items-center gap-1 shrink-0">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M9 6V4h6v2"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
                <div className="px-5 py-3">
                  <div className="flex flex-wrap gap-2">
                    {o.items.map((item, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 px-3 py-1 text-xs rounded-full">
                        <span className="font-semibold">{item.qty}×</span> {item.name}
                        {item.variant && <span className="text-gray-400">({item.variant})</span>}
                        <span className="text-[#8b1c1c] font-semibold ml-1">PKR {(item.price * item.qty).toLocaleString()}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── USERS ── */}
        {tab === "users" && (
          <div className="bg-white border border-gray-200 rounded overflow-hidden">
            {bannedCount > 0 && (
              <div className="px-5 py-3 bg-orange-50 border-b border-orange-100 flex items-center gap-2 text-xs text-orange-700">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <strong>{bannedCount} flagged user{bannedCount > 1 ? "s" : ""}</strong> — these accounts have been marked as bad / fraudulent.
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] tracking-[0.15em] uppercase text-gray-400 bg-gray-50">
                    <th className="px-5 py-3 text-left">#</th><th className="px-5 py-3 text-left">Name</th>
                    <th className="px-5 py-3 text-left">Email</th><th className="px-5 py-3 text-left">Phone</th>
                    <th className="px-5 py-3 text-left">Joined</th><th className="px-5 py-3 text-left">Role</th>
                    <th className="px-5 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u._id} className={`border-b border-gray-50 transition-colors ${u.isBanned ? "bg-red-50" : "hover:bg-gray-50"}`}>
                      <td className="px-5 py-3 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 ${u.isBanned ? "bg-orange-500" : "bg-[#8b1c1c]"}`}>
                            {u.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{u.fullName}</span>
                            {u.isBanned && <span className="ml-2 px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[9px] font-bold rounded">⚠ BAD USER</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600 text-xs">{u.email}</td>
                      <td className="px-5 py-3 text-gray-600 text-xs">{u.phone || "—"}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString("en-PK")}</td>
                      <td className="px-5 py-3">
                        {u.isAdmin ? <span className="px-2 py-0.5 bg-[#8b1c1c]/10 text-[#8b1c1c] text-[10px] font-bold rounded">🛡️ Admin</span>
                          : <span className="text-[10px] text-gray-400">User</span>}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button onClick={() => toggleAdmin(u._id, !u.isAdmin)}
                            className={`text-[10px] px-2.5 py-1 border rounded transition-colors ${u.isAdmin ? "border-red-300 text-red-600 hover:bg-red-50" : "border-gray-300 text-gray-600 hover:border-[#8b1c1c] hover:text-[#8b1c1c]"}`}>
                            {u.isAdmin ? "Remove Admin" : "Make Admin"}
                          </button>
                          <button onClick={() => toggleBan(u._id, !u.isBanned)}
                            className={`text-[10px] px-2.5 py-1 border rounded transition-colors ${u.isBanned ? "border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100" : "border-orange-300 text-orange-600 hover:bg-orange-50"}`}>
                            {u.isBanned ? "✓ Unflag" : "⚠ Flag Bad"}
                          </button>
                          <button onClick={() => setConfirmTarget({ kind: "user", user: u })}
                            className="text-[10px] px-2.5 py-1 border border-red-300 text-red-600 rounded hover:bg-red-600 hover:text-white transition-colors flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M9 6V4h6v2"/>
                            </svg>
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ITEMS ── */}
        {tab === "items" && (
          <div className="space-y-5">

            {/* Toolbar */}
            <div className="space-y-3">
              {/* Action buttons row */}
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] tracking-[0.15em] uppercase font-bold text-gray-500">{filteredItems.length} items</p>
                <div className="flex items-center gap-2">
                  {menuItems.length === 0 && (
                    <button onClick={seedItems} disabled={seeding}
                      className="px-3 py-1.5 text-[10px] tracking-wide uppercase font-semibold border border-[#8b1c1c] text-[#8b1c1c] hover:bg-[#8b1c1c] hover:text-white transition-colors disabled:opacity-50 flex items-center gap-1.5">
                      {seeding ? "Seeding…" : "⬇ Import Menu"}
                    </button>
                  )}
                  <button onClick={() => setEditingItem("new")}
                    className="px-3 py-1.5 text-[10px] tracking-wide uppercase font-semibold bg-[#8b1c1c] text-white hover:bg-[#6b1414] transition-colors flex items-center gap-1.5">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    New Item
                  </button>
                </div>
              </div>
              {/* Category filter — scrollable */}
              <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0 pb-1">
                <div className="flex gap-1.5 min-w-max">
                  <button onClick={() => setItemCatFilter("all")}
                    className={`px-3 py-1.5 text-[10px] tracking-wide uppercase font-semibold border transition-colors whitespace-nowrap ${itemCatFilter === "all" ? "bg-[#8b1c1c] text-white border-[#8b1c1c]" : "border-gray-300 text-gray-600 hover:border-[#8b1c1c] hover:text-[#8b1c1c]"}`}>
                    All ({menuItems.length})
                  </button>
                  {categories.map(c => {
                    const cnt = menuItems.filter(i => i.categorySlug === c.slug).length;
                    if (!cnt) return null;
                    return (
                      <button key={c.slug} onClick={() => setItemCatFilter(c.slug)}
                        className={`px-3 py-1.5 text-[10px] tracking-wide uppercase font-semibold border transition-colors whitespace-nowrap ${itemCatFilter === c.slug ? "bg-[#8b1c1c] text-white border-[#8b1c1c]" : "border-gray-300 text-gray-600 hover:border-[#8b1c1c] hover:text-[#8b1c1c]"}`}>
                        {c.name} ({cnt})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Empty state */}
            {menuItems.length === 0 && (
              <div className="bg-white border border-gray-200 rounded p-14 text-center">
                <div className="text-5xl mb-4">🍕</div>
                <h2 className="font-playfair font-bold text-xl text-gray-800 mb-2">No menu items yet</h2>
                <p className="text-sm text-gray-400 mb-6">Click &ldquo;Import Default Menu&rdquo; to load all existing products from the static file, or create items manually with the &ldquo;New Item&rdquo; button.</p>
              </div>
            )}

            {/* Items grid */}
            {filteredItems.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map(item => {
                  const fallbackImg = categoryImages[item.categorySlug] ?? "/images/pizzaa-grey-512x512_1_.png";
                  const imgSrc = item.image || fallbackImg;

                  const lowestPrice = item.variants?.length
                    ? Math.min(...item.variants.map(v => v.price))
                    : item.price ?? 0;
                  const highestPrice = item.variants?.length
                    ? Math.max(...item.variants.map(v => v.price))
                    : item.price ?? 0;
                  const priceLabel = item.variants?.length
                    ? (lowestPrice === highestPrice
                      ? `PKR ${lowestPrice.toLocaleString()}`
                      : `PKR ${lowestPrice.toLocaleString()} – ${highestPrice.toLocaleString()}`)
                    : item.price ? `PKR ${item.price.toLocaleString()}` : "Price TBD";

                  return (
                    <div key={item._id} className={`bg-white border rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow ${!item.isActive ? "opacity-60" : ""}`}>
                      {/* Image */}
                      <div className="relative bg-[#f5f0e8] aspect-square overflow-hidden">
                        <Image src={imgSrc} alt={item.name} fill sizes="300px"
                          className="object-contain p-4 transition-transform hover:scale-105" />
                        {item.badge && (
                          <span className="absolute top-2 left-2 bg-[#f5c518] text-black text-[9px] font-extrabold px-2 py-0.5">
                            {item.badge}
                          </span>
                        )}
                        {!item.isActive && (
                          <span className="absolute top-2 right-2 bg-gray-800/70 text-white text-[9px] px-2 py-0.5 rounded">
                            Hidden
                          </span>
                        )}
                        {item.image && (
                          <span className="absolute bottom-1.5 right-1.5 bg-green-500/80 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                            Cloudinary
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <div className="mb-1">
                          <p className="font-bold text-gray-900 text-sm leading-tight line-clamp-1">{item.name}</p>
                          {item.urduName && <p className="text-[10px] text-gray-400 text-right leading-none">{item.urduName}</p>}
                        </div>

                        <p className="text-[10px] tracking-wide text-[#8b1c1c]/70 uppercase mb-2">
                          {CAT_MAP[item.categorySlug] ?? item.categorySlug}
                        </p>

                        {/* Variants chips */}
                        {item.variants?.length ? (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.variants.map(v => (
                              <span key={v.label} className="inline-flex flex-col items-center bg-[#f5f0e8] px-2 py-0.5 rounded text-[9px] font-semibold text-gray-700">
                                <span>{v.label}</span>
                                <span className="text-[#8b1c1c]">PKR {v.price.toLocaleString()}</span>
                              </span>
                            ))}
                          </div>
                        ) : null}

                        {/* Price */}
                        <p className="font-bold text-[#8b1c1c] text-sm mb-2">{priceLabel}</p>

                        {/* Deal items */}
                        {item.dealItems?.length ? (
                          <div className="mb-2 space-y-0.5">
                            {item.dealItems.slice(0, 3).map((d, i) => (
                              <p key={i} className="text-[9px] text-gray-500 flex items-start gap-1">
                                <span className="text-[#8b1c1c] font-bold mt-px">›</span>{d}
                              </p>
                            ))}
                            {item.dealItems.length > 3 && <p className="text-[9px] text-gray-400">+{item.dealItems.length - 3} more…</p>}
                          </div>
                        ) : null}

                        {/* Actions */}
                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                          <button onClick={() => setEditingItem(item)}
                            className="flex-1 py-1.5 text-[10px] tracking-wide uppercase font-semibold border border-gray-300 text-gray-600 hover:border-[#8b1c1c] hover:text-[#8b1c1c] transition-colors flex items-center justify-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            Edit
                          </button>
                          <button onClick={() => setConfirmTarget({ kind: "item", item })}
                            className="flex-1 py-1.5 text-[10px] tracking-wide uppercase font-semibold border border-red-300 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors flex items-center justify-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M9 6V4h6v2"/>
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Filtered empty */}
            {filteredItems.length === 0 && menuItems.length > 0 && (
              <div className="bg-white border border-gray-200 rounded p-10 text-center text-gray-400 text-sm">
                No items in this category.
              </div>
            )}
          </div>
        )}

        {/* ── REVIEWS ── */}
        {tab === "reviews" && (
          <div className="space-y-5">

            {/* Summary bar */}
            {reviewsLoaded && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 p-5 rounded col-span-2 sm:col-span-1">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-1">Total Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{reviewStats.totalCount}</p>
                </div>
                <div className="bg-white border border-gray-200 p-5 rounded col-span-2 sm:col-span-1">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-1">Avg. Rating</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-900">{reviewStats.avgRating.toFixed(1)}</p>
                    <StarRow value={reviewStats.avgRating} size={14} />
                  </div>
                </div>
                <div className="bg-white border border-gray-200 p-5 rounded col-span-2">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-2">Filter by product or customer</p>
                  <input
                    type="text"
                    value={reviewSearch}
                    onChange={e => setReviewSearch(e.target.value)}
                    placeholder="Type product name or customer name…"
                    className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#8b1c1c]"
                  />
                </div>
              </div>
            )}

            {/* Loading */}
            {!reviewsLoaded && (
              <div className="bg-white border border-gray-200 rounded p-12 text-center">
                <div className="w-8 h-8 border-2 border-[#8b1c1c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-400 animate-pulse">Loading reviews…</p>
              </div>
            )}

            {/* Empty state */}
            {reviewsLoaded && reviews.length === 0 && (
              <div className="bg-white border border-gray-200 rounded p-14 text-center">
                <div className="text-5xl mb-4">💬</div>
                <p className="font-playfair font-bold text-xl text-gray-800 mb-2">No reviews yet</p>
                <p className="text-sm text-gray-400">Customer reviews will appear here once submitted.</p>
              </div>
            )}

            {/* Reviews table */}
            {reviewsLoaded && reviews.length > 0 && (() => {
              const q = reviewSearch.toLowerCase();
              const filtered = q
                ? reviews.filter(r =>
                    r.product?.name?.toLowerCase().includes(q) ||
                    r.userName.toLowerCase().includes(q) ||
                    r.comment.toLowerCase().includes(q)
                  )
                : reviews;

              return (
                <>
                  {filtered.length === 0 && (
                    <div className="bg-white border border-gray-200 rounded p-10 text-center text-gray-400 text-sm">
                      No reviews match &ldquo;{reviewSearch}&rdquo;.
                    </div>
                  )}

                  {/* Group by product */}
                  {(() => {
                    // Build product groups
                    const groups: Map<string, { product: ReviewProduct | null; rows: ReviewRow[] }> = new Map();
                    filtered.forEach(r => {
                      const key = r.productId;
                      if (!groups.has(key)) groups.set(key, { product: r.product, rows: [] });
                      groups.get(key)!.rows.push(r);
                    });

                    return [...groups.entries()].map(([productId, group]) => {
                      const fallbackImg = group.product
                        ? (categoryImages[group.product.categorySlug] ?? "/images/pizzaa-grey-512x512_1_.png")
                        : "/images/pizzaa-grey-512x512_1_.png";
                      const imgSrc = group.product?.image || fallbackImg;
                      const avgG   = group.rows.reduce((s, r) => s + r.rating, 0) / group.rows.length;

                      return (
                        <div key={productId} className="bg-white border border-gray-200 rounded overflow-hidden">
                          {/* Product header */}
                          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50">
                            <div className="w-14 h-14 rounded border border-gray-200 bg-[#f5f0e8] overflow-hidden shrink-0 relative">
                              <Image src={imgSrc} alt={group.product?.name ?? "Product"}
                                fill sizes="56px" className="object-contain p-1" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-bold text-gray-900 text-sm truncate">
                                  {group.product?.name ?? <span className="text-gray-400 italic">Deleted product</span>}
                                </p>
                                {group.product?.badge && (
                                  <span className="text-[9px] bg-[#f5c518] text-black font-bold px-1.5 py-0.5">{group.product.badge}</span>
                                )}
                              </div>
                              {group.product && (
                                <p className="text-[10px] text-[#8b1c1c] uppercase tracking-wide mt-0.5">
                                  {CAT_MAP[group.product.categorySlug] ?? group.product.categorySlug}
                                </p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <div className="flex items-center gap-1.5 justify-end">
                                <span className="font-bold text-sm text-gray-900">{avgG.toFixed(1)}</span>
                                <StarRow value={avgG} size={13} />
                              </div>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {group.rows.length} review{group.rows.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                            {group.product && (
                              <Link href={`/product/${productId}`} target="_blank"
                                className="shrink-0 text-[10px] tracking-wide border border-gray-300 px-2.5 py-1.5 text-gray-500 hover:border-[#8b1c1c] hover:text-[#8b1c1c] transition-colors">
                                View Page ↗
                              </Link>
                            )}
                          </div>

                          {/* Review rows */}
                          <div className="divide-y divide-gray-50">
                            {group.rows.map((r, idx) => {
                              const date = new Date(r.createdAt).toLocaleDateString("en-PK", {
                                day: "numeric", month: "short", year: "numeric",
                              });
                              const time = new Date(r.createdAt).toLocaleTimeString("en-PK", {
                                hour: "2-digit", minute: "2-digit",
                              });
                              return (
                                <div key={r._id}
                                  className={`px-5 py-4 flex items-start gap-4 transition-colors hover:bg-gray-50/60 ${idx % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                                  {/* Avatar */}
                                  <div className="w-9 h-9 rounded-full bg-[#8b1c1c] text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                                    {r.userName.charAt(0).toUpperCase()}
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mb-1.5">
                                      <span className="font-semibold text-sm text-gray-900">{r.userName}</span>
                                      <StarRow value={r.rating} size={12} />
                                      <span className="text-[10px] text-gray-400">{date} · {time}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                                  </div>

                                  {/* Delete */}
                                  <button
                                    onClick={() => setConfirmTarget({ kind: "review", review: r })}
                                    className="shrink-0 mt-0.5 flex items-center gap-1 text-[10px] px-2.5 py-1.5 border border-red-200 text-red-500 rounded hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors whitespace-nowrap">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M9 6V4h6v2"/>
                                    </svg>
                                    Delete
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </>
              );
            })()}
          </div>
        )}

        {/* ── CONTACTS ── */}
        {tab === "contacts" && (
          <div className="space-y-4">

            {/* Loading */}
            {!contactsLoaded && (
              <div className="bg-white border border-gray-200 rounded p-12 text-center">
                <div className="w-8 h-8 border-2 border-[#8b1c1c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-400 animate-pulse">Loading messages…</p>
              </div>
            )}

            {/* Empty */}
            {contactsLoaded && contacts.length === 0 && (
              <div className="bg-white border border-gray-200 rounded p-14 text-center">
                <div className="text-5xl mb-4">📬</div>
                <p className="font-playfair font-bold text-xl text-gray-800 mb-2">No messages yet</p>
                <p className="text-sm text-gray-400">Contact form submissions will appear here.</p>
              </div>
            )}

            {/* Messages list */}
            {contactsLoaded && contacts.length > 0 && (
              <div className="bg-white border border-gray-200 rounded overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <h3 className="text-[11px] tracking-[0.2em] uppercase font-bold text-gray-500">
                    Contact Messages ({contacts.length})
                  </h3>
                  {unreadContacts > 0 && (
                    <span className="px-2 py-0.5 bg-[#8b1c1c] text-white text-[10px] font-bold rounded-full">
                      {unreadContacts} unread
                    </span>
                  )}
                </div>

                <div className="divide-y divide-gray-50">
                  {contacts.map(c => {
                    const d   = new Date(c.createdAt);
                    const date = d.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
                    const time = d.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
                    return (
                      <div key={c._id} className={`p-4 sm:p-5 flex gap-4 transition-colors ${c.read ? "bg-white" : "bg-blue-50/40"}`}>
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-[#8b1c1c] flex items-center justify-center text-white text-[13px] font-bold shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mb-1">
                            <span className="font-semibold text-sm text-gray-900">{c.name}</span>
                            {!c.read && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold tracking-wider rounded uppercase">New</span>
                            )}
                            <span className="text-[10px] text-gray-400">{date} · {time}</span>
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mb-2 text-xs text-gray-500">
                            <a href={`mailto:${c.email}`} className="hover:text-[#8b1c1c] transition-colors">✉ {c.email}</a>
                            <a href={`tel:+92${c.phone.slice(1)}`} className="hover:text-[#8b1c1c] transition-colors">📞 {c.phone}</a>
                          </div>

                          <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded px-3 py-2 border border-gray-100">
                            {c.message}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 shrink-0">
                          <button
                            onClick={() => markContactRead(c._id, !c.read)}
                            className={`text-[10px] px-2.5 py-1.5 border rounded transition-colors whitespace-nowrap ${
                              c.read
                                ? "border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-600"
                                : "border-blue-300 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                            }`}
                          >
                            {c.read ? "Mark Unread" : "Mark Read"}
                          </button>
                          <button
                            onClick={() => setConfirmTarget({ kind: "contact", contact: c })}
                            className="text-[10px] px-2.5 py-1.5 border border-red-200 text-red-500 rounded hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors whitespace-nowrap"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
