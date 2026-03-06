"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShoppingCart,
  Star,
  Truck,
  XCircle,
} from "lucide-react";
import { AiFactStripSection, AiRestaurantSnapshot, ThemePresetId } from "@/types";
import { RestaurantNav } from "@/components/restaurant/RestaurantNav";
import { MenuSection } from "@/components/restaurant/MenuSection";
import { DeliveryOptions } from "@/components/restaurant/DeliveryOptions";
import { ReservationForm } from "@/components/restaurant/ReservationForm";
import { CartDrawer } from "@/components/restaurant/CartDrawer";
import { CheckoutForm } from "@/components/restaurant/CheckoutButton";
import { SafeImage } from "@/components/shared/SafeImage";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

function FloatingCartButton({ onClick }: { onClick: () => void }) {
  const { itemCount, total } = useCart();
  if (itemCount === 0) return null;

  return (
    <motion.button
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      onClick={onClick}
      className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full bg-theme-primary px-6 py-3.5 font-semibold text-theme-primary-foreground shadow-lg shadow-black/20 md:hidden"
    >
      <ShoppingCart className="h-5 w-5" />
      <span>View Cart ({itemCount})</span>
      <span className="rounded-full bg-white/20 px-2 py-0.5 text-sm">
        {formatCurrency(total)}
      </span>
    </motion.button>
  );
}

interface GeneratedRestaurantExperienceProps {
  snapshot: AiRestaurantSnapshot;
  themeId: ThemePresetId;
  success: boolean;
  canceled: boolean;
}

