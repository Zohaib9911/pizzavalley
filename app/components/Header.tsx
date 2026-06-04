"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../../lib/context/CartContext";
import { useAuth } from "../../lib/context/AuthContext";
import ContactModal from "./ContactModal";
import SearchOverlay from "./SearchOverlay";

const PHONE     = "03005558706";
const PHONE_TEL = "tel:+923005558706";

const mainNav = [
  { label: "Order Online", href: "/category/regular-pizza" },
  { label: "About Us",     href: "/about"                  },
  { label: "Branches",     href: "/branches"               },
  { label: "Contact Us",   href: "#"                       },
];

const categoryNav = [
  { label: "Regular Pizza", slug: "regular-pizza" },
  { label: "Special Pizza", slug: "special-pizza" },
  { label: "Burger",        slug: "burger" },
  { label: "Sandwich",      slug: "sandwich" },
  { label: "Roll",          slug: "roll" },
  { label: "Wraps",         slug: "wraps" },
  { label: "Fries",         slug: "fries" },
  { label: "Pasta",         slug: "pasta" },
  { label: "Sharwarma",     slug: "sharwarma" },
  { label: "Cakes",         slug: "cakes" },
  { label: "Pastries",      slug: "pastries" },
  { label: "Deals",         slug: "fast-food-deals" },
];

interface User { id: string; fullName: string; email: string; isAdmin: boolean; }

