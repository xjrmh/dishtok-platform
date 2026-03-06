"use client";

import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { WhyChooseUs } from "@/components/landing/WhyChooseUs";
import { MerchantCTA } from "@/components/landing/MerchantCTA";

export default function HomePage() {
  return (
    <main data-theme="terracotta-sunset" className="bg-theme-surface text-theme-ink">
      <Navbar />
      <HeroSection />
      <FeatureShowcase />
      <WhyChooseUs />
      <MerchantCTA />
      <Footer />
    </main>
  );
}