export function GeneratedRestaurantExperience({
  snapshot,
  themeId,
  success,
  canceled,
}: GeneratedRestaurantExperienceProps) {
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const reservationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.dataset.theme = themeId;
    return () => {
      document.body.dataset.theme = "terracotta-sunset";
    };
  }, [themeId]);

  const heroSection =
    snapshot.sections.find((section) => section.type === "hero") || null;
  const storySection =
    snapshot.sections.find((section) => section.type === "story") || null;
  const gallerySection =
    snapshot.sections.find((section) => section.type === "gallery") || null;
  const deliverySection =
    snapshot.sections.find((section) => section.type === "delivery_options") ||
    null;
  const reservationSection =
    snapshot.sections.find((section) => section.type === "reservation") || null;
  const footerSection =
    snapshot.sections.find((section) => section.type === "footer") || null;

  const scrollToMenu = () =>
    menuRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToReservation = () =>
    reservationRef.current?.scrollIntoView({ behavior: "smooth" });

  if (success || canceled) {
    return (
      <div
        data-theme={themeId}
        className="flex min-h-screen items-center justify-center bg-theme-surface"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto max-w-md px-6 text-center"
        >
          {success ? (
            <>
              <CheckCircle2 className="mx-auto mb-4 h-20 w-20 text-green-500" />
              <h1 className="mb-3 font-serif text-3xl font-bold text-theme-ink">
                Order Confirmed!
              </h1>
              <p className="mb-6 text-muted-foreground">
                Thank you for your order. Your request for {snapshot.info.name} is
                being prepared.
              </p>
            </>
          ) : (
            <>
              <XCircle className="mx-auto mb-4 h-20 w-20 text-red-400" />
              <h1 className="mb-3 font-serif text-3xl font-bold text-theme-ink">
                Order Cancelled
              </h1>
              <p className="mb-6 text-muted-foreground">
                Your checkout was cancelled. No charges were made.
              </p>
            </>
          )}
          <a
            href={`/demo/${snapshot.slug}?theme=${themeId}`}
            className="inline-flex items-center rounded-full bg-theme-primary px-8 py-3 font-semibold text-theme-primary-foreground transition-colors hover:bg-theme-primary/90"
          >
            Back to Menu
          </a>
        </motion.div>
      </div>
    );
  }

  const galleryImages =
    snapshot.galleryImages.length > 0
      ? snapshot.galleryImages
      : snapshot.info.heroImage
        ? [{ src: snapshot.info.heroImage, alt: snapshot.info.name }]
        : [];

  const factStrip = snapshot.sections.find(
    (section): section is AiFactStripSection => section.type === "fact_strip"
  );

  const deliveryOptions = snapshot.deliveryLinks.map((link) => ({
    name: link.label,
    description:
      link.kind === "delivery"
        ? "Delivery provider"
        : link.kind === "reservation"
          ? "Reservation path"
          : "Direct restaurant action",
    href: link.href,
    icon:
      link.kind === "delivery"
        ? Truck
        : link.kind === "reservation"
          ? CalendarDays
          : MapPin,
    color:
      link.kind === "delivery"
        ? "border-red-200 bg-red-50"
        : link.kind === "reservation"
          ? "border-amber-200 bg-amber-50"
          : "border-theme-border bg-theme-panel",
    iconColor:
      link.kind === "delivery"
        ? "text-red-500"
        : link.kind === "reservation"
          ? "text-amber-700"
          : "text-theme-primary",
    external: link.href.startsWith("http"),
  }));

  return (
    <main data-theme={themeId} className="bg-theme-surface text-theme-ink">
      <RestaurantNav
        restaurantName={snapshot.info.name}
        onCartClick={() => setCartOpen(true)}
        onMenuClick={scrollToMenu}
        onReservationClick={scrollToReservation}
        showCart={snapshot.capabilities.hasMenu}
        showMenuButton={snapshot.capabilities.hasMenu}
        showReservationButton={snapshot.capabilities.hasReservations}
      />

      <AnimatePresence mode="wait">
        {checkoutMode && snapshot.capabilities.hasMenu ? (
          <motion.div
            key="generated-checkout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen px-6 py-20"
          >
            <CheckoutForm
              restaurantSlug={snapshot.slug}
              themeId={themeId}
              onBack={() => setCheckoutMode(false)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="generated-restaurant"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <section className="relative min-h-[500px] overflow-hidden">
              {snapshot.info.heroImage ? (
                <SafeImage
                  src={snapshot.info.heroImage}
                  alt={snapshot.info.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="100vw"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-theme-hero-from via-theme-hero-via/55 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--theme-glow),transparent_35%)] opacity-40" />
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
                <div className="mb-4 inline-flex items-center gap-1 rounded-full bg-theme-accent px-3 py-1 text-sm font-semibold text-theme-accent-foreground">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  AI generated from live site signals
                </div>

                <h1 className="mb-4 font-serif text-5xl font-bold text-white md:text-7xl">
                  {heroSection?.title || snapshot.info.name}
                </h1>
                <p className="mb-2 max-w-2xl text-lg text-white/70">
                  {heroSection?.body ||
                    snapshot.info.description ||
                    snapshot.summary}
                </p>

                <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-white/60">
                  {snapshot.info.address ? (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {snapshot.info.address}
                    </span>
                  ) : null}
                  {snapshot.info.phone ? (
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {snapshot.info.phone}
                    </span>
                  ) : null}
                  {snapshot.info.hours[0] ? (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {snapshot.info.hours[0].day} {snapshot.info.hours[0].open} -{" "}
                      {snapshot.info.hours[0].close}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-4">
                  {snapshot.capabilities.hasMenu ? (
                    <Button
                      onClick={scrollToMenu}
                      className="rounded-full bg-theme-primary px-8 py-6 text-base font-semibold text-theme-primary-foreground hover:bg-theme-primary/90"
                    >
                      {heroSection?.primaryCtaLabel || "Order Now"}
                    </Button>
                  ) : null}
                  {snapshot.capabilities.hasReservations ? (
                    <Button
                      onClick={scrollToReservation}
                      variant="outline"
                      className="rounded-full border-white/30 bg-white/10 px-8 py-6 text-base font-semibold text-white hover:bg-white/20"
                    >
                      {heroSection?.secondaryCtaLabel || "Make a Reservation"}
                    </Button>
                  ) : null}
                </div>
              </div>
            </section>

            {factStrip?.facts?.length ? (
              <section className="border-b border-theme-border bg-theme-panel/70 py-6">
                <div className="mx-auto grid max-w-7xl gap-4 px-6 md:grid-cols-4">
                  {factStrip.facts.map((fact) => (
                    <div
                      key={`${fact.label}-${fact.value}`}
                      className="rounded-2xl border border-theme-border bg-theme-surface px-4 py-4"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-theme-ink-soft">
                        {fact.label}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-theme-ink">
                        {fact.value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {storySection ? (
              <section className="bg-theme-panel py-16">
                <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[0.9fr_1.1fr]">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-theme-primary">
                      {storySection.eyebrow || "Story"}
                    </p>
                    <h2 className="mt-3 font-serif text-4xl font-bold text-theme-ink md:text-5xl">
                      {storySection.title ||
                        `A richer digital front door for ${snapshot.info.name}.`}
                    </h2>
                  </div>
                  <p className="text-lg leading-8 text-theme-ink-soft">
                    {storySection.body ||
                      snapshot.info.description ||
                      snapshot.summary}
                  </p>
                </div>
              </section>
            ) : null}

            {snapshot.capabilities.hasMenu ? (
              <div ref={menuRef}>
                <MenuSection
                  menu={snapshot.menu}
                  title={
                    snapshot.sections.find((section) => section.type === "menu")
                      ?.title || "Our Menu"
                  }
                  description={
                    snapshot.sections.find((section) => section.type === "menu")
                      ?.body ||
                    "Menu structure generated from the source website's published facts."
                  }
                />
              </div>
            ) : null}

            {gallerySection && galleryImages.length > 0 ? (
              <section className="bg-theme-panel py-16">
                <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="flex flex-col justify-between rounded-[2rem] border border-theme-border bg-theme-surface p-8">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-theme-primary">
                        {gallerySection.eyebrow || "Signature moments"}
                      </p>
                      <h2 className="mt-3 max-w-md font-serif text-4xl font-bold text-theme-ink">
                        {gallerySection.title ||
                          "A richer dining story, built into the transformed experience."}
                      </h2>
                      <p className="mt-5 max-w-xl text-base leading-7 text-theme-ink-soft">
                        {gallerySection.body ||
                          "The generated page leads with imagery and atmosphere when the source site has visual material to support it."}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                    <div className="relative min-h-[25rem] overflow-hidden rounded-[2rem]">
                      <SafeImage
                        src={galleryImages[0].src}
                        alt={galleryImages[0].alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-theme-hero-from via-transparent to-transparent" />
                    </div>

                    <div className="grid gap-4">
                      {galleryImages.slice(1, 4).map((image) => (
                        <div
                          key={image.src}
                          className="relative min-h-40 overflow-hidden rounded-[1.75rem] border border-theme-border bg-theme-surface"
                        >
                          <SafeImage
                            src={image.src}
                            alt={image.alt}
                            fill
                            className="object-cover"
                            sizes="320px"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            {snapshot.capabilities.hasDeliveryLinks ? (
              <DeliveryOptions
                title={
                  deliverySection?.title || "How would you like your order?"
                }
                description={
                  deliverySection?.body ||
                  "Direct links extracted from the source website."
                }
                options={deliveryOptions}
              />
            ) : null}

            {snapshot.capabilities.hasReservations ? (
              <div ref={reservationRef}>
                <ReservationForm
                  restaurantSlug={snapshot.slug}
                  title={reservationSection?.title || "Make a Reservation"}
                  description={
                    reservationSection?.body ||
                    "Reserve your table through the transformed reservation flow."
                  }
                />
              </div>
            ) : null}

            <footer className="bg-theme-panel-strong py-16 text-white">
              <div className="mx-auto max-w-7xl px-6">
                <div className="grid gap-10 md:grid-cols-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-theme-accent">
                      {footerSection?.eyebrow || "Contact"}
                    </p>
                    <h3 className="mt-3 font-serif text-2xl font-bold">
                      {footerSection?.title || snapshot.info.name}
                    </h3>
                    <p className="mt-4 max-w-md text-sm text-white/60">
                      {footerSection?.body ||
                        snapshot.info.description ||
                        snapshot.summary}
                    </p>
                  </div>

                  <div>
                    <h4 className="mb-4 font-semibold text-theme-accent">
                      Details
                    </h4>
                    <ul className="space-y-3 text-sm text-white/60">
                      {snapshot.info.address ? <li>{snapshot.info.address}</li> : null}
                      {snapshot.info.phone ? <li>{snapshot.info.phone}</li> : null}
                      {snapshot.info.sourceUrl ? (
                        <li className="break-all">{snapshot.info.sourceUrl}</li>
                      ) : null}
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-4 font-semibold text-theme-accent">Hours</h4>
                    <ul className="space-y-2 text-sm text-white/60">
                      {snapshot.info.hours.length > 0 ? (
                        snapshot.info.hours.map((hour) => (
                          <li key={`${hour.day}-${hour.open}-${hour.close}`}>
                            {hour.day}: {hour.open} - {hour.close}
                          </li>
                        ))
                      ) : (
                        <li>Visit source site for current hours.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {snapshot.capabilities.hasMenu ? (
        <>
          <CartDrawer
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            onCheckout={() => {
              setCartOpen(false);
              setCheckoutMode(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
          {!checkoutMode ? (
            <FloatingCartButton onClick={() => setCartOpen(true)} />
          ) : null}
        </>
      ) : null}
    </main>
  );
}
