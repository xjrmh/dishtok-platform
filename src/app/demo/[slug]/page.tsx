"use client";

import { startTransition, use, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getRestaurantBySlug } from "@/lib/menu-data";
import { CartProvider } from "@/context/CartContext";
import { GeneratedRestaurantExperience } from "@/components/restaurant/GeneratedRestaurantExperience";
import { RestaurantHero } from "@/components/restaurant/RestaurantHero";
import { RestaurantNav } from "@/components/restaurant/RestaurantNav";
import { MenuSection } from "@/components/restaurant/MenuSection";
import { CartDrawer } from "@/components/restaurant/CartDrawer";
import { DeliveryOptions } from "@/components/restaurant/DeliveryOptions";
import { ReservationForm } from "@/components/restaurant/ReservationForm";
import { RestaurantFooter } from "@/components/restaurant/RestaurantFooter";
import { SignatureGallery } from "@/components/restaurant/SignatureGallery";
import { CheckoutForm } from "@/components/restaurant/CheckoutButton";
import { CheckCircle2, XCircle, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { DEFAULT_THEME_PRESET_ID, isThemePresetId } from "@/lib/themes";
import { formatCurrency } from "@/lib/utils";
import { Suspense } from "react";
import { AiRestaurantSnapshot } from "@/types";

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
      <ShoppingCart className="w-5 h-5" />
      <span>View Cart ({itemCount})</span>
      <span className="rounded-full bg-white/20 px-2 py-0.5 text-sm">
        {formatCurrency(total)}
      </span>
    </motion.button>
  );
}

function RestaurantPageContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const restaurant = slug === "son-cubano" ? getRestaurantBySlug(slug) : null;
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [generatedSnapshot, setGeneratedSnapshot] =
    useState<AiRestaurantSnapshot | null>(null);
  const [generatedLoading, setGeneratedLoading] = useState(slug !== "son-cubano");
  const menuRef = useRef<HTMLDivElement>(null);
  const reservationRef = useRef<HTMLDivElement>(null);

  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");
  const themeParam = searchParams.get("theme");
  const themeId = isThemePresetId(themeParam)
    ? themeParam
    : DEFAULT_THEME_PRESET_ID;

  useEffect(() => {
    if (slug === "son-cubano") return;

    let cancelled = false;
    startTransition(() => {
      setGeneratedLoading(true);
      setGeneratedSnapshot(null);
    });

    fetch(`/api/transform/${slug}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Snapshot not found");
        }

        return response.json();
      })
      .then((data) => {
        if (!cancelled) {
          setGeneratedSnapshot(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGeneratedSnapshot(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setGeneratedLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (slug !== "son-cubano") return;
    document.body.dataset.theme = themeId;
    return () => {
      document.body.dataset.theme = DEFAULT_THEME_PRESET_ID;
    };
  }, [slug, themeId]);

  if (slug !== "son-cubano") {
    if (generatedLoading) {
      return (
        <div
          data-theme={themeId}
          className="flex min-h-screen items-center justify-center bg-theme-surface"
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-theme-primary border-t-transparent" />
        </div>
      );
    }

    if (!generatedSnapshot) {
      return (
        <div
          data-theme={themeId}
          className="flex min-h-screen items-center justify-center bg-theme-surface"
        >
          <div className="text-center">
            <h1 className="mb-2 font-serif text-3xl font-bold text-theme-ink">
              Generated Transform Not Found
            </h1>
            <p className="text-muted-foreground">
              This AI-generated restaurant preview is no longer available.
            </p>
          </div>
        </div>
      );
    }

    return (
      <GeneratedRestaurantExperience
        snapshot={generatedSnapshot}
        themeId={themeId}
        success={Boolean(success)}
        canceled={Boolean(canceled)}
      />
    );
  }

  if (!restaurant) {
    return (
      <div
        data-theme={themeId}
        className="flex min-h-screen items-center justify-center bg-theme-surface"
      >
        <div className="text-center">
          <h1 className="mb-2 font-serif text-3xl font-bold text-theme-ink">
            Restaurant Not Found
          </h1>
          <p className="text-muted-foreground">
            The restaurant you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  const { info, menu } = restaurant;

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
          className="text-center max-w-md mx-auto px-6"
        >
          {success ? (
            <>
              <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h1 className="mb-3 font-serif text-3xl font-bold text-theme-ink">
                Order Confirmed!
              </h1>
              <p className="text-muted-foreground mb-6">
                Thank you for your order! Your food is being prepared. You&apos;ll
                receive a confirmation email shortly.
              </p>
            </>
          ) : (
            <>
              <XCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
              <h1 className="mb-3 font-serif text-3xl font-bold text-theme-ink">
                Order Cancelled
              </h1>
              <p className="text-muted-foreground mb-6">
                Your order was cancelled. No charges were made.
              </p>
            </>
          )}
          <a
            href={`/demo/${slug}?theme=${themeId}`}
            className="inline-flex items-center rounded-full bg-theme-primary px-8 py-3 font-semibold text-theme-primary-foreground transition-colors hover:bg-theme-primary/90"
          >
            Back to Menu
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <main data-theme={themeId} className="bg-theme-surface text-theme-ink">
      <RestaurantNav
        restaurantName={info.name}
        onCartClick={() => setCartOpen(true)}
        onMenuClick={scrollToMenu}
        onReservationClick={scrollToReservation}
      />

      <AnimatePresence mode="wait">
        {checkoutMode ? (
          <motion.div
            key="checkout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen py-20 px-6"
          >
            <CheckoutForm
              restaurantSlug={slug}
              themeId={themeId}
              onBack={() => setCheckoutMode(false)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="restaurant"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <RestaurantHero
              info={info}
              onOrderClick={scrollToMenu}
              onReservationClick={scrollToReservation}
            />

            <div ref={menuRef}>
              <MenuSection menu={menu} />
            </div>

            <SignatureGallery info={info} menu={menu} />

            <DeliveryOptions />

            <div ref={reservationRef}>
              <ReservationForm restaurantSlug={slug} />
            </div>

            <RestaurantFooter info={info} />
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutMode(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* Floating cart button for mobile */}
      {!checkoutMode && <FloatingCartButton onClick={() => setCartOpen(true)} />}
    </main>
  );
}

export default function RestaurantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <CartProvider>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-theme-surface">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-theme-primary border-t-transparent" />
          </div>
        }
      >
        <RestaurantPageContent params={params} />
      </Suspense>
    </CartProvider>
  );
}
