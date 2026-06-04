import type { Metadata } from "next";
import AnnouncementBar    from "./components/AnnouncementBar";
import Header             from "./components/Header";
import HeroSection        from "./components/HeroSection";
import MarqueeStrip       from "./components/MarqueeStrip";
import FeatureCards       from "./components/FeatureCards";
import BigTextSection     from "./components/BigTextSection";
import CategoriesSection  from "./components/CategoriesSection";
import PromoBanner        from "./components/PromoBanner";
import StickyShowcase     from "./components/StickyShowcase";
import GiftingSection     from "./components/GiftingSection";
import LegacySection      from "./components/LegacySection";
import Footer             from "./components/Footer";

export const metadata: Metadata = {
  alternates: { canonical: "https://pizzavalley.store" },
};

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>
        <HeroSection />
        <MarqueeStrip />
        <FeatureCards />
        <BigTextSection />
        <CategoriesSection />
        <PromoBanner />
        <StickyShowcase />
        <GiftingSection />
        <LegacySection />
      </main>
      <Footer />
    </>
  );
}
