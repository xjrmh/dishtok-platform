"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { UtensilsCrossed } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-theme-panel/90 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-theme-primary text-theme-primary-foreground">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif text-base font-bold leading-none text-theme-ink sm:text-lg md:text-xl">
            DishTok for Merchants
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className={cn(
              "text-sm font-medium transition-colors hover:text-theme-accent",
              scrolled ? "text-theme-ink" : "text-white"
            )}
          >
            Features
          </a>
          <a
            href="#why-us"
            className={cn(
              "text-sm font-medium transition-colors hover:text-theme-accent",
              scrolled ? "text-theme-ink" : "text-white"
            )}
          >
            Why DishTok
          </a>
          <a
            href="#contact"
            className={cn(
              "text-sm font-medium transition-colors hover:text-theme-accent",
              scrolled ? "text-theme-ink" : "text-white"
            )}
          >
            Contact
          </a>
          <Link
            href="/demo?url=demo"
            className="rounded-full bg-theme-primary px-5 py-2 text-sm font-semibold text-theme-primary-foreground transition-colors hover:bg-theme-primary/90"
          >
            Try Demo
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
