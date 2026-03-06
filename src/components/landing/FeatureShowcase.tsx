"use client";

import Image from "next/image";
import { CalendarDays, CreditCard, ShoppingCart } from "lucide-react";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/AnimatedSection";

const features = [
  {
    icon: ShoppingCart,
    title: "Ordering Templates",
    description:
      "Pre-built restaurant ordering modules turn dense menus into scrollable collections with clearer add-to-cart moments.",
    image:
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=1200&h=900&fit=crop",
  },
  {
    icon: CalendarDays,
    title: "Reservations That Breathe",
    description:
      "A warmer reservation surface pulls scheduling out of dated navigation and makes table booking feel premium.",
    image:
      "https://images.unsplash.com/photo-1515669097368-22e68427d265?w=1200&h=900&fit=crop",
  },
  {
    icon: CreditCard,
    title: "Consistent Checkout",
    description:
      "Theme-driven checkout keeps payments, confirmations, and cart actions visually aligned with the transformed site.",
    image:
      "https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1200&h=900&fit=crop",
  },
];

export function FeatureShowcase() {
  return (
    <section id="features" className="bg-theme-panel py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-theme-primary">
            Pre-designed framework
          </p>
          <h2 className="mt-3 font-serif text-4xl font-bold text-theme-ink md:text-5xl">
            ChatGPT informs the direction. The framework does the heavy lifting.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-theme-ink-soft">
            The transformed website stays reliable because the visual system,
            ordering flow, and restaurant modules are designed up front.
          </p>
        </div>

        <StaggerContainer className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <div className="overflow-hidden rounded-[2rem] border border-theme-border bg-theme-surface shadow-[0_18px_50px_rgba(42,31,27,0.05)]">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                  <div className="absolute left-5 top-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-theme-primary shadow-sm backdrop-blur-sm">
                    <feature.icon className="h-6 w-6" />
                  </div>
                </div>

                <div className="p-7">
                  <h3 className="text-xl font-bold text-theme-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-3 leading-7 text-theme-ink-soft">
                    {feature.description}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
