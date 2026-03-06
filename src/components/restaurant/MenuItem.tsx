"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SafeImage } from "@/components/shared/SafeImage";
import { MenuItem as MenuItemType } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface MenuItemProps {
  item: MenuItemType;
  onSelect: (item: MenuItemType) => void;
}

export function MenuItemCard({ item, onSelect }: MenuItemProps) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
      transition={{ duration: 0.2 }}
      className="group cursor-pointer overflow-hidden rounded-[1.5rem] border border-theme-border bg-theme-panel"
      onClick={() => onSelect(item)}
    >
      {item.image ? (
        <div className="relative h-44 overflow-hidden">
          <SafeImage
            src={item.image}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          <div className="absolute top-2 left-2 flex gap-1.5">
            {item.tags?.includes("popular") && (
              <Badge className="border-0 bg-theme-accent text-xs text-theme-accent-foreground">
                Popular
              </Badge>
            )}
            {item.tags?.includes("spicy") && (
              <Badge className="bg-red-500 text-white text-xs border-0">
                Spicy
              </Badge>
            )}
            {item.tags?.includes("gf") && (
              <Badge className="bg-green-500 text-white text-xs border-0">
                GF
              </Badge>
            )}
          </div>
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center bg-gradient-to-br from-theme-surface to-theme-surface-muted">
          <span className="text-4xl">🍽️</span>
        </div>
      )}

      <div className="p-4">
        <h4 className="mb-1 font-semibold text-theme-ink transition-colors group-hover:text-theme-primary">
          {item.name}
        </h4>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {item.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-theme-primary">
            {formatCurrency(item.price)}
          </span>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-theme-primary/10 text-theme-primary transition-colors hover:bg-theme-primary hover:text-theme-primary-foreground">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
