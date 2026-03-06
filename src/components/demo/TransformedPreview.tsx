"use client";

import { Badge } from "@/components/ui/badge";
import { SafeImage } from "@/components/shared/SafeImage";
import { Clock, MapPin, Sparkles, Star } from "lucide-react";
import { sonCubanoInfo, sonCubanoMenu } from "@/lib/menu-data";
import { formatCurrency } from "@/lib/utils";
import { AiRestaurantSnapshot, MenuTab, ThemePresetId } from "@/types";

interface TransformedPreviewProps {
  themeId: ThemePresetId;
  snapshot?: AiRestaurantSnapshot;
}

function flattenMenu(menu: MenuTab[]) {
  return menu.flatMap((tab) => tab.categories).flatMap((category) => category.items);
}

export function TransformedPreview({
  themeId,
  snapshot,
}: TransformedPreviewProps) {
  const info = snapshot?.info ?? {
    ...sonCubanoInfo,
    sourceUrl: "https://soncubano.com",
  };
  const menu = snapshot?.menu?.length ? snapshot.menu : sonCubanoMenu;
  const sections = snapshot?.sections ?? [];
  const heroSection = sections.find((section) => section.type === "hero");
  const gallerySection = sections.find((section) => section.type === "gallery");
  const deliverySection = sections.find(
    (section) => section.type === "delivery_options"
  );
  const hasMenu = snapshot ? snapshot.capabilities.hasMenu : true;
  const featuredItems = hasMenu ? flattenMenu(menu).slice(0, 4) : [];
  const actionLinks = snapshot?.deliveryLinks?.length
    ? snapshot.deliveryLinks.slice(0, 3)
    : [
        { label: "Reserve a table", href: "#", kind: "reservation" as const },
        { label: "Start pickup order", href: "#", kind: "direct" as const },
        { label: "Browse cocktails", href: "#", kind: "direct" as const },
      ];
  const galleryImage =
    snapshot?.galleryImages?.[0]?.src ||
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&h=720&fit=crop";
  const galleryAlt =
    snapshot?.galleryImages?.[0]?.alt || "Warm restaurant dining room";

  return (
    <div
      data-theme={themeId}
      className="h-full w-full overflow-y-auto bg-theme-surface text-theme-ink"
    >
      <div className="relative h-56 overflow-hidden">
        <SafeImage
          src={info.heroImage || galleryImage}
          alt={info.name}
          fill
          className="object-cover"
          sizes="600px"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-theme-hero-from via-theme-hero-via/90 to-theme-hero-to/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--theme-glow),transparent_35%)] opacity-60" />

        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-theme-accent" />
            DishTok Template
          </div>
          <h2 className="font-serif text-3xl font-bold text-white">
            {heroSection?.title || info.name}
          </h2>
          <p className="mt-2 max-w-md text-sm text-white/75">
            {heroSection?.body ||
              info.description ||
              snapshot?.summary ||
              "Editorial visuals, faster ordering, and a cleaner reservation path."}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/80">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-theme-accent text-theme-accent" />
              4.7
            </span>
            {info.cuisine ? (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {info.cuisine}
              </span>
            ) : null}
            {info.priceRange ? (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {info.priceRange}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-10 border-b border-theme-border bg-theme-panel/95 px-4 py-3 backdrop-blur-md">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-ink-soft">
            {hasMenu ? "Signature Collections" : "Transformation Plan"}
          </p>
          <span className="rounded-full bg-theme-primary px-2.5 py-1 text-[10px] font-semibold text-theme-primary-foreground">
            {hasMenu ? "Order-ready" : "AI-driven"}
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {(hasMenu
            ? menu.map((tab) => tab.name)
            : sections
                .filter((section) => section.type !== "hero" && section.type !== "footer")
                .map((section) => section.title || section.type.replace(/_/g, " "))
                .slice(0, 3)
          ).map((label, index) => (
            <button
              key={`${label}-${index}`}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                index === 0
                  ? "bg-theme-primary text-theme-primary-foreground"
                  : "bg-theme-surface text-theme-ink-soft"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5 p-4">
        {hasMenu ? (
          <div className="rounded-3xl border border-theme-border bg-theme-panel p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-ink-soft">
                  Featured now
                </p>
                <h3 className="mt-1 text-sm font-bold text-theme-ink">
                  {menu[0]?.categories[0]?.name || "Highlighted dishes"}
                </h3>
              </div>
              <span className="rounded-full bg-theme-accent/20 px-3 py-1 text-[11px] font-semibold text-theme-accent-foreground">
                Chef selected
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {featuredItems.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-theme-border bg-theme-surface"
                >
                  {item.image ? (
                    <div className="relative h-28 overflow-hidden">
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="220px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                      {item.tags?.includes("popular") ? (
                        <Badge className="absolute left-2 top-2 border-0 bg-theme-accent text-theme-accent-foreground text-[10px]">
                          Popular
                        </Badge>
                      ) : null}
                    </div>
                  ) : (
                    <div className="flex h-28 items-center justify-center bg-theme-surface-muted">
                      <span className="text-4xl">🍽️</span>
                    </div>
                  )}

                  <div className="p-3">
                    <h4 className="truncate text-xs font-semibold text-theme-ink">
                      {item.name}
                    </h4>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-theme-primary">
                        {formatCurrency(item.price)}
                      </span>
                      <button className="flex h-7 w-7 items-center justify-center rounded-full bg-theme-primary text-theme-primary-foreground transition-opacity hover:opacity-90">
                        <span className="text-sm leading-none">+</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-theme-border bg-theme-panel p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-ink-soft">
              Generated brief
            </p>
            <h3 className="mt-2 text-base font-bold text-theme-ink">
              {snapshot?.summary || "AI-generated restaurant redesign"}
            </h3>
            <div className="mt-4 space-y-3">
              {(snapshot?.improvements || []).map((improvement, index) => (
                <div
                  key={`${improvement}-${index}`}
                  className="rounded-2xl border border-theme-border bg-theme-surface px-3 py-3 text-sm text-theme-ink-soft"
                >
                  {improvement}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-[1.1fr_0.9fr] gap-3">
          <div className="relative min-h-36 overflow-hidden rounded-3xl">
            <SafeImage
              src={galleryImage}
              alt={galleryAlt}
              fill
              className="object-cover"
              sizes="320px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-theme-hero-from/80 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
                {gallerySection?.eyebrow || "Ambience"}
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                {gallerySection?.title ||
                  "Richer storytelling with editorial photo moments."}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-theme-border bg-theme-panel p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-ink-soft">
              {deliverySection?.eyebrow || "Faster actions"}
            </p>
            <div className="mt-4 space-y-3">
              {actionLinks.map((link) => (
                <button
                  key={`${link.href}-${link.label}`}
                  className="flex w-full items-center justify-between rounded-2xl border border-theme-border bg-theme-surface px-3 py-3 text-left text-sm font-medium text-theme-ink transition-colors hover:border-theme-border-strong"
                >
                  {link.label}
                  <span className="text-theme-primary">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
