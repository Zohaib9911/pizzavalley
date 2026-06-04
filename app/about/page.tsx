import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AnnouncementBar from "../components/AnnouncementBar";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "About Pizza Valley | Best Pizza & Sweets in Bahawalpur",
  description:
    "Learn about Pizza Valley — Bahawalpur's favourite pizza and sweets destination with over 5 years of serving fresh, delicious food. Two branches: Bahawalpur & Yazman.",
  alternates: { canonical: "https://pizzavalley.store/about" },
  openGraph: {
    title: "About Pizza Valley | Bahawalpur's Favourite Food Destination",
    description:
      "5+ years of serving the best pizza, burgers, cakes and sweets in Bahawalpur. Visit our Bahawalpur or Yazman branch today.",
    url: "https://pizzavalley.store/about",
  },
};

const highlights = [
  { icon: "🍕", title: "5+ Years of Excellence", body: "Serving Bahawalpur since day one with the same passion and quality that made us the city's favourite food stop." },
  { icon: "🏪", title: "Two Branches", body: "Bahawalpur main branch and Yazman branch — bringing great food closer to more people across southern Punjab." },
  { icon: "🚚", title: "Free Home Delivery", body: "Free delivery on orders above Rs. 1,500 within 5 km of each branch. Fresh to your door, fast." },
  { icon: "🎂", title: "Bakery & Sweets", body: "From custom cakes and pastries to special biscuits and sweets — our in-house bakery crafts every bite with care." },
];

export default function AboutPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />

      <main>

        {/* ── Hero ── */}
        <section className="bg-[#111] py-20 px-4 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-3xl mx-auto">
            <p className="text-[10px] tracking-[0.35em] uppercase text-[#8b1c1c] mb-3">Our Story</p>
            <h1
              className="font-playfair italic font-bold text-white leading-tight mb-5"
              style={{ fontSize: "clamp(30px, 5vw, 56px)" }}
            >
              Pizza Valley<br />&amp; Sweets Valley
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl mx-auto">
              Born in Bahawalpur. Built on flavour. Loved by thousands.
            </p>
          </div>
        </section>

        {/* ── Story ── */}
        <section className="bg-[#f5f0e8] py-16 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400 mb-3">Who We Are</p>
              <h2
                className="font-playfair font-bold text-gray-900 mb-6 leading-snug"
                style={{ fontSize: "clamp(22px, 3vw, 34px)" }}
              >
                A Legacy of Taste in Southern Punjab
              </h2>
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>
                  Pizza Valley is more than a restaurant — it is a culinary tradition rooted in the heart of Bahawalpur.
                  For over <strong>5 years</strong> we have been serving the people of Bahawalpur and Yazman with freshly
                  made pizza, crispy burgers, flavourful rolls, wraps, shawarma, and an extensive bakery range that
                  includes cakes, pastries, and sweets.
                </p>
                <p>
                  What started as a single dream to bring world-class flavours to southern Punjab has grown into two
                  thriving branches — beloved by families, students, and food lovers across the region. From birthday
                  cakes to late-night pizza, we are the place Bahawalpur turns to.
                </p>
                <p>
                  Every item on our menu is prepared fresh daily. We source quality ingredients, train our team with care,
                  and take pride in every box that leaves our kitchen.
                </p>
              </div>
            </div>
            <div className="relative w-full aspect-[4/3] rounded-sm overflow-hidden">
              <Image
                src="/images/PizzaValley and sweet Valley.png"
                alt="Pizza Valley & Sweets Valley store in Bahawalpur"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
              />
            </div>
          </div>
        </section>

        {/* ── Highlights ── */}
        <section className="bg-white py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2
              className="font-lato font-light tracking-[0.3em] uppercase text-center text-gray-800 mb-12"
              style={{ fontSize: "clamp(13px, 1.8vw, 20px)" }}
            >
              Why Bahawalpur Loves Us
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {highlights.map(h => (
                <div key={h.title} className="bg-[#f5f0e8] p-6 border border-gray-100">
                  <div className="text-3xl mb-3">{h.icon}</div>
                  <h3 className="font-playfair font-bold text-gray-900 text-lg mb-2">{h.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{h.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-[#8b1c1c] py-14 px-4 text-center">
          <h2
            className="font-playfair italic font-bold text-white mb-4"
            style={{ fontSize: "clamp(22px, 3vw, 36px)" }}
          >
            Ready to Order?
          </h2>
          <p className="text-red-200 text-sm mb-8">
            Browse our full menu and get fresh food delivered to your door.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/category/regular-pizza"
              className="px-8 py-3 bg-white text-[#8b1c1c] text-[11px] tracking-[0.25em] uppercase font-bold hover:bg-gray-100 transition-colors"
            >
              Order Now
            </Link>
            <Link
              href="/branches"
              className="px-8 py-3 border border-white text-white text-[11px] tracking-[0.25em] uppercase font-semibold hover:bg-white/10 transition-colors"
            >
              Find a Branch
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
