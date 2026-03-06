"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingCart, UtensilsCrossed } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

interface RestaurantNavProps {
  restaurantName: string;
  onCartClick: () => void;
  onMenuClick: () => void;
  onReservationClick: () => void;
  homeHref?: string;
  showCart?: boolean;
  showMenuButton?: boolean;
  showReservationButton?: boolean;
}

export function RestaurantNav({
  restaurantName,
  onCartClick,
  onMenuClick,
  onReservationClick,
  homeHref = "/demo?url=demo",
  showCart = true,
  showMenuButton = true,
  showReservationButton = true,
}: RestaurantNavProps) {
  const { itemCount } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 300);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: scrolled ? 0 : -100 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 bg-theme-panel/95 backdrop-blur-md shadow-sm"
    >
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href={homeHref} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-theme-primary text-theme-primary-foreground">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif text-lg font-bold text-theme-ink">
              {restaurantName}
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {showMenuButton ? (
              <button
                onClick={onMenuClick}
                className="text-sm text-theme-ink-soft hover:text-theme-ink transition-colors"
              >
                Menu
              </button>
            ) : null}
            {showReservationButton ? (
              <button
                onClick={onReservationClick}
                className="text-sm text-theme-ink-soft hover:text-theme-ink transition-colors"
              >
                Reservations
              </button>
            ) : null}
          </div>
        </div>

        {showCart ? (
          <button
            onClick={onCartClick}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
              itemCount > 0
                ? "bg-theme-primary text-theme-primary-foreground"
                : "bg-theme-surface-muted text-theme-ink-soft hover:bg-theme-surface"
            )}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="text-sm font-medium">Cart</span>
            {itemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-theme-primary"
              >
                {itemCount}
              </motion.span>
            )}
          </button>
        ) : null}
      </div>
    </motion.nav>
  );
}
