import { notFound } from "next/navigation";
import Link from "next/link";
import AnnouncementBar from "../../components/AnnouncementBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import { categories } from "../../data/categories";
import {
  getProductsByCategory,
  categoryImages,
  categoryNotes,
  type Product,
} from "../../data/products";
import { connectDB } from "../../../lib/mongodb";
import MenuItem from "../../../lib/models/MenuItem";

export const dynamic = "force-dynamic";

const BASE_URL = "https://pizzavalley.store";

const categoryDescriptions: Record<string, string> = {
  "regular-pizza":    "Order fresh Regular Pizza in Bahawalpur. Hand-tossed dough, rich tomato sauce, premium toppings. Home delivery available within 10 km.",
  "special-pizza":    "Try our Special Pizzas in Bahawalpur — signature recipes with premium toppings. Order online for fast home delivery.",
  "burger":           "Juicy, crispy burgers in Bahawalpur. Chicken, beef and veggie options. Order from Pizza Valley for quick home delivery.",
  "sandwich":         "Fresh made-to-order sandwiches in Bahawalpur. Grilled and cold options. Order online from Pizza Valley.",
  "roll":             "Hot crispy rolls in Bahawalpur — chicken, seekh and more. Quick home delivery from Pizza Valley.",
  "wraps":            "Fresh wraps in Bahawalpur packed with flavour. Order online from Pizza Valley for fast delivery.",
  "fries":            "Golden crispy fries in Bahawalpur. Loaded, seasoned and plain options from Pizza Valley.",
  "pasta":            "Creamy and baked pasta in Bahawalpur. Alfredo, rose and more. Order from Pizza Valley.",
  "sharwarma":        "Authentic shawarma in Bahawalpur. Loaded with fresh veggies and sauces. Order online from Pizza Valley.",
  "fast-food-deals":  "Best fast food deals in Bahawalpur. Family meal combos at great prices from Pizza Valley.",
  "pizza-deals":      "Pizza deals and combo offers in Bahawalpur. Save more when you order from Pizza Valley online.",
  "cakes":            "Fresh baked cakes in Bahawalpur. Chocolate, vanilla, fruit and more from Pizza Valley's bakery.",
  "customized-cakes": "Custom cakes for every occasion in Bahawalpur. Birthday, wedding and event cakes made to order at Pizza Valley.",
  "pastries":         "Freshly baked pastries in Bahawalpur. Croissants, puffs and sweet pastries from Pizza Valley's bakery.",
  "wings":            "Crispy chicken wings in Bahawalpur. Buffalo, BBQ and more sauces. Order from Pizza Valley.",
  "special-biscuits": "Handcrafted special biscuits and cookies in Bahawalpur. Order fresh from Pizza Valley's bakery.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return { title: "Not Found | Pizza Valley" };
  const description = categoryDescriptions[slug] ?? `Order ${cat.name} in Bahawalpur from Pizza Valley. Fresh, fast home delivery.`;
  return {
    title: `${cat.name} in Bahawalpur | Pizza Valley`,
    description,
    alternates: { canonical: `${BASE_URL}/category/${slug}` },
    openGraph: {
      title: `${cat.name} in Bahawalpur | Pizza Valley`,
      description,
      url: `${BASE_URL}/category/${slug}`,
      siteName: "Pizza Valley",
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) notFound();

  /* ── Try DB first; fall back to static data ── */
  let products: Product[] = [];
  try {
    await connectDB();
    const dbItems = await MenuItem.find({ categorySlug: slug, isActive: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    if (dbItems.length > 0) {
      products = dbItems.map((item) => ({
        id:           String(item._id),
        name:         item.name,
        urduName:     item.urduName  || undefined,
        description:  item.description || undefined,
        categorySlug: item.categorySlug,
        variants:     item.variants?.length ? item.variants : undefined,
        price:        item.price ?? undefined,
        badge:        item.badge   || undefined,
        dealItems:    item.dealItems?.length ? item.dealItems : undefined,
        // Use per-item image if set, otherwise fall back to category image
        _image:       item.image || undefined,
      } as Product & { _image?: string }));
    }
  } catch { /* DB unavailable — fall through */ }

  // Fall back to static data when DB is empty for this category
  if (products.length === 0) {
    products = getProductsByCategory(slug);
  }

  const catImage = categoryImages[slug] ?? "/images/pizzaa-grey-512x512_1_.png";
  const note     = categoryNotes[slug];

  /* ── Per-category hero banner images ── */
  const heroImages: Record<string, string> = {
    "regular-pizza":   "/images/hero Section Images/Regular Pizza Hero.png",
    "special-pizza":   "/images/hero Section Images/Special Pizza Hero.png",
    "burger":          "/images/hero Section Images/Special Burger Hero.png",
    "sandwich":        "/images/hero Section Images/Sanwich Hero.png",
    "roll":            "/images/hero Section Images/Rool Hero.png",
    "wraps":           "/images/hero Section Images/Wraps Hero.png",
    "fries":           "/images/hero Section Images/Fries hero.png",
    "pasta":           "/images/hero Section Images/Paste Hero.png",
    "sharwarma":       "/images/hero Section Images/Sharwarma Hero.png",
    "fast-food-deals": "/images/hero Section Images/Fast Food Deals hero.png",
    "cakes":            "/images/hero Section Images/Cake Hero.png",
    "customized-cakes": "/images/hero Section Images/Cake Hero.png",
    "pastries":         "/images/hero Section Images/Pastries hero.png",
    "wings":            "/images/hero Section Images/Wings hero.png",
    "pizza-deals":      "/images/hero Section Images/Pizza Deals Hero.png",
    "special-biscuits": "/images/hero Section Images/Special Biscuits Hero.png",
  };
  const heroBg = heroImages[slug];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home",    "item": "https://pizzavalley.store" },
      { "@type": "ListItem", "position": 2, "name": cat!.name, "item": `https://pizzavalley.store/category/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <AnnouncementBar />
      <Header />

      <main className="min-h-[60vh]">
        {/* ── Page header ── */}
        <div
          className="relative py-16 px-4 text-center border-b border-gray-200 overflow-hidden"
          style={heroBg ? {
            backgroundImage: `url('${heroBg}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          } : { backgroundColor: "#f5f0e8" }}
        >
          {/* Dark overlay — only when a hero image is set */}
          {heroBg && (
            <div className="absolute inset-0 bg-black/55" />
          )}

          {/* Content — sits above overlay */}
          <div className="relative z-10">
            <p className={`text-[11px] tracking-[0.25em] uppercase mb-3 ${heroBg ? "text-white/70" : "text-gray-400"}`}>
              <Link href="/" className={heroBg ? "hover:text-white" : "hover:text-[#8b1c1c]"}>Home</Link>
              &nbsp;/&nbsp;{cat.name}
            </p>
            <h1
              className={`font-playfair font-bold leading-tight ${heroBg ? "text-white drop-shadow-lg" : "text-black"}`}
              style={{ fontSize: "clamp(26px, 4vw, 48px)" }}
            >
              {cat.name}
            </h1>
            {note && (
              <p className={`mt-3 text-sm tracking-wide ${heroBg ? "text-white/80" : "text-gray-500"}`}>{note}</p>
            )}
          </div>
        </div>

        {/* ── Product grid ── */}
        <div
          className="max-w-7xl mx-auto px-3 sm:px-5 py-10"
          style={{ boxSizing: "border-box" }}
        >
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-sm tracking-wide mb-6">
                Products coming soon — check back shortly.
              </p>
              <Link
                href="/"
                className="inline-block px-8 py-3 bg-[#8b1c1c] text-white text-[11px] tracking-[0.2em] uppercase hover:bg-[#6b1414]"
              >
                Back to Home
              </Link>
            </div>
          ) : (
            <ul
              className="products list items product-items grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
              style={{ listStyle: "none", padding: 0, margin: 0 }}
            >
              {products.map((product, i) => {
                const itemImage = (product as Product & { _image?: string })._image || catImage;
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    categoryImage={itemImage}
                    animIndex={i}
                  />
                );
              })}
            </ul>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
