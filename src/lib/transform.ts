import { AiRestaurantSnapshot, TransformResponse } from "@/types";
import { DEFAULT_THEME_PRESET_ID } from "@/lib/themes";

function hostnameToRestaurantName(hostname: string) {
  const normalized = hostname
    .replace(/^www\./, "")
    .split(".")[0]
    .replace(/[-_]+/g, " ")
    .trim();

  if (!normalized) return "Your Restaurant";

  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
}

function slugifyHostname(hostname: string) {
  const slug = hostname
    .replace(/^www\./, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return slug || "restaurant";
}

export function normalizeWebsiteUrl(url: string) {
  if (url === "demo") return url;

  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
}

export function buildFallbackTransform(url: string): TransformResponse {
  const normalizedUrl = normalizeWebsiteUrl(url);
  const hostname =
    normalizedUrl === "demo"
      ? "soncubano.com"
      : (() => {
          try {
            return new URL(normalizedUrl).hostname;
          } catch {
            return "restaurant";
          }
        })();

  const restaurantName =
    normalizedUrl === "demo" ? "Son Cubano" : hostnameToRestaurantName(hostname);

  return {
    restaurantName,
    recommendedThemeId: DEFAULT_THEME_PRESET_ID,
    summary: `${restaurantName} can keep its brand voice while shifting to a cleaner ordering experience with richer imagery, clearer actions, and a more polished first impression.`,
    improvements: [
      "Surface featured dishes with stronger photography and faster add-to-cart moments.",
      "Move reservations and ordering into clearer, higher-contrast calls to action.",
      "Apply a warm restaurant-focused template that feels premium on mobile and desktop.",
    ],
    fallbackUsed: true,
  };
}

export function buildFallbackSnapshot(url: string): AiRestaurantSnapshot {
  const normalizedUrl = normalizeWebsiteUrl(url);
  const hostname =
    normalizedUrl === "demo"
      ? "soncubano.com"
      : (() => {
          try {
            return new URL(normalizedUrl).hostname;
          } catch {
            return "restaurant";
          }
        })();

  const restaurantName =
    normalizedUrl === "demo" ? "Son Cubano" : hostnameToRestaurantName(hostname);
  const slug = `preview-${slugifyHostname(hostname)}`;
  const summary = `${restaurantName} can keep its brand voice while shifting to a cleaner ordering experience with richer imagery, clearer actions, and a more polished first impression.`;

  return {
    slug,
    createdAt: new Date().toISOString(),
    sourceUrl: normalizedUrl,
    recommendedThemeId: DEFAULT_THEME_PRESET_ID,
    summary,
    improvements: [
      "Surface featured dishes with stronger photography and faster add-to-cart moments.",
      "Move reservations and ordering into clearer, higher-contrast calls to action.",
      "Apply a warm restaurant-focused template that feels premium on mobile and desktop.",
    ],
    fallbackUsed: true,
    info: {
      name: restaurantName,
      slug,
      sourceUrl: normalizedUrl,
      description: summary,
      hours: [],
    },
    menu: [],
    galleryImages: [],
    deliveryLinks: [],
    capabilities: {
      hasMenu: false,
      hasReservations: false,
      hasDeliveryLinks: false,
      hasAddress: false,
      hasPhone: false,
      hasHours: false,
      hasHeroImage: false,
    },
    sections: [
      {
        id: "hero",
        type: "hero",
        eyebrow: "Fallback preview",
        title: restaurantName,
        body: summary,
      },
      {
        id: "story",
        type: "story",
        eyebrow: "Source website",
        title: `${restaurantName}, reframed.`,
        body: `DishTok prepared a safe fallback preview for ${restaurantName} while the live site analysis finishes or the source site limits direct access.`,
      },
      {
        id: "footer",
        type: "footer",
        eyebrow: "Source",
        title: restaurantName,
        body: normalizedUrl,
      },
    ],
  };
}

export function getDemoTransform(): TransformResponse {
  return {
    restaurantName: "Son Cubano",
    recommendedThemeId: DEFAULT_THEME_PRESET_ID,
    summary:
      "ChatGPT identifies a strong upscale Latin identity here, so DishTok applies a warm editorial template that spotlights signature dishes, streamlined ordering, and a more atmospheric first screen.",
    improvements: [
      "Lead with hero photography that feels destination-worthy instead of text-heavy navigation.",
      "Bring menu sections, pricing, and CTAs into a cleaner mobile-first commerce layout.",
      "Use one curated theme system across ordering, reservations, and checkout for a more premium feel.",
    ],
    fallbackUsed: false,
  };
}