/* ── SVG Icons ── */
/* Icons are 26px on mobile, 22px on sm+ */
function PhoneIcon() {
  return (
    <svg className="w-[26px] h-[26px] sm:w-[22px] sm:h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg className="w-[26px] h-[26px] sm:w-[22px] sm:h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function CartIcon() {
  return (
    <svg className="w-[26px] h-[26px] sm:w-[22px] sm:h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}
function AccountIcon() {
  return (
    <svg className="w-[26px] h-[26px] sm:w-[22px] sm:h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg className="w-[26px] h-[26px] sm:w-[22px] sm:h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg className="w-[26px] h-[26px] sm:w-[22px] sm:h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function OrdersIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  );
}
function SignOutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

const iconBase = "flex items-center justify-center text-gray-700 hover:text-[#8b1c1c] transition-colors duration-200 rounded-md hover:bg-gray-50 p-2 sm:p-2";

/* ── Account button: avatar + dropdown when logged in ── */
function AccountButton({ user, onSignOut }: { user: User | null; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Not logged in → plain link to /account */
  if (!user) {
    return (
      <Link href="/account" aria-label="My Account" className={iconBase} title="My Account">
        <AccountIcon />
      </Link>
    );
  }

  /* Logged in → avatar + dropdown */
  const initial = user.fullName.charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      {/* Avatar button */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Account menu"
        className="flex items-center gap-1.5 p-1 rounded-md hover:bg-gray-50 transition-colors"
        title={user.fullName}
      >
        <div className="w-8 h-8 rounded-full bg-[#8b1c1c] flex items-center justify-center text-white text-[13px] font-bold leading-none select-none">
          {initial}
        </div>
        {/* Small caret — hidden on mobile */}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`hidden sm:block text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 shadow-lg z-50"
          style={{ minWidth: "220px" }}
        >
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#8b1c1c] flex items-center justify-center text-white text-sm font-bold shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.fullName}</p>
                <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            {user.isAdmin && (
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-[#8b1c1c]/10 text-[#8b1c1c] text-[9px] tracking-widest uppercase font-bold rounded">
                <ShieldIcon /> Admin
              </div>
            )}
          </div>

          {/* Menu items */}
          <div className="py-1">
            {user.isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-semibold text-[#8b1c1c] hover:bg-[#8b1c1c] hover:text-white transition-colors tracking-wide"
              >
                <ShieldIcon /> Admin Dashboard
              </Link>
            )}

            <Link
              href="/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-[12px] text-gray-700 hover:bg-gray-50 transition-colors tracking-wide"
            >
              <OrdersIcon /> My Orders
            </Link>

            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-[12px] text-gray-700 hover:bg-gray-50 transition-colors tracking-wide"
            >
              <AccountIcon /> My Profile
            </Link>
          </div>

          {/* Sign out */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={() => { setOpen(false); onSignOut(); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[12px] text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors tracking-wide"
            >
              <SignOutIcon /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const router = useRouter();
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const { user, signOut } = useAuth();
  const { totalItems, clearCart } = useCart();

  async function handleSignOut() {
    clearCart();
    await signOut();
    router.push("/");
  }

  return (
    <>
    {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
    {searchOpen  && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    <header className="sticky top-0 z-50 bg-white shadow-sm">

      {/* ── Main row ── */}
      <div className="max-w-[1600px] mx-auto w-full px-3 sm:px-[30px] py-[10px] sm:py-[12px] box-border">
        <div className="flex justify-between items-center w-full gap-1 sm:gap-[10px]">

          {/* Left nav (desktop) */}
          <nav className="hidden lg:flex items-center gap-5 text-[11px] tracking-[0.16em] uppercase font-semibold text-gray-700 shrink-0">
            {mainNav.slice(0, 3).map(item =>
              item.label === "Contact Us" ? (
                <button key={item.label} onClick={() => setContactOpen(true)} className="hover:text-[#8b1c1c] whitespace-nowrap">{item.label}</button>
              ) : (
                <Link key={item.label} href={item.href} className="hover:text-[#8b1c1c] whitespace-nowrap">{item.label}</Link>
              )
            )}
          </nav>

          {/* Logo */}
          <Link href="/" className="flex flex-col items-center shrink-0">
            <span className="font-playfair italic font-bold text-[#8b1c1c] leading-none text-[19px] sm:text-[clamp(22px,2.5vw,30px)]">
              Pizza Valley
            </span>
            <span className="text-[8px] sm:text-[9px] tracking-[0.3em] sm:tracking-[0.35em] uppercase text-gray-400 mt-0.5">Sweet Valley</span>
          </Link>

          {/* Right nav + icons */}
          <div className="flex items-center gap-0 sm:gap-1 shrink-0">
            {/* Desktop right nav */}
            <nav className="hidden lg:flex items-center gap-5 text-[11px] tracking-[0.16em] uppercase font-semibold text-gray-700 mr-3">
              {mainNav.slice(3).map(item =>
                item.label === "Contact Us" ? (
                  <button key={item.label} onClick={() => setContactOpen(true)} className="hover:text-[#8b1c1c] whitespace-nowrap">{item.label}</button>
                ) : (
                  <Link key={item.label} href={item.href} className="hover:text-[#8b1c1c] whitespace-nowrap">{item.label}</Link>
                )
              )}
            </nav>

            {/* Call — hidden on mobile to save space */}
            <a href={PHONE_TEL} aria-label={`Call ${PHONE}`} className={`${iconBase} hidden sm:flex`} title={`Call ${PHONE}`}>
              <PhoneIcon />
              <span className="hidden xl:block ml-1.5 text-[11px] font-semibold tracking-wide text-gray-700 hover:text-[#8b1c1c]">
                {PHONE}
              </span>
            </a>

            {/* Search */}
            <button aria-label="Search" className={iconBase} title="Search" onClick={() => setSearchOpen(true)}>
              <SearchIcon />
            </button>

            {/* Cart */}
            <Link href="/cart" aria-label="Cart" className={`${iconBase} relative`} title="Cart">
              <span className={totalItems > 0 ? "cart-bounce" : ""}>
                <CartIcon />
              </span>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#8b1c1c] text-white text-[9px] font-bold leading-none px-[3px]">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            {/* Account — avatar dropdown when logged in */}
            <AccountButton user={user} onSignOut={handleSignOut} />

            {/* Mobile hamburger */}
            <button aria-label="Menu" className={`${iconBase} lg:hidden`} onClick={() => setMobileOpen(v => !v)} title="Menu">
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Category sub-nav (desktop) ── */}
      <div className="border-t border-gray-100 hidden lg:block bg-white">
        <div className="max-w-[1600px] mx-auto overflow-x-auto" style={{ padding: "0 30px" }}>
          <nav className="flex items-center justify-center gap-6 py-2.5 min-w-max mx-auto">
            {categoryNav.map(cat => (
              <Link key={cat.slug} href={`/category/${cat.slug}`}
                className="text-[11px] tracking-[0.16em] uppercase text-gray-600 hover:text-[#8b1c1c] whitespace-nowrap py-1 transition-colors">
                {cat.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          {/* Phone banner */}
          <a href={PHONE_TEL} className="flex items-center gap-3 px-6 py-4 bg-[#8b1c1c] text-white">
            <PhoneIcon />
            <span className="text-sm font-semibold tracking-wide">{PHONE}</span>
          </a>

          <nav className="flex flex-col px-6 py-4 gap-0">
            {mainNav.map(item =>
              item.label === "Contact Us" ? (
                <button key={item.label}
                  onClick={() => { setMobileOpen(false); setContactOpen(true); }}
                  className="py-3 border-b border-gray-50 text-[12px] tracking-[0.15em] uppercase font-semibold text-gray-700 hover:text-[#8b1c1c] text-left">
                  {item.label}
                </button>
              ) : (
                <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)}
                  className="py-3 border-b border-gray-50 text-[12px] tracking-[0.15em] uppercase font-semibold text-gray-700 hover:text-[#8b1c1c]">
                  {item.label}
                </Link>
              )
            )}

            <p className="pt-4 pb-2 text-[10px] tracking-[0.3em] uppercase text-gray-400 font-bold">Categories</p>
            {categoryNav.map(cat => (
              <Link key={cat.slug} href={`/category/${cat.slug}`} onClick={() => setMobileOpen(false)}
                className="py-3 border-b border-gray-50 text-[12px] tracking-[0.15em] uppercase font-medium text-gray-600 hover:text-[#8b1c1c]">
                {cat.label}
              </Link>
            ))}

            {/* Mobile account section */}
            {user ? (
              <>
                <div className="mt-4 flex items-center gap-3 py-3 border-b border-gray-50">
                  <div className="w-8 h-8 rounded-full bg-[#8b1c1c] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-gray-800 truncate">{user.fullName}</p>
                    <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                  </div>
                  {user.isAdmin && (
                    <span className="ml-auto shrink-0 px-1.5 py-0.5 bg-[#8b1c1c] text-white text-[8px] tracking-widest uppercase font-bold rounded">
                      Admin
                    </span>
                  )}
                </div>
                {user.isAdmin && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)}
                    className="py-3 border-b border-gray-50 text-[12px] tracking-[0.15em] uppercase font-semibold text-[#8b1c1c] flex items-center gap-2">
                    <ShieldIcon /> Admin Dashboard
                  </Link>
                )}
                <Link href="/orders" onClick={() => setMobileOpen(false)}
                  className="py-3 border-b border-gray-50 text-[12px] tracking-[0.15em] uppercase font-medium text-gray-700 flex items-center gap-2">
                  <OrdersIcon /> My Orders
                </Link>
                <button onClick={() => { setMobileOpen(false); handleSignOut(); }}
                  className="mt-3 w-full py-3 text-[12px] tracking-[0.15em] uppercase font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/account" onClick={() => setMobileOpen(false)}
                className="mt-4 flex items-center gap-2 py-3 text-[12px] tracking-[0.15em] uppercase font-semibold text-[#8b1c1c]">
                <AccountIcon /> My Account
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
    </>
  );
}
