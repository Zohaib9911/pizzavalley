"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AnnouncementBar from "../components/AnnouncementBar";
import Header from "../components/Header";
import Footer from "../components/Footer";

/* ── Types ── */
interface OrderItem {
  name: string; variant?: string; qty: number; price: number;
}
interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  status: string;
  notes?: string;
  createdAt: string;
}

/* ── Status pipeline (cancelled is handled separately) ── */
const STEPS = [
  { key: "pending",          label: "Placed",       icon: "📋" },
  { key: "confirmed",        label: "Confirmed",     icon: "✅" },
  { key: "preparing",        label: "Preparing",     icon: "👨‍🍳" },
  { key: "out_for_delivery", label: "On the Way",    icon: "🛵" },
  { key: "delivered",        label: "Delivered",     icon: "🏠" },
];

const STATUS_STEP: Record<string, number> = {
  pending:          0,
  confirmed:        1,
  preparing:        2,
  out_for_delivery: 3,
  delivered:        4,
  cancelled:        -1,
};

const STATUS_COLOR: Record<string, string> = {
  pending:          "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed:        "bg-blue-100 text-blue-800 border-blue-200",
  preparing:        "bg-orange-100 text-orange-800 border-orange-200",
  out_for_delivery: "bg-purple-100 text-purple-800 border-purple-200",
  delivered:        "bg-green-100 text-green-800 border-green-200",
  cancelled:        "bg-red-100 text-red-800 border-red-200",
};

const STATUS_LABEL: Record<string, string> = {
  pending:          "Order Placed",
  confirmed:        "Confirmed",
  preparing:        "Preparing",
  out_for_delivery: "Out for Delivery",
  delivered:        "Delivered",
  cancelled:        "Cancelled",
};

