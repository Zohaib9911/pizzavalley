import type { Metadata } from "next";
import AnnouncementBar from "../components/AnnouncementBar";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Our Branches | Pizza Valley Bahawalpur & Yazman",
  description:
    "Find Pizza Valley near you. Two branches in Bahawalpur and Yazman, Punjab. Get directions, opening hours, and contact info. Free delivery within 5 km.",
  alternates: { canonical: "https://pizzavalley.store/branches" },
  openGraph: {
    title: "Pizza Valley Branches — Bahawalpur & Yazman",
    description: "Visit our Bahawalpur or Yazman branch. Get directions on Google Maps and enjoy free home delivery within 5 km.",
    url: "https://pizzavalley.store/branches",
  },
};

const BRANCHES = [
  {
    name: "Bahawalpur Branch",
    tag: "Main Branch",
    address: "Bahawalpur, Punjab, Pakistan",
    phone: "03005558706",
    hours: "Mon – Sun: 12:00 PM – 12:00 AM",
    description:
      "Our flagship branch in the heart of Bahawalpur. Serving fresh pizzas, burgers, wraps, cakes, and a full menu of fan favourites. Dine in or order for delivery within 5 km.",
    mapEmbed:
      "https://maps.google.com/maps?q=29.357258,71.693754&z=16&output=embed",
    directionsUrl: "https://maps.app.goo.gl/anaMrdi3oKDKBo2c9",
    color: "amber",
  },
  {
    name: "Yazman Branch",
    tag: "Yazman City",
    address: "Yazman, Punjab, Pakistan",
    phone: "03005558706",
    hours: "Mon – Sun: 12:00 PM – 12:00 AM",
    description:
      "Bringing the Pizza Valley experience to Yazman. Enjoy the same quality food and speedy delivery you love, now closer to home for our Yazman customers.",
    mapEmbed:
      "https://maps.google.com/maps?q=29.130616,71.747700&z=16&output=embed",
    directionsUrl: "https://maps.app.goo.gl/DgEp31vVL9d6ScqC7",
    color: "indigo",
  },
];

export default function BranchesPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="min-h-screen bg-[#f5f0e8]">

        {/* ── Hero ── */}
        <div className="bg-white border-b border-gray-100 py-14 px-4 text-center">
          <p className="text-[10px] tracking-[0.35em] uppercase text-gray-400 mb-3">
            Where to find us
          </p>
          <h1
            className="font-playfair italic font-bold text-[#8b1c1c] leading-tight"
            style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
          >
            Our Branches
          </h1>
          <div className="w-10 h-px bg-[#8b1c1c] mx-auto mt-5" />
          <p className="mt-5 text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
            Two locations, one passion — serving the finest pizzas, burgers, and
            baked goods across southern Punjab.
          </p>
        </div>

        {/* ── Branch cards ── */}
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {BRANCHES.map((branch) => (
            <div
              key={branch.name}
              className="bg-white border border-gray-200 shadow-sm flex flex-col overflow-hidden"
            >
              {/* Map embed — fully interactive (zoom, pan, street view) */}
              <div className="w-full" style={{ height: "340px" }}>
                <iframe
                  src={branch.mapEmbed}
                  width="100%"
                  height="100%"
                  style={{ border: 0, display: "block" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map — ${branch.name}`}
                />
              </div>

              {/* Info */}
              <div className="p-6 flex flex-col flex-1">
                {/* Badge + name */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full ${
                      branch.color === "amber"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    {branch.tag}
                  </span>
                </div>
                <h2 className="font-playfair font-bold text-gray-900 text-xl mb-1">
                  {branch.name}
                </h2>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                  {branch.description}
                </p>

                {/* Details grid */}
                <ul className="flex flex-col gap-2 mb-6 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <svg className="shrink-0 mt-0.5 text-[#8b1c1c]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>{branch.address}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="shrink-0 mt-0.5 text-[#8b1c1c]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                    </svg>
                    <a href={`tel:+92${branch.phone.slice(1)}`} className="hover:text-[#8b1c1c] transition-colors">
                      {branch.phone}
                    </a>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="shrink-0 mt-0.5 text-[#8b1c1c]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>{branch.hours}</span>
                  </li>
                </ul>

                {/* Get Directions button */}
                <a
                  href={branch.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto flex items-center justify-center gap-2 w-full py-3 bg-[#8b1c1c] text-white text-[11px] tracking-[0.2em] uppercase font-semibold hover:bg-[#6b1414] transition-colors"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                  </svg>
                  Get Directions
                </a>
              </div>
            </div>
          ))}
        </div>

      </main>

      <Footer />
    </>
  );
}
