import type { Metadata } from "next";
import { Playfair_Display, Lato, Anton } from "next/font/google";
import "./globals.css";
import WhatsAppButton from "./components/WhatsAppButton";
import SmoothScrollProvider from "./components/SmoothScrollProvider";
import CustomCursor from "./components/CustomCursor";
import { CartProvider } from "../lib/context/CartContext";
import { AuthProvider } from "../lib/context/AuthContext";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const BASE_URL = "https://pizzavalley.store";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Pizza Valley | Best Pizza, Burgers & Sweets in Bahawalpur",
    template: "%s | Pizza Valley Bahawalpur",
  },
  description:
    "Pizza Valley — Bahawalpur & Yazman's favourite spot for fresh pizza, burgers, rolls, wraps, cakes and sweets. Order online for home delivery within 5 km. Free delivery above Rs. 1500.",
  keywords: [
    "Pizza Valley",
    "pizzavalley",
    "pizza bahawalpur",
    "best pizza bahawalpur",
    "pizza delivery bahawalpur",
    "burger bahawalpur",
    "pizza yazman",
    "sweet valley bahawalpur",
    "food delivery bahawalpur",
    "online food order bahawalpur",
    "pizza valley bahawalpur",
    "pizza valley yazman",
    "cakes bahawalpur",
    "fresh pizza pakistan",
  ],
  authors: [{ name: "Pizza Valley", url: BASE_URL }],
  creator: "Pizza Valley",
  publisher: "Pizza Valley",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: BASE_URL,
    siteName: "Pizza Valley",
    title: "Pizza Valley | Best Pizza, Burgers & Sweets in Bahawalpur",
    description:
      "Fresh pizza, burgers, rolls, wraps, cakes and sweets in Bahawalpur & Yazman. Order online — free delivery above Rs. 1500.",
    images: [
      {
        url: "/images/PizzaValley and sweet Valley.png",
        width: 1200,
        height: 630,
        alt: "Pizza Valley & Sweets Valley — Bahawalpur",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pizza Valley | Best Pizza, Burgers & Sweets in Bahawalpur",
    description:
      "Fresh pizza, burgers, cakes and sweets in Bahawalpur & Yazman. Order online for home delivery.",
    images: ["/images/PizzaValley and sweet Valley.png"],
  },
  verification: {
    google: "google7823293e0d7c4dcb",
  },
};

/* ── JSON-LD LocalBusiness schema for both branches ── */
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Restaurant",
      "@id": `${BASE_URL}/#bahawalpur`,
      "name": "Pizza Valley — Bahawalpur",
      "url": BASE_URL,
      "telephone": "+923005558706",
      "priceRange": "PKR 200 – PKR 2000",
      "servesCuisine": ["Pizza", "Burgers", "Fast Food", "Bakery", "Sweets"],
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Bahawalpur",
        "addressRegion": "Punjab",
        "addressCountry": "PK",
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 29.357258,
        "longitude": 71.693754,
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
          "opens": "12:00",
          "closes": "00:00",
        },
      ],
      "hasMap": "https://maps.app.goo.gl/anaMrdi3oKDKBo2c9",
      "image": `${BASE_URL}/images/PizzaValley and sweet Valley.png`,
      "sameAs": [
        "https://www.facebook.com/pizzavalley",
        "https://www.instagram.com/pizzavalley",
      ],
    },
    {
      "@type": "Restaurant",
      "@id": `${BASE_URL}/#yazman`,
      "name": "Pizza Valley — Yazman",
      "url": BASE_URL,
      "telephone": "+923005558706",
      "priceRange": "PKR 200 – PKR 2000",
      "servesCuisine": ["Pizza", "Burgers", "Fast Food", "Bakery", "Sweets"],
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Yazman",
        "addressRegion": "Punjab",
        "addressCountry": "PK",
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 29.130616,
        "longitude": 71.747700,
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
          "opens": "12:00",
          "closes": "00:00",
        },
      ],
      "hasMap": "https://maps.app.goo.gl/DgEp31vVL9d6ScqC7",
      "image": `${BASE_URL}/images/PizzaValley and sweet Valley.png`,
    },
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      "url": BASE_URL,
      "name": "Pizza Valley",
      "description": "Best Pizza, Burgers & Sweets in Bahawalpur & Yazman",
      "potentialAction": {
        "@type": "SearchAction",
        "target": { "@type": "EntryPoint", "urlTemplate": `${BASE_URL}/category/regular-pizza` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${lato.variable} ${anton.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <SmoothScrollProvider>
              {children}
            </SmoothScrollProvider>
          </CartProvider>
        </AuthProvider>
        <WhatsAppButton />
        <CustomCursor />
        <div className="grain-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
