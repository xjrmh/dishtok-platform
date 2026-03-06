"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Star, MapPin, Clock, Phone } from "lucide-react";
import { RestaurantInfo } from "@/types";
import { Button } from "@/components/ui/button";

interface RestaurantHeroProps {
  info: RestaurantInfo;
  onOrderClick: () => void;
  onReservationClick: () => void;
}

export function RestaurantHero({
  info,
  onOrderClick,
  onReservationClick,
}: RestaurantHeroProps) {
  return (
    <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
      <Image
        src={info.heroImage}
        alt={info.name}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-theme-hero-from via-theme-hero-via/50 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--theme-glow),transparent_35%)] opacity-40" />

      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-4 inline-flex items-center gap-1 rounded-full bg-theme-accent px-3 py-1 text-sm font-semibold text-theme-accent-foreground">
            <Star className="w-3.5 h-3.5 fill-current" />
            4.7 (320+ reviews)
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-4">
            {info.name}
          </h1>
          <p className="text-white/70 text-lg max-w-xl mb-2">
            {info.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm mb-8">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {info.address}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {info.phone}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {info.hours[0].open} - {info.hours[0].close}
            </span>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={onOrderClick}
              className="rounded-full bg-theme-primary px-8 py-6 text-base font-semibold text-theme-primary-foreground hover:bg-theme-primary/90"
            >
              Order Now
            </Button>
            <Button
              onClick={onReservationClick}
              variant="outline"
              className="rounded-full border-white/30 bg-white/10 px-8 py-6 text-base font-semibold text-white hover:bg-white/20"
            >
              Make a Reservation
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
