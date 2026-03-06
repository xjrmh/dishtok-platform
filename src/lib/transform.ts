import { TransformResponse } from "@/types";
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

export function buildFallbackTransform(url: string): TransformResponse {
  const hostname =
    url === "demo"
      ? "soncubano.com"
      : (() => {
          try {
            return new URL(url).hostname;
          } catch {
            return "restaurant";
          }
        })();

  const restaurantName =
    url === "demo" ? "Son Cubano" : hostnameToRestaurantName(hostname);

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
