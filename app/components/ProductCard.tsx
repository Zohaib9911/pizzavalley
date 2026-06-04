"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "../data/products";
import { useCart } from "../../lib/context/CartContext";
import { useAuth } from "../../lib/context/AuthContext";

interface Props {
  product: Product;
  categoryImage: string;
  animIndex?: number;
}

export default function ProductCard({ product, categoryImage, animIndex = 0 }: Props) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [qty, setQty] = useState(0);
  const { addItem, setItemQty } = useCart();
  const { user, loading } = useAuth();
  const router = useRouter();

  function requireLogin(action: () => void) {
    if (loading) return;
    if (!user) {
      const redirect = encodeURIComponent(window.location.pathname);
      router.push(`/account?redirect=${redirect}`);
      return;
    }
    action();
  }

  const lowestPrice = product.variants
    ? Math.min(...product.variants.map((v) => v.price))
    : product.price ?? 0;

  const currentPrice = product.variants
    ? product.variants[selectedIdx]?.price
    : product.price ?? 0;

  const isDeal = Boolean(product.dealItems?.length);

  return (
    <li
      className="product-item product_Card list-none bg-white hover:shadow-lg hover:border-[#8b1c1c] animate-fade-in-up"
      style={{
        border: "1.5px solid #e5e5e5",
        transition: ".3s all ease-in",
        display: "inline-block",
        padding: "5px",
        width: "100%",
        margin: 0,
        verticalAlign: "top",
        boxSizing: "border-box",
        fontSize: "1.4rem",
        lineHeight: "normal",
        animationDelay: `${animIndex * 0.07}s`,
        animationFillMode: "both",
      }}
    >
      <div className="product-item-info flex flex-col h-full">

        {/* ── img_block ── */}
        <div className="img_block relative overflow-hidden">
          {/* Deal badge */}
          {product.badge && (
            <div className="absolute top-2 left-2 z-10 bg-[#f5c518] text-black text-[10px] font-extrabold px-2 py-1 leading-none">
              {product.badge}
            </div>
          )}

          {/* Product image — links to detail page */}
          <Link href={`/product/${product.id}`} className="product photo product-item-photo block">
            <div
              className="relative w-full bg-[#f8f5ef]"
              style={{ paddingBottom: "66.6%" }}
            >
              <Image
                src={categoryImage}
                alt={product.name}
                fill
                loading="lazy"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>

          {/* img_cnt — overlay on image bottom */}
          <div className="img_cnt absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-3 py-3">
            <Link href={`/product/${product.id}`} className="product_title block text-white font-bold text-sm leading-tight line-clamp-1 hover:underline">
              {product.name}
            </Link>
            {product.description && (
              <p className="primary_text text-gray-300 text-[11px] mt-0.5 line-clamp-2 leading-snug">
                {product.description}
              </p>
            )}
          </div>
        </div>

        {/* ── cnt_block / card_data ── */}
        <div className="product details product-item-details cnt_block flex flex-col flex-1 p-3 sm:p-3">
          <div className="card_data flex-1">

            {/* Product name */}
            <div className="product name product-item-name product_name mb-3">
              <Link href={`/product/${product.id}`} className="product-item-link product_title block font-extrabold text-[17px] sm:text-[13px] text-gray-900 leading-snug hover:text-[#8b1c1c] line-clamp-2">
                {product.name}
              </Link>
              {product.urduName && (
                <p className="text-[12px] sm:text-[10px] text-gray-400 mt-1 text-right leading-none">
                  {product.urduName}
                </p>
              )}
            </div>

            {/* Deal items list */}
            {isDeal && product.dealItems && (
              <ul className="mb-2 space-y-1">
                {product.dealItems.map((item, i) => (
                  <li key={i} className="text-[13px] sm:text-[11px] text-gray-600 flex items-start gap-1.5">
                    <span className="text-[#8b1c1c] font-bold mt-px">›</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {/* Size swatches (variants) */}
            {product.variants && (
              <div className="weight swatch-attribute size mb-3" data-attribute-code="size">
                <div className="swatch-attribute-options flex flex-wrap gap-2">
                  {product.variants.map((v, i) => (
                    <button
                      key={v.label}
                      onClick={() => setSelectedIdx(i)}
                      role="option"
                      aria-checked={selectedIdx === i}
                      aria-label={v.label}
                      className={`swatch-option text-[12px] sm:text-[10px] px-4 sm:px-2.5 py-2 sm:py-1 border font-bold transition-colors min-w-[52px] sm:min-w-0 ${
                        selectedIdx === i
                          ? "bg-[#8b1c1c] text-white border-[#8b1c1c]"
                          : "bg-white text-gray-700 border-gray-300 hover:border-[#8b1c1c] hover:text-[#8b1c1c]"
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="price secondary_title mt-auto pt-1">
              <div className="price-box price-final_price">
                <span className="price-wrapper flex items-baseline gap-2">
                  <span className="price font-extrabold text-[#8b1c1c] text-[20px] sm:text-[15px]">
                    PKR {currentPrice.toLocaleString()}
                  </span>
                  {product.variants && lowestPrice !== currentPrice && (
                    <span className="text-[12px] sm:text-[10px] text-gray-400 line-through">
                      PKR {lowestPrice.toLocaleString()}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* ── product_cta ── */}
          <div className="product actions product-item-actions product_cta mt-4 sm:mt-3">
            {qty === 0 ? (
              <div className="card_btn add-to-cart-button">
                <button
                  onClick={() => requireLogin(() => {
                    const variant = product.variants ? product.variants[selectedIdx]?.label : undefined;
                    addItem({
                      id: product.id,
                      name: product.name,
                      variant,
                      price: currentPrice ?? 0,
                      categorySlug: product.categorySlug,
                    });
                    setQty(1);
                  })}
                  className="action tocart primary primary_cta add_to_basket w-full py-4 sm:py-2 bg-[#8b1c1c] text-white text-[14px] sm:text-[11px] tracking-[0.12em] uppercase hover:bg-[#6b1414] active:bg-[#5a1010] transition-colors font-bold"
                >
                  {loading ? "…" : user ? "Add to Basket" : "Login to Order"}
                </button>
              </div>
            ) : (
              <div className="update-buttons input-group quantity primary_cta flex items-center border border-[#8b1c1c]">
                <button
                  onClick={() => {
                    const variant = product.variants ? product.variants[selectedIdx]?.label : undefined;
                    const next = Math.max(0, qty - 1);
                    setItemQty(product.id, variant, next);
                    setQty(next);
                  }}
                  className="minus flex-1 py-4 sm:py-2.5 text-[#8b1c1c] font-bold text-xl sm:text-base hover:bg-[#8b1c1c] hover:text-white active:bg-[#8b1c1c] active:text-white transition-colors"
                >
                  −
                </button>
                <span className="quantity-field flex-1 text-center text-base sm:text-sm font-bold text-gray-900 py-4 sm:py-2.5 border-x border-[#8b1c1c]">
                  {qty}
                </span>
                <button
                  onClick={() => {
                    const variant = product.variants ? product.variants[selectedIdx]?.label : undefined;
                    setItemQty(product.id, variant, qty + 1);
                    setQty(qty + 1);
                  }}
                  className="plus flex-1 py-4 sm:py-2.5 text-[#8b1c1c] font-bold text-xl sm:text-base hover:bg-[#8b1c1c] hover:text-white active:bg-[#8b1c1c] active:text-white transition-colors"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
