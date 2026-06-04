import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AnnouncementBar from "../../components/AnnouncementBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { connectDB } from "../../../lib/mongodb";
import MenuItem from "../../../lib/models/MenuItem";
import { categoryImages, products as staticProducts } from "../../data/products";
import { categories } from "../../data/categories";
import ProductDetail from "./ProductDetail";

export const dynamic = "force-dynamic";

const BASE_URL = "https://pizzavalley.store";

/* ── Helpers ── */
function isPlaceholder(desc?: string | null): boolean {
  if (!desc) return true;
  const d = desc.trim().toLowerCase();
  return (
    d === "" ||
    d.includes("discription") ||
    d.includes("description") ||
    d === "this is a description" ||
    d.length < 20
  );
}

function buildDescription(
  name: string,
  catName: string,
  description: string | undefined | null,
  minPrice: number,
): string {
  if (!isPlaceholder(description)) {
    return `${description!.trim()} Order ${name} from Pizza Valley Bahawalpur. Starting from PKR ${minPrice.toLocaleString()}.`;
  }
  return `Order ${name} — fresh ${catName} from Pizza Valley Bahawalpur & Yazman. Home delivery within 10 km. Starting from PKR ${minPrice.toLocaleString()}. Fast & reliable delivery.`;
}

function minPrice(item: { variants?: { price: number }[]; price?: number }): number {
  if (item.variants?.length) return Math.min(...item.variants.map(v => v.price));
  return item.price ?? 0;
}

/* ── generateMetadata ── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    await connectDB();
    const doc = await MenuItem.findById(id).lean() as {
      _id: unknown; name: string; description?: string;
      categorySlug: string; variants?: { price: number }[];
      price?: number; image?: string;
    } | null;

    if (doc) {
      const cat     = categories.find(c => c.slug === doc.categorySlug);
      const catName = cat?.name ?? doc.categorySlug;
      const price   = minPrice(doc);
      const desc    = buildDescription(doc.name, catName, doc.description, price);
      const url     = `${BASE_URL}/product/${id}`;
      const ogImg   = doc.image
        ? [{ url: doc.image, width: 800, height: 600, alt: doc.name }]
        : [{ url: `${BASE_URL}/images/PizzaValley and sweet Valley.png`, width: 1200, height: 630, alt: "Pizza Valley" }];

      return {
        title:       `${doc.name} | Pizza Valley Bahawalpur`,
        description: desc,
        alternates:  { canonical: url },
        openGraph: {
          type:        "website",
          url,
          siteName:    "Pizza Valley",
          title:       `${doc.name} | Pizza Valley Bahawalpur`,
          description: desc,
          images:      ogImg,
        },
        twitter: {
          card:        "summary_large_image",
          title:       `${doc.name} | Pizza Valley`,
          description: desc,
          images:      ogImg.map(i => i.url),
        },
      };
    }
  } catch { /* invalid ObjectId — fall through */ }

  // Fallback: try static data
  const staticItem = staticProducts.find(p => p.id === id);
  if (staticItem) {
    const cat     = categories.find(c => c.slug === staticItem.categorySlug);
    const catName = cat?.name ?? staticItem.categorySlug;
    const price   = minPrice(staticItem);
    const desc    = buildDescription(staticItem.name, catName, staticItem.description, price);
    const url     = `${BASE_URL}/product/${id}`;
    return {
      title:       `${staticItem.name} | Pizza Valley Bahawalpur`,
      description: desc,
      alternates:  { canonical: url },
      openGraph:   { url, title: staticItem.name, description: desc },
    };
  }

  return { title: "Product | Pizza Valley" };
}

/* ── Page ── */
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let item: Record<string, unknown> | null = null;

  try {
    await connectDB();
    const doc = await MenuItem.findById(id).lean() as Record<string, unknown> | null;
    if (doc) {
      item = {
        _id:          String(doc._id),
        name:         doc.name,
        urduName:     doc.urduName,
        description:  doc.description,
        ingredients:  doc.ingredients,
        categorySlug: doc.categorySlug,
        variants:     doc.variants,
        price:        doc.price,
        badge:        doc.badge,
        dealItems:    doc.dealItems,
        image:        doc.image,
        isActive:     doc.isActive,
      };
    }
  } catch { /* invalid ObjectId */ }

  if (!item) notFound();

  const cat         = categories.find(c => c.slug === item!.categorySlug as string);
  const catName     = cat?.name ?? String(item.categorySlug);
  const fallbackImg = categoryImages[item.categorySlug as string] ?? "/images/pizzaa-grey-512x512_1_.png";
  const displayImg  = (item.image as string) || fallbackImg;

  /* ── Product structured data (JSON-LD) ── */
  const price   = minPrice(item as { variants?: { price: number }[]; price?: number });
  const desc    = buildDescription(
    item.name as string, catName,
    item.description as string | undefined,
    price,
  );

  const productSchema = {
    "@context": "https://schema.org",
    "@type":    "Product",
    "name":     item.name,
    "description": desc,
    "image":    displayImg.startsWith("http") ? displayImg : `${BASE_URL}${displayImg}`,
    "brand":    { "@type": "Brand", "name": "Pizza Valley" },
    "offers": (item.variants as { label: string; price: number }[] | undefined)?.length
      ? (item.variants as { label: string; price: number }[]).map(v => ({
          "@type":         "Offer",
          "name":          v.label,
          "price":         v.price,
          "priceCurrency": "PKR",
          "availability":  item!.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "url":           `${BASE_URL}/product/${id}`,
          "seller":        { "@type": "Organization", "name": "Pizza Valley" },
        }))
      : [{
          "@type":         "Offer",
          "price":         price,
          "priceCurrency": "PKR",
          "availability":  item.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "url":           `${BASE_URL}/product/${id}`,
          "seller":        { "@type": "Organization", "name": "Pizza Valley" },
        }],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <AnnouncementBar />
      <Header />
      <ProductDetail
        item={item}
        catName={catName}
        displayImg={displayImg}
      />
      <Footer />
    </>
  );
}
