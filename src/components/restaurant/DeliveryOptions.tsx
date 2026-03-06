"use client";

import { motion } from "framer-motion";
import { MapPin, Truck, ExternalLink, type LucideIcon } from "lucide-react";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/shared/AnimatedSection";

interface DeliveryOption {
  name: string;
  description: string;
  href?: string;
  icon?: LucideIcon;
  available?: boolean;
  color?: string;
  iconColor?: string;
  external?: boolean;
}

const defaultOptions: DeliveryOption[] = [
  {
    name: "Pickup",
    description: "Ready in 25-35 min",
    icon: MapPin,
    available: true,
    color: "border-green-200 bg-green-50",
    iconColor: "text-green-600",
  },
  {
    name: "DoorDash",
    description: "Delivery in 30-45 min",
    icon: Truck,
    available: true,
    color: "border-red-200 bg-red-50",
    iconColor: "text-red-500",
    external: true,
  },
  {
    name: "Uber Eats",
    description: "Delivery in 35-50 min",
    icon: Truck,
    available: true,
    color: "border-gray-200 bg-gray-50",
    iconColor: "text-gray-700",
    external: true,
  },
];

interface DeliveryOptionsProps {
  title?: string;
  description?: string;
  options?: DeliveryOption[];
}

export function DeliveryOptions({
  title = "How Would You Like Your Order?",
  description = "Choose your preferred way to enjoy our food",
  options = defaultOptions,
}: DeliveryOptionsProps) {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-3xl px-6">
        <AnimatedSection className="text-center mb-10">
          <h2 className="mb-3 font-serif text-4xl font-bold text-theme-ink">
            {title}
          </h2>
          <p className="text-muted-foreground">{description}</p>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {options.map((option) => {
            const Icon = option.icon || MapPin;

            return (
              <StaggerItem key={option.name}>
                <motion.a
                  whileHover={{ y: -4 }}
                  href={option.href || "#"}
                  className={`block w-full rounded-xl border-2 p-6 text-left transition-shadow hover:shadow-lg ${
                    option.color || "border-theme-border bg-theme-panel"
                  }`}
                >
                  <Icon
                    className={`mb-3 h-8 w-8 ${
                      option.iconColor || "text-theme-primary"
                    }`}
                  />
                  <h3 className="flex items-center gap-2 font-semibold text-theme-ink">
                    {option.name}
                    {option.external && (
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </motion.a>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