/* ── Status timeline ── */
function StatusTimeline({ status }: { status: string }) {
  const currentStep = STATUS_STEP[status] ?? 0;
  const isCancelled = status === "cancelled";

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 py-3 px-4 bg-red-50 border border-red-100 rounded">
        <span className="text-lg">❌</span>
        <div>
          <p className="text-sm font-semibold text-red-700">Order Cancelled</p>
          <p className="text-xs text-red-500">This order was cancelled. Please contact us if you have questions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center">
        {STEPS.map((step, i) => {
          const done    = i <= currentStep;
          const active  = i === currentStep;
          const isLast  = i === STEPS.length - 1;

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              {/* Circle */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all ${
                  done
                    ? active
                      ? "bg-[#8b1c1c] border-[#8b1c1c] text-white shadow-md shadow-[#8b1c1c]/30"
                      : "bg-[#8b1c1c] border-[#8b1c1c] text-white"
                    : "bg-white border-gray-200 text-gray-300"
                }`}>
                  {done ? (active ? step.icon : "✓") : <span className="text-[10px] font-bold">{i + 1}</span>}
                </div>
                <span className={`text-[9px] text-center leading-tight font-medium whitespace-nowrap hidden sm:block ${
                  active ? "text-[#8b1c1c] font-bold" : done ? "text-gray-600" : "text-gray-300"
                }`}>
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className={`flex-1 h-0.5 mx-1 ${i < currentStep ? "bg-[#8b1c1c]" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Active step label on mobile */}
      <p className="sm:hidden text-center text-xs font-semibold text-[#8b1c1c] mt-3">
        {STEPS[currentStep]?.icon} {STEPS[currentStep]?.label}
      </p>
    </div>
  );
}

/* ── Single order card ── */
function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(order.createdAt).toLocaleDateString("en-PK", {
    day: "numeric", month: "short", year: "numeric",
  });
  const time = new Date(order.createdAt).toLocaleTimeString("en-PK", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="bg-white border border-gray-200 rounded overflow-hidden shadow-sm">

      {/* ── Card header ── */}
      <div className="px-5 py-4 flex flex-wrap items-center gap-3 border-b border-gray-100">
        {/* Order number */}
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-[#8b1c1c] text-sm">{order.orderNumber}</span>
          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${STATUS_COLOR[order.status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>

        {/* Date */}
        <span className="text-xs text-gray-400 ml-auto">
          {date} &middot; {time}
        </span>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-[10px] tracking-wide text-gray-400 hover:text-[#8b1c1c] flex items-center gap-1 transition-colors">
          {expanded ? "Hide details" : "View details"}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>

      {/* ── Status timeline ── */}
      <div className="px-5">
        <StatusTimeline status={order.status} />
      </div>

      {/* ── Items summary (always visible) ── */}
      <div className="px-5 pb-4">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {order.items.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-1 bg-[#f5f0e8] px-2.5 py-1 text-xs rounded-full text-gray-700">
              <span className="font-semibold text-[#8b1c1c]">{item.qty}×</span>
              {item.name}
              {item.variant && <span className="text-gray-400">({item.variant})</span>}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{order.items.reduce((s, i) => s + i.qty, 0)} item{order.items.reduce((s, i) => s + i.qty, 0) !== 1 ? "s" : ""}</span>
          <span className="font-bold text-sm text-[#8b1c1c]">
            {order.subtotal > 0 ? `PKR ${order.subtotal.toLocaleString()}` : "Price TBD"}
          </span>
        </div>
      </div>

      {/* ── Expanded details ── */}
      {expanded && (
        <div className="border-t border-gray-100 bg-[#f5f0e8]/40 px-5 py-4 space-y-3">

          {/* Delivery info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-gray-400 mb-1">Delivery Address</p>
              <p className="text-gray-700">{order.address}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-gray-400 mb-1">Contact</p>
              <p className="text-gray-700">{order.customerPhone}</p>
              {order.customerEmail && <p className="text-gray-500">{order.customerEmail}</p>}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="text-xs">
              <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-gray-400 mb-1">Notes</p>
              <p className="text-gray-600 italic">"{order.notes}"</p>
            </div>
          )}

          {/* Items breakdown */}
          <div>
            <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-gray-400 mb-2">Order Breakdown</p>
            <div className="space-y-1">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-xs text-gray-700">
                  <span>
                    {item.qty}× {item.name}
                    {item.variant && <span className="text-gray-400"> · {item.variant}</span>}
                  </span>
                  <span className="font-medium">
                    {item.price > 0 ? `PKR ${(item.price * item.qty).toLocaleString()}` : "—"}
                  </span>
                </div>
              ))}
              {order.subtotal > 0 && (
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200 mt-2">
                  <span>Total</span>
                  <span className="text-[#8b1c1c]">PKR {order.subtotal.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Status summary bar ── */
function StatusSummary({ orders }: { orders: Order[] }) {
  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pills = [
    { key: "pending",          label: "Pending",     color: "bg-yellow-100 text-yellow-700" },
    { key: "confirmed",        label: "Confirmed",   color: "bg-blue-100 text-blue-700"    },
    { key: "preparing",        label: "Preparing",   color: "bg-orange-100 text-orange-700"},
    { key: "out_for_delivery", label: "On the Way",  color: "bg-purple-100 text-purple-700"},
    { key: "delivered",        label: "Delivered",   color: "bg-green-100 text-green-700"  },
    { key: "cancelled",        label: "Cancelled",   color: "bg-red-100 text-red-700"      },
  ].filter(p => counts[p.key]);

  if (!pills.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {pills.map(p => (
        <span key={p.key} className={`px-3 py-1 text-[10px] font-bold tracking-wide rounded-full ${p.color}`}>
          {counts[p.key]} {p.label}
        </span>
      ))}
    </div>
  );
}

/* ── Main page ── */
export default function OrdersPage() {
  const router = useRouter();
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    // Check auth first
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => {
        if (!d.user) { router.push("/account"); return; }
        // Fetch orders
        return fetch("/api/orders").then(r => r.json()).then(data => {
          if (data.orders) setOrders(data.orders);
        });
      })
      .catch(() => setError("Failed to load orders."))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="min-h-[70vh] bg-[#f5f0e8] py-10 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Breadcrumb */}
          <p className="text-[11px] tracking-[0.25em] uppercase text-gray-400 mb-6">
            <Link href="/" className="hover:text-[#8b1c1c]">Home</Link>
            &nbsp;/&nbsp;
            <Link href="/account" className="hover:text-[#8b1c1c]">My Account</Link>
            &nbsp;/&nbsp;
            <span className="text-gray-600">My Orders</span>
          </p>

          <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
            <h1 className="font-playfair font-bold text-2xl sm:text-3xl text-gray-900">My Orders</h1>
            <Link href="/"
              className="text-[10px] sm:text-[11px] tracking-[0.15em] uppercase font-semibold text-[#8b1c1c] hover:underline shrink-0">
              + Add Items
            </Link>
          </div>

          {/* Loading */}
          {loading && (
            <div className="bg-white border border-gray-200 rounded p-12 text-center">
              <div className="w-8 h-8 border-2 border-[#8b1c1c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-400 animate-pulse">Loading your orders…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="bg-white border border-red-200 rounded p-6 text-center">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && orders.length === 0 && (
            <div className="bg-white border border-gray-200 rounded p-14 text-center">
              <div className="text-5xl mb-4">🛵</div>
              <h2 className="font-playfair font-bold text-xl text-gray-800 mb-2">No orders yet</h2>
              <p className="text-sm text-gray-400 mb-8">You haven't placed any orders. Browse our menu and add items to your basket!</p>
              <Link href="/"
                className="inline-block px-10 py-3 bg-[#8b1c1c] text-white text-[11px] tracking-[0.2em] uppercase font-semibold hover:bg-[#6b1414] transition-colors">
                Browse Menu
              </Link>
            </div>
          )}

          {/* Orders list */}
          {!loading && !error && orders.length > 0 && (
            <>
              <StatusSummary orders={orders} />
              <div className="space-y-4">
                {orders.map(order => (
                  <OrderCard key={order._id} order={order} />
                ))}
              </div>
              <p className="text-center text-xs text-gray-400 mt-8">
                {orders.length} order{orders.length !== 1 ? "s" : ""} in total · Cash on delivery
              </p>
            </>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
