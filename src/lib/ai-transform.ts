import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { load } from "cheerio";
import OpenAI from "openai";
import { z } from "zod";
import { DEFAULT_THEME_PRESET_ID, THEME_PRESETS } from "@/lib/themes";
import {
  createGeneratedSlug,
  writeTransformSnapshot,
} from "@/lib/transform-store";
import {
  AiPageSection,
  AiRestaurantSnapshot,
  DeliveryLink,
  GalleryImage,
  MenuTab,
  RestaurantCapabilities,
  RestaurantHour,
  SourceFacts,
  SourceImageOption,
  SourceLinkOption,
  SourcePageFacts,
  TransformResponse,
} from "@/types";

const timeoutMs = 5000;
const maxHtmlLength = 50000;

const transformResponseSchema = z.object({
  restaurantName: z.string().trim().min(1).max(80),
  recommendedThemeId: z.enum([
    "terracotta-sunset",
    "olive-linen",
    "coastal-citrus",
  ]),
  summary: z.string().trim().min(1).max(280),
  improvements: z.tuple([
    z.string().trim().min(1).max(120),
    z.string().trim().min(1).max(120),
    z.string().trim().min(1).max(120),
  ]),
});

const hourSchema = z.object({
  day: z.string().trim().min(1).max(30),
  open: z.string().trim().min(1).max(30),
  close: z.string().trim().min(1).max(30),
});

const deliveryLinkSchema = z.object({
  label: z.string().trim().min(1).max(60),
  href: z.string().url(),
  kind: z.enum(["pickup", "delivery", "reservation", "direct"]),
});

const galleryImageSchema = z.object({
  src: z.string().url(),
  alt: z.string().trim().min(1).max(120),
});

const menuItemSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(280).optional().default(""),
  price: z.number().min(0).max(999),
  image: z.string().url().optional(),
  tags: z.array(z.string().trim().min(1).max(24)).max(4).optional(),
});

const menuCategorySchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(1).max(80),
  items: z.array(menuItemSchema).max(18),
});

const menuTabSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(1).max(80),
  categories: z.array(menuCategorySchema).max(8),
});

const baseSectionSchema = z.object({
  id: z.string().trim().optional(),
  eyebrow: z.string().trim().max(40).optional(),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().max(280).optional(),
});

const aiSectionSchema = z.discriminatedUnion("type", [
  baseSectionSchema.extend({
    type: z.literal("hero"),
    primaryCtaLabel: z.string().trim().max(40).optional(),
    secondaryCtaLabel: z.string().trim().max(40).optional(),
  }),
  baseSectionSchema.extend({
    type: z.literal("fact_strip"),
    facts: z
      .array(
        z.object({
          label: z.string().trim().min(1).max(30),
          value: z.string().trim().min(1).max(80),
        })
      )
      .min(1)
      .max(4)
      .optional(),
  }),
  baseSectionSchema.extend({ type: z.literal("story") }),
  baseSectionSchema.extend({ type: z.literal("menu") }),
  baseSectionSchema.extend({ type: z.literal("gallery") }),
  baseSectionSchema.extend({ type: z.literal("delivery_options") }),
  baseSectionSchema.extend({ type: z.literal("reservation") }),
  baseSectionSchema.extend({ type: z.literal("footer") }),
]);

const aiSnapshotDraftSchema = transformResponseSchema.extend({
  info: z.object({
    description: z.string().trim().max(320).optional(),
    address: z.string().trim().max(160).optional(),
    phone: z.string().trim().max(40).optional(),
    hours: z.array(hourSchema).max(7).optional(),
    heroImage: z.string().url().optional(),
    cuisine: z.string().trim().max(80).optional(),
    priceRange: z.string().trim().max(12).optional(),
  }),
  menu: z.array(menuTabSchema).max(6).optional().default([]),
  galleryImages: z.array(galleryImageSchema).max(6).optional().default([]),
  deliveryLinks: z.array(deliveryLinkSchema).max(6).optional().default([]),
  sections: z.array(aiSectionSchema).min(1).max(8),
});

type InternalPageKind = SourcePageFacts["kind"];

type ExtractedPage = {
  page: SourcePageFacts;
  candidateName?: string;
  candidateDescription?: string;
  candidateAddress?: string;
  candidatePhone?: string;
  candidateHours: RestaurantHour[];
  candidateCuisine?: string;
  candidatePriceRange?: string;
  candidateMenu: MenuTab[];
};

const MENU_HEADING_BLOCKLIST = new Set([
  "menu",
  "dinner menu",
  "lunch menu",
  "brunch menu",
  "drinks menu",
  "dessert menu",
  "wine list",
  "cocktail list",
  "hours",
  "contact",
  "reservations",
  "gallery",
]);

const TOKEN_BLOCKLIST = new Set([
  "and",
  "the",
  "with",
  "for",
  "from",
  "our",
  "your",
  "dish",
  "plate",
  "restaurant",
  "menu",
]);

const CURATED_DISH_IMAGE_MATCHERS: Array<{
  keywords: string[];
  src: string;
  alt: string;
}> = [
  {
    keywords: ["steak", "porterhouse", "ribeye", "filet", "chop", "prime rib"],
    src: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    alt: "Seared steak plated in a restaurant dining room",
  },
  {
    keywords: ["lobster", "shrimp", "prawn", "scampi"],
    src: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    alt: "Seafood dish with lobster and shellfish",
  },
  {
    keywords: ["oyster", "clam", "mussel", "raw bar"],
    src: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80",
    alt: "Fresh oysters served on ice",
  },
  {
    keywords: ["salmon", "branzino", "snapper", "fish", "tuna", "sea bass"],
    src: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80",
    alt: "Fresh fish entree plated with herbs",
  },
  {
    keywords: ["sushi", "sashimi", "roll", "nigiri"],
    src: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80",
    alt: "Assorted sushi served on a dark plate",
  },
  {
    keywords: ["salad", "caesar", "greens", "caprese"],
    src: "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=1200&q=80",
    alt: "Fresh composed salad in a shallow bowl",
  },
  {
    keywords: ["pasta", "gnocchi", "risotto"],
    src: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=80",
    alt: "Restaurant pasta dish with sauce and herbs",
  },
  {
    keywords: ["chicken", "duck", "turkey"],
    src: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1200&q=80",
    alt: "Roasted poultry entree plated for dinner service",
  },
  {
    keywords: ["burger", "sandwich", "sliders"],
    src: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
    alt: "Restaurant burger served on a plate",
  },
  {
    keywords: ["dessert", "cake", "pie", "tart", "sundae", "ice cream"],
    src: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=80",
    alt: "Dessert course plated with cream and garnish",
  },
  {
    keywords: ["cocktail", "martini", "mojito", "spritz", "wine"],
    src: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80",
    alt: "Craft cocktail served in a restaurant bar",
  },
  {
    keywords: ["ceviche", "crudo", "tartare"],
    src: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80",
    alt: "Citrus seafood appetizer plated for service",
  },
];

function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(value: string | undefined | null) {
  if (!value) return undefined;
  const normalized = stripHtml(value).trim();
  return normalized || undefined;
}

function tokenizeForMatching(value: string | undefined | null) {
  return (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !TOKEN_BLOCKLIST.has(token));
}

function uniqueTokens(...values: Array<string | undefined | null>) {
  return [...new Set(values.flatMap((value) => tokenizeForMatching(value)))];
}

function inferMenuTabName(
  kind: InternalPageKind,
  title?: string,
  firstHeading?: string,
  url?: string
) {
  const candidates = [firstHeading, title, url]
    .filter(Boolean)
    .map((value) => value!.toLowerCase());

  if (candidates.some((value) => value.includes("lunch"))) return "Lunch";
  if (candidates.some((value) => value.includes("brunch"))) return "Brunch";
  if (candidates.some((value) => value.includes("dessert"))) return "Dessert";
  if (candidates.some((value) => value.includes("drink"))) return "Drinks";
  if (candidates.some((value) => value.includes("wine"))) return "Wine";
  if (candidates.some((value) => value.includes("cocktail"))) return "Cocktails";
  if (kind === "menu") return "Menu";
  return "Highlights";
}

function looksLikeMenuHeading(value: string) {
  const normalized = value.toLowerCase().trim();
  if (!normalized || MENU_HEADING_BLOCKLIST.has(normalized)) return false;
  if (normalized.length > 60) return false;
  return true;
}

function parseMenuPrice(value: string) {
  const matches = [...value.matchAll(/\$?\d{2,3}(?:\.\d{2})?/g)];
  const last = matches.at(-1)?.[0];
  if (!last) return null;

  const price = Number(last.replace(/^\$/, ""));
  return Number.isFinite(price) ? price : null;
}

function normalizeDescriptionText(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s+\./g, ".")
    .trim();
}

function parseMenuItemLine(value: string) {
  const text = cleanText(value);
  if (!text || text.length < 5 || text.length > 220) return null;

  const price = parseMenuPrice(text);
  if (price === null) return null;

  const priceMatch = [...text.matchAll(/\$?\d{2,3}(?:\.\d{2})?/g)].at(-1);
  if (!priceMatch || typeof priceMatch.index !== "number") return null;

  const beforePrice = text.slice(0, priceMatch.index).trim();
  if (!beforePrice || beforePrice.length < 3) return null;

  const normalizedBeforePrice = beforePrice
    .replace(/\s{2,}/g, " ")
    .replace(/\s+\($/, "(")
    .trim();

  const split = normalizedBeforePrice.match(
    /^([A-Z0-9&'’\-/().,\s]{3,}?)(?:\s{2,}|\s+-\s+|:\s+)(.+)$/
  );

  const rawName = split?.[1] || normalizedBeforePrice;
  const rawDescription = split?.[2];
  const name = normalizeDescriptionText(rawName)
    .replace(/\s+\(([^)]+)\)\s*$/, " ($1)")
    .trim();

  if (name.length < 3 || name.length > 120) return null;

  return {
    name,
    description: rawDescription ? normalizeDescriptionText(rawDescription) : "",
    price,
  };
}

function appendDescriptionToLastItem(
  categories: MenuTab["categories"],
  value: string
) {
  const category = categories.at(-1);
  const item = category?.items.at(-1);
  const text = cleanText(value);
  if (!item || !text) return false;
  if (text.length < 8 || text.length > 220) return false;
  if (parseMenuPrice(text) !== null) return false;
  if (/^(menu|hours|reservations|contact)$/i.test(text)) return false;

  item.description = item.description
    ? `${item.description} ${normalizeDescriptionText(text)}`
    : normalizeDescriptionText(text);
  return true;
}

function extractStructuredMenu(
  $: ReturnType<typeof load>,
  kind: InternalPageKind,
  title?: string,
  firstHeading?: string,
  url?: string
) {
  const tabName = inferMenuTabName(kind, title, firstHeading, url);
  const tab: MenuTab = {
    id: `tab-${sanitizeId(tabName, "menu")}`,
    name: tabName,
    categories: [],
  };

  const headings = $("h2, h3, h4").toArray();
  for (const heading of headings) {
    const headingText = cleanText($(heading).text());
    if (!headingText || !looksLikeMenuHeading(headingText)) continue;

    const category = {
      id: `category-${sanitizeId(headingText, String(tab.categories.length + 1))}`,
      name: headingText,
      items: [] as MenuTab["categories"][number]["items"],
    };

    let node = $(heading).next();
    while (node.length > 0) {
      const tagName = node.get(0)?.tagName?.toLowerCase();
      if (tagName && /^h[1-4]$/.test(tagName)) break;

      if (tagName === "ul" || tagName === "ol") {
        node.find("li").each((_, element) => {
          const parsed = parseMenuItemLine($(element).text());
          if (parsed) {
            category.items.push({
              id: `item-${sanitizeId(parsed.name, String(category.items.length + 1))}`,
              name: parsed.name,
              description: parsed.description,
              price: parsed.price,
            });
          } else {
            appendDescriptionToLastItem([category], $(element).text());
          }
        });
      } else {
        const parsed = parseMenuItemLine(node.text());
        if (parsed) {
          category.items.push({
            id: `item-${sanitizeId(parsed.name, String(category.items.length + 1))}`,
            name: parsed.name,
            description: parsed.description,
            price: parsed.price,
          });
        } else {
          appendDescriptionToLastItem([category], node.text());
        }
      }

      node = node.next();
    }

    if (category.items.length > 0) {
      tab.categories.push(category);
    }
  }

  if (tab.categories.length > 0) {
    return [tab];
  }

  if (kind !== "menu") {
    return [];
  }

  const fallbackItems = $("li, p, div")
    .map((_, element) => parseMenuItemLine($(element).text()))
    .get()
    .filter(Boolean)
    .slice(0, 18) as Array<{ name: string; description: string; price: number }>;

  if (fallbackItems.length === 0) {
    return [];
  }

  return [
    {
      id: `tab-${sanitizeId(tabName, "menu")}`,
      name: tabName,
      categories: [
        {
          id: "category-featured",
          name: "Featured",
          items: fallbackItems.map((item, index) => ({
            id: `item-${sanitizeId(item.name, String(index + 1))}`,
            name: item.name,
            description: item.description,
            price: item.price,
          })),
        },
      ],
    },
  ];
}

function dedupeStrings(values: Array<string | undefined>, limit: number) {
  return [...new Set(values.filter(Boolean) as string[])].slice(0, limit);
}

function sanitizeId(value: string, fallback: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return normalized || fallback;
}

function hostnameToRestaurantName(hostname: string) {
  const normalized = hostname
    .replace(/^www\./, "")
    .split(".")[0]
    .replace(/[-_]+/g, " ")
    .trim();

  if (!normalized) return "Your Restaurant";

  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
}

function isPrivateIpv4(address: string) {
  const octets = address.split(".").map((part) => Number(part));
  if (octets.length !== 4 || octets.some(Number.isNaN)) return false;

  const [a, b] = octets;
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

function isPrivateIpv6(address: string) {
  const normalized = address.toLowerCase().split("%")[0];
  if (normalized === "::1") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (normalized.startsWith("fe8") || normalized.startsWith("fe9")) return true;
  if (normalized.startsWith("fea") || normalized.startsWith("feb")) return true;
  if (normalized.startsWith("::ffff:")) {
    return isPrivateIpv4(normalized.replace("::ffff:", ""));
  }
  return false;
}

function isPrivateAddress(address: string) {
  const family = isIP(address);
  if (family === 4) return isPrivateIpv4(address);
  if (family === 6) return isPrivateIpv6(address);
  return false;
}

function isBlockedHostname(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  );
}

export async function validatePublicUrl(rawUrl: string) {
  const normalizedUrl = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(rawUrl.trim())
    ? rawUrl.trim()
    : `https://${rawUrl.trim()}`;
  const url = new URL(normalizedUrl);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http and https URLs are supported.");
  }

  if (url.username || url.password) {
    throw new Error("URLs with embedded credentials are not allowed.");
  }

  const hostname = url.hostname.toLowerCase();
  if (isBlockedHostname(hostname)) {
    throw new Error("Private or localhost URLs are not allowed.");
  }

  if (isIP(hostname) && isPrivateAddress(hostname)) {
    throw new Error("Private-network URLs are not allowed.");
  }

  const resolved = await lookup(hostname, { all: true, verbatim: true });
  if (
    resolved.length === 0 ||
    resolved.some((entry) => isPrivateAddress(entry.address))
  ) {
    throw new Error("Private-network URLs are not allowed.");
  }

  return url;
}

function normalizeUrl(baseUrl: URL, value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();

  if (
    !trimmed ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("mailto:")
  ) {
    return null;
  }

  try {
    return new URL(trimmed, baseUrl);
  } catch {
    return null;
  }
}

function normalizeImageUrl(baseUrl: URL, value?: string | null) {
  const url = normalizeUrl(baseUrl, value);
  if (!url) return null;
  if (!["http:", "https:"].includes(url.protocol)) return null;
  return url.toString();
}

function deriveLinkKind(label: string, href: string): SourceLinkOption["kind"] {
  const haystack = `${label} ${href}`.toLowerCase();

  if (/(menu|food|dinner|brunch|drinks)/.test(haystack)) return "menu";
  if (/(about|story|chef|our team)/.test(haystack)) return "about";
  if (/(reserv|book|table)/.test(haystack)) return "reservation";
  if (/(order|pickup|carryout|takeout)/.test(haystack)) return "order";
  if (/(doordash|uber eats|grubhub|delivery)/.test(haystack)) return "delivery";
  if (/(contact|hours|location|visit)/.test(haystack)) return "contact";
  return "other";
}

function parseJsonLd($: ReturnType<typeof load>) {
  const values: Array<Record<string, unknown>> = [];

  $('script[type="application/ld+json"]').each((_, element) => {
    const text = $(element).contents().text();
    if (!text.trim()) return;

    try {
      const parsed = JSON.parse(text);
      const queue = Array.isArray(parsed) ? parsed : [parsed];

      for (const item of queue) {
        if (!item || typeof item !== "object") continue;

        if (Array.isArray((item as Record<string, unknown>)["@graph"])) {
          for (const nested of (item as Record<string, unknown>)["@graph"] as unknown[]) {
            if (nested && typeof nested === "object") {
              values.push(nested as Record<string, unknown>);
            }
          }
        } else {
          values.push(item as Record<string, unknown>);
        }
      }
    } catch {
      // ignore invalid json-ld blocks
    }
  });

  return values;
}

function getJsonLdRestaurantEntity(values: Array<Record<string, unknown>>) {
  return values.find((item) => {
    const typeValue = item["@type"];
    const types = Array.isArray(typeValue) ? typeValue : [typeValue];
    return types.some((type) => {
      if (typeof type !== "string") return false;
      return /restaurant|foodestablishment|localbusiness/i.test(type);
    });
  });
}

function parseOpeningHours(value: unknown): RestaurantHour[] {
  if (!Array.isArray(value)) return [];

  const hours = value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const dayValue = (entry as Record<string, unknown>).dayOfWeek;
      const opens = cleanText((entry as Record<string, unknown>).opens as string);
      const closes = cleanText((entry as Record<string, unknown>).closes as string);
      const day = Array.isArray(dayValue)
        ? cleanText(
            dayValue
              .map((item) =>
                typeof item === "string" ? item.replace(/^https?:\/\/schema.org\//, "") : ""
              )
              .join(", ")
          )
        : typeof dayValue === "string"
          ? cleanText(dayValue.replace(/^https?:\/\/schema.org\//, ""))
          : undefined;

      if (!day || !opens || !closes) return null;

      return {
        day,
        open: opens,
        close: closes,
      };
    })
    .filter(Boolean) as RestaurantHour[];

  return hours.slice(0, 7);
}

function extractPhone(docText: string, telLinks: string[]) {
  const direct = telLinks[0]?.replace(/^tel:/i, "").trim();
  if (direct) return direct;

  return cleanText(
    docText.match(
      /(?:\+?1[\s.-]*)?(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}/
    )?.[0]
  );
}

function extractAddress($: ReturnType<typeof load>, docText: string) {
  const addressTag = cleanText($("address").first().text());
  if (addressTag) return addressTag;

  const line = docText
    .split(/\n+/)
    .map((item) => item.trim())
    .find((item) =>
      /\d{1,5}.+(street|st\.|avenue|ave\.|road|rd\.|boulevard|blvd\.|lane|ln\.|drive|dr\.|place|pl\.)/i.test(
        item
      )
    );

  return cleanText(line);
}

function extractHoursFromText(docText: string) {
  const lines = docText
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

  const extracted: RestaurantHour[] = [];

  for (const line of lines) {
    const match = line.match(
      /(mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)(?:\s*[-–]\s*(mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?))?[^0-9a-zA-Z]*(\d{1,2}(?::\d{2})?\s?(?:AM|PM|am|pm))[^0-9a-zA-Z]+(\d{1,2}(?::\d{2})?\s?(?:AM|PM|am|pm))/i
    );
    if (!match) continue;

    extracted.push({
      day: cleanText(
        [match[1], match[2]].filter(Boolean).join("-").replace(/\s+/g, "")
      ) || "Hours",
      open: match[3].toUpperCase(),
      close: match[4].toUpperCase(),
    });
  }

  return extracted.slice(0, 7);
}

function dedupeLinks(links: SourceLinkOption[]) {
  const map = new Map<string, SourceLinkOption>();
  for (const link of links) {
    if (!map.has(link.href)) {
      map.set(link.href, link);
    }
  }
  return [...map.values()];
}

function dedupeImages(images: SourceImageOption[]) {
  const map = new Map<string, SourceImageOption>();
  for (const image of images) {
    if (!map.has(image.src)) {
      map.set(image.src, image);
    }
  }
  return [...map.values()];
}

async function fetchHtml(url: URL) {
  const response = await fetch(url, {
    headers: {
      accept: "text/html,application/xhtml+xml",
      "user-agent":
        "DishTok Transform Bot/1.0 (+https://dishtok.example/transform)",
    },
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Metadata fetch failed with status ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    throw new Error("The target URL did not return HTML.");
  }

  return {
    html: (await response.text()).slice(0, maxHtmlLength),
    finalUrl: new URL(response.url),
  };
}

function extractPage(baseUrl: URL, html: string, kind: InternalPageKind): ExtractedPage {
  const $ = load(html);
  const jsonLdValues = parseJsonLd($);
  const restaurantEntity = getJsonLdRestaurantEntity(jsonLdValues);
  const bodyText = $("body").text();

  const title = cleanText($("title").first().text());
  const metaDescription = cleanText(
    $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content")
  );
  const firstHeading = cleanText($("h1").first().text());
  const paragraphs = dedupeStrings(
    $("p")
      .map((_, element) => cleanText($(element).text()))
      .get()
      .filter((value) => value && value.length > 35 && value.length < 320),
    18
  );
  const headings = dedupeStrings(
    $("h1,h2,h3")
      .map((_, element) => cleanText($(element).text()))
      .get()
      .filter((value) => value && value.length <= 120),
    14
  );
  const menuLines = dedupeStrings(
    $("li,p,div,span")
      .map((_, element) => cleanText($(element).text()))
      .get()
      .filter(
        (value) =>
          value &&
          value.length > 6 &&
          value.length < 180 &&
          /\$\s?\d{1,3}(?:\.\d{2})?/.test(value)
      ),
    40
  );

  const links = dedupeLinks(
    $("a[href]")
      .map((_, element) => {
        const href = normalizeUrl(baseUrl, $(element).attr("href"));
        if (!href) return null;

        const label =
          cleanText($(element).text()) ||
          cleanText($(element).attr("aria-label")) ||
          href.hostname;

        if (!label) return null;

        return {
          label,
          href: href.toString(),
          kind: deriveLinkKind(label, href.toString()),
        } satisfies SourceLinkOption;
      })
      .get()
      .filter(Boolean) as SourceLinkOption[]
  );

  const metaImages = [
    normalizeImageUrl(
      baseUrl,
      $('meta[property="og:image"]').attr("content") ||
        $('meta[name="twitter:image"]').attr("content")
    ),
  ]
    .filter(Boolean)
    .map((src) => ({
      src: src as string,
      alt: title || firstHeading,
      pageUrl: baseUrl.toString(),
    }));

  const images = dedupeImages([
    ...metaImages,
    ...($("img[src]")
      .map((_, element) => {
        const src = normalizeImageUrl(baseUrl, $(element).attr("src"));
        if (!src) return null;
        return {
          src,
          alt: cleanText($(element).attr("alt")) || title || firstHeading,
          pageUrl: baseUrl.toString(),
        } satisfies SourceImageOption;
      })
      .get()
      .filter(Boolean) as SourceImageOption[]),
  ]).slice(0, 18);

  const telLinks = $("a[href^='tel:']")
    .map((_, element) => $(element).attr("href") || "")
    .get();

  const candidateHours = restaurantEntity
    ? parseOpeningHours(
        (restaurantEntity as Record<string, unknown>).openingHoursSpecification
      )
    : extractHoursFromText(bodyText);
  const candidateMenu = extractStructuredMenu(
    $,
    kind,
    title,
    firstHeading,
    baseUrl.toString()
  );

  return {
    page: {
      url: baseUrl.toString(),
      kind,
      title,
      metaDescription,
      firstHeading,
      headings,
      paragraphs,
      menuLines,
      links,
      images,
    },
    candidateName:
      cleanText((restaurantEntity as Record<string, unknown> | undefined)?.name as string) ||
      firstHeading ||
      title,
    candidateDescription:
      cleanText(
        (restaurantEntity as Record<string, unknown> | undefined)?.description as string
      ) ||
      metaDescription ||
      paragraphs[0],
    candidateAddress:
      cleanText(
        [
          (restaurantEntity as Record<string, unknown> | undefined)?.address &&
          typeof (restaurantEntity as Record<string, unknown>).address === "object"
            ? Object.values(
                (restaurantEntity as Record<string, unknown>).address as Record<
                  string,
                  unknown
                >
              )
                .filter((value) => typeof value === "string")
                .join(", ")
            : undefined,
        ]
          .filter(Boolean)
          .join(", ")
      ) || extractAddress($, bodyText),
    candidatePhone:
      cleanText(
        (restaurantEntity as Record<string, unknown> | undefined)?.telephone as string
      ) || extractPhone(bodyText, telLinks),
    candidateHours,
    candidateCuisine: cleanText(
      Array.isArray(
        (restaurantEntity as Record<string, unknown> | undefined)?.servesCuisine
      )
        ? (
            (restaurantEntity as Record<string, unknown>).servesCuisine as unknown[]
          )
            .filter((item) => typeof item === "string")
            .join(", ")
        : ((restaurantEntity as Record<string, unknown> | undefined)
            ?.servesCuisine as string)
    ),
    candidatePriceRange:
      cleanText(
        (restaurantEntity as Record<string, unknown> | undefined)?.priceRange as string
      ) || cleanText(bodyText.match(/\${1,4}/)?.[0]),
    candidateMenu,
  };
}

function scoreLink(link: SourceLinkOption, kind: InternalPageKind) {
  const haystack = `${link.label} ${link.href}`.toLowerCase();
  const pathname = (() => {
    try {
      return new URL(link.href).pathname.toLowerCase();
    } catch {
      return "";
    }
  })();

  let score = 0;
  if (kind === "menu" && /(menu|food|dining|brunch|drinks)/.test(haystack)) score += 5;
  if (kind === "about" && /(about|story|chef|our team)/.test(haystack)) score += 5;
  if (
    kind === "contact" &&
    /(contact|hours|location|visit|reserv|book|table)/.test(haystack)
  ) {
    score += 5;
  }

  if (pathname.includes(kind)) score += 2;
  if (pathname.split("/").length <= 3) score += 1;
  return score;
}

function countMenuItems(menu: MenuTab[]) {
  return menu.reduce(
    (total, tab) =>
      total +
      tab.categories.reduce((categoryTotal, category) => categoryTotal + category.items.length, 0),
    0
  );
}

function mergeCandidateMenus(menus: MenuTab[][]) {
  const tabMap = new Map<string, MenuTab>();

  for (const tabs of menus) {
    for (const tab of tabs) {
      const tabKey = tab.name.toLowerCase();
      const existingTab = tabMap.get(tabKey) || {
        id: tab.id,
        name: tab.name,
        categories: [],
      };

      const categoryMap = new Map(
        existingTab.categories.map((category) => [category.name.toLowerCase(), category] as const)
      );

      for (const category of tab.categories) {
        const categoryKey = category.name.toLowerCase();
        const existingCategory = categoryMap.get(categoryKey) || {
          id: category.id,
          name: category.name,
          items: [],
        };

        const itemMap = new Map(
          existingCategory.items.map((item) => [item.name.toLowerCase(), item] as const)
        );

        for (const item of category.items) {
          const itemKey = item.name.toLowerCase();
          if (!itemMap.has(itemKey)) {
            itemMap.set(itemKey, item);
          } else {
            const existingItem = itemMap.get(itemKey)!;
            if (!existingItem.description && item.description) {
              existingItem.description = item.description;
            }
            if (!existingItem.image && item.image) {
              existingItem.image = item.image;
            }
          }
        }

        existingCategory.items = [...itemMap.values()].slice(0, 18);
        categoryMap.set(categoryKey, existingCategory);
      }

      existingTab.categories = [...categoryMap.values()]
        .filter((category) => category.items.length > 0)
        .slice(0, 8);
      tabMap.set(tabKey, existingTab);
    }
  }

  return [...tabMap.values()].filter((tab) => tab.categories.length > 0).slice(0, 6);
}

function getCuratedDishImage(
  itemName: string,
  categoryName?: string,
  tabName?: string,
  cuisine?: string
) {
  const haystack = `${itemName} ${categoryName || ""} ${tabName || ""} ${cuisine || ""}`.toLowerCase();
  const match = CURATED_DISH_IMAGE_MATCHERS.find(({ keywords }) =>
    keywords.some((keyword) => haystack.includes(keyword))
  );

  return match ? { src: match.src, alt: match.alt } : null;
}

function resolveMenuImage(
  itemName: string,
  categoryName: string,
  tabName: string,
  facts: SourceFacts,
  cuisine?: string
) {
  const dishTokens = uniqueTokens(itemName, categoryName, tabName, cuisine);
  let bestImage: SourceImageOption | null = null;
  let bestScore = 0;

  for (const image of facts.candidateImages) {
    const imageTokens = uniqueTokens(image.alt, image.pageUrl);
    const overlap = dishTokens.filter((token) => imageTokens.includes(token));
    let score = overlap.length * 4;

    if (image.alt) {
      const altLower = image.alt.toLowerCase();
      if (altLower.includes(itemName.toLowerCase())) score += 8;
      if (altLower.includes(categoryName.toLowerCase())) score += 3;
    }

    if ((image.pageUrl || "").toLowerCase().includes("gallery")) score += 1;
    if (score > bestScore) {
      bestScore = score;
      bestImage = image;
    }
  }

  if (bestImage && bestScore >= 4) {
    return {
      src: bestImage.src,
      alt: bestImage.alt || itemName,
    };
  }

  return getCuratedDishImage(itemName, categoryName, tabName, cuisine);
}

function applyMenuImages(menu: MenuTab[], facts: SourceFacts, cuisine?: string) {
  return menu.map((tab) => ({
    ...tab,
    categories: tab.categories.map((category) => ({
      ...category,
      items: category.items.map((item) => {
        if (item.image) return item;

        const resolved = resolveMenuImage(
          item.name,
          category.name,
          tab.name,
          facts,
          cuisine
        );

        return resolved
          ? {
              ...item,
              image: resolved.src,
            }
          : item;
      }),
    })),
  }));
}

function buildMenuFromFacts(facts: SourceFacts, cuisine?: string) {
  return applyMenuImages(facts.candidateMenu, facts, cuisine);
}

function mergeMenus(primary: MenuTab[], secondary: MenuTab[]) {
  return mergeCandidateMenus([primary, secondary]);
}

async function crawlSourceFacts(url: URL): Promise<SourceFacts> {
  const { html, finalUrl } = await fetchHtml(url);
  const submitted = extractPage(finalUrl, html, "submitted");

  const sameOriginLinks = submitted.page.links.filter((link) => {
    try {
      return new URL(link.href).origin === finalUrl.origin;
    } catch {
      return false;
    }
  });

  const crawledUrls = new Set([submitted.page.url]);
  const extractedPages: ExtractedPage[] = [submitted];

  for (const kind of ["menu", "about", "contact"] as const) {
    const candidate = sameOriginLinks
      .filter((link) => !crawledUrls.has(link.href))
      .sort((a, b) => scoreLink(b, kind) - scoreLink(a, kind))[0];

    if (!candidate || scoreLink(candidate, kind) <= 0) continue;

    try {
      const fetched = await fetchHtml(new URL(candidate.href));
      const extracted = extractPage(fetched.finalUrl, fetched.html, kind);
      extractedPages.push(extracted);
      crawledUrls.add(extracted.page.url);
    } catch {
      // ignore individual crawl failures
    }
  }

  const pages = extractedPages.map((entry) => entry.page);
  const candidateLinks = dedupeLinks(
    extractedPages.flatMap((entry) => entry.page.links)
  );
  const candidateImages = dedupeImages(
    extractedPages.flatMap((entry) => entry.page.images)
  );
  const candidateMenu = mergeCandidateMenus(
    extractedPages.map((entry) => entry.candidateMenu)
  );

  return {
    sourceUrl: finalUrl.toString(),
    hostname: finalUrl.hostname,
    pages,
    candidateName:
      extractedPages.find((entry) => entry.page.kind === "submitted")?.candidateName ||
      extractedPages.find((entry) => entry.candidateName)?.candidateName,
    candidateDescription:
      extractedPages.find((entry) => entry.page.kind === "submitted")
        ?.candidateDescription ||
      extractedPages.find((entry) => entry.candidateDescription)
        ?.candidateDescription,
    candidateAddress: extractedPages.find((entry) => entry.candidateAddress)
      ?.candidateAddress,
    candidatePhone: extractedPages.find((entry) => entry.candidatePhone)?.candidatePhone,
    candidateHours:
      extractedPages.find((entry) => entry.candidateHours.length > 0)?.candidateHours ||
      [],
    candidateCuisine:
      extractedPages.find((entry) => entry.candidateCuisine)?.candidateCuisine,
    candidatePriceRange:
      extractedPages.find((entry) => entry.candidatePriceRange)
        ?.candidatePriceRange,
    candidateMenu,
    candidateImages,
    candidateLinks,
  };
}

function buildFactStripFacts(
  draftFacts: Array<{ label: string; value: string }> | undefined,
  info: AiRestaurantSnapshot["info"],
  deliveryLinks: DeliveryLink[]
) {
  if (draftFacts?.length) {
    return draftFacts.slice(0, 4);
  }

  const facts = [
    info.cuisine ? { label: "Cuisine", value: info.cuisine } : null,
    info.priceRange ? { label: "Pricing", value: info.priceRange } : null,
    info.address ? { label: "Location", value: info.address } : null,
    info.hours[0]
      ? {
          label: "Hours",
          value: `${info.hours[0].day} ${info.hours[0].open}-${info.hours[0].close}`,
        }
      : null,
    deliveryLinks.length
      ? {
          label: "Delivery",
          value: deliveryLinks.map((link) => link.label).join(", "),
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return facts.slice(0, 4);
}

function deriveCapabilities(
  info: AiRestaurantSnapshot["info"],
  menu: MenuTab[],
  deliveryLinks: DeliveryLink[]
): RestaurantCapabilities {
  return {
    hasMenu: menu.some((tab) =>
      tab.categories.some((category) => category.items.length > 0)
    ),
    hasReservations:
      deliveryLinks.some((link) => link.kind === "reservation") ||
      Boolean(info.phone) ||
      Boolean(info.address),
    hasDeliveryLinks: deliveryLinks.some((link) => link.kind === "delivery"),
    hasAddress: Boolean(info.address),
    hasPhone: Boolean(info.phone),
    hasHours: info.hours.length > 0,
    hasHeroImage: Boolean(info.heroImage),
  };
}

function shouldKeepSection(
  type: AiPageSection["type"],
  capabilities: RestaurantCapabilities
) {
  if (type === "menu") return capabilities.hasMenu;
  if (type === "delivery_options") return capabilities.hasDeliveryLinks;
  if (type === "reservation") return capabilities.hasReservations;
  if (type === "gallery") return capabilities.hasHeroImage;
  if (type === "fact_strip") {
    return (
      capabilities.hasAddress ||
      capabilities.hasHours ||
      capabilities.hasPhone ||
      capabilities.hasDeliveryLinks
    );
  }
  return true;
}

function defaultSections(
  info: AiRestaurantSnapshot["info"],
  capabilities: RestaurantCapabilities
): AiPageSection[] {
  const sections: AiPageSection[] = [
    {
      id: "hero",
      type: "hero",
      eyebrow: "AI Transform",
      title: info.name,
      body:
        info.description ||
        `A cleaner digital front door for ${info.name}, built from live website signals.`,
      primaryCtaLabel: capabilities.hasMenu ? "Order Now" : undefined,
      secondaryCtaLabel: capabilities.hasReservations
        ? "Make a Reservation"
        : undefined,
    },
  ];

  if (shouldKeepSection("fact_strip", capabilities)) {
    sections.push({
      id: "fact-strip",
      type: "fact_strip",
      eyebrow: "Quick facts",
    });
  }

  sections.push({
    id: "story",
    type: "story",
    eyebrow: "Brand Story",
    title: `A warmer first impression for ${info.name}.`,
    body:
      info.description ||
      `${info.name} can shift from a dated web presence to a clearer, more polished restaurant experience.`,
  });

  if (capabilities.hasMenu) {
    sections.push({
      id: "menu",
      type: "menu",
      eyebrow: "Menu",
      title: "Our Menu",
      body: "Browse the dishes and pricing that surfaced from the public site.",
    });
  }

  if (capabilities.hasHeroImage) {
    sections.push({
      id: "gallery",
      type: "gallery",
      eyebrow: "Signature moments",
      title: "Atmosphere and signature dishes, reframed.",
      body: "Visual storytelling helps the dining experience feel more premium and easier to explore.",
    });
  }

  if (capabilities.hasDeliveryLinks) {
    sections.push({
      id: "delivery",
      type: "delivery_options",
      eyebrow: "Ordering",
      title: "Choose how to order.",
      body: "Direct links to the delivery and pickup options already present on the source site.",
    });
  }

  if (capabilities.hasReservations) {
    sections.push({
      id: "reservation",
      type: "reservation",
      eyebrow: "Reservations",
      title: "Plan your visit.",
      body: "A cleaner reservation path, grounded in the contact and reservation signals found on the site.",
    });
  }

  sections.push({
    id: "footer",
    type: "footer",
    eyebrow: "Contact",
    title: info.name,
    body: info.description,
  });

  return sections;
}

function normalizeMenu(
  menu: z.infer<typeof menuTabSchema>[],
  facts: SourceFacts,
  cuisine?: string
) {
  const normalized = menu
    .map((tab, tabIndex) => ({
      id: tab.id || `tab-${sanitizeId(tab.name, String(tabIndex + 1))}`,
      name: tab.name,
      categories: tab.categories
        .map((category, categoryIndex) => ({
          id:
            category.id ||
            `category-${sanitizeId(category.name, String(categoryIndex + 1))}`,
          name: category.name,
          items: category.items
            .map((item, itemIndex) => ({
              id:
                item.id ||
                `item-${sanitizeId(item.name, String(itemIndex + 1))}`,
              name: item.name,
              description: item.description || "",
              price: item.price,
              image: item.image,
              tags: item.tags?.slice(0, 4),
            }))
            .filter((item) => item.name && Number.isFinite(item.price)),
        }))
        .filter((category) => category.items.length > 0),
    }))
    .filter((tab) => tab.categories.length > 0) satisfies MenuTab[];

  return applyMenuImages(normalized, facts, cuisine);
}

function normalizeDeliveryLinks(
  links: z.infer<typeof deliveryLinkSchema>[],
  facts: SourceFacts
) {
  const validLinks = new Map(
    facts.candidateLinks.map((link) => [link.href, link] as const)
  );

  const normalized = links
    .map((link) => {
      const candidate = validLinks.get(link.href);
      if (!candidate) return null;

      return {
        label: link.label || candidate.label,
        href: candidate.href,
        kind: link.kind,
      } satisfies DeliveryLink;
    })
    .filter(Boolean) as DeliveryLink[];

  if (normalized.length > 0) {
    return normalized.slice(0, 4);
  }

  return facts.candidateLinks
    .filter((link) =>
      ["delivery", "order", "reservation"].includes(link.kind)
    )
    .slice(0, 4)
    .map((link) => ({
      label: link.label,
      href: link.href,
      kind:
        link.kind === "reservation"
          ? "reservation"
          : link.kind === "delivery"
            ? "delivery"
            : "direct",
    }) satisfies DeliveryLink);
}

function normalizeGalleryImages(
  images: z.infer<typeof galleryImageSchema>[],
  facts: SourceFacts,
  heroImage?: string
) {
  const validImages = new Map(
    facts.candidateImages.map((image) => [image.src, image] as const)
  );

  const normalized = images
    .map((image) => {
      if (!validImages.has(image.src)) return null;
      return image satisfies GalleryImage;
    })
    .filter(Boolean) as GalleryImage[];

  if (normalized.length > 0) {
    return normalized.slice(0, 4);
  }

  const fallback = facts.candidateImages
    .slice(0, 4)
    .map((image) => ({
      src: image.src,
      alt: image.alt || "Restaurant image",
    }));

  if (fallback.length > 0) return fallback;

  return heroImage
    ? [{ src: heroImage, alt: "Restaurant hero image" }]
    : [];
}

function normalizeSections(
  sections: z.infer<typeof aiSectionSchema>[],
  info: AiRestaurantSnapshot["info"],
  capabilities: RestaurantCapabilities,
  deliveryLinks: DeliveryLink[]
) {
  const filtered = sections
    .filter((section) => shouldKeepSection(section.type, capabilities))
    .map((section, index) => {
      const id =
        section.id ||
        sanitizeId(section.type === "fact_strip" ? "fact-strip" : section.type, `section-${index + 1}`);

      if (section.type === "fact_strip") {
        return {
          ...section,
          id,
          eyebrow: section.eyebrow || "Quick facts",
          facts: buildFactStripFacts(section.facts, info, deliveryLinks),
        };
      }

      if (section.type === "hero") {
        return {
          ...section,
          id,
          eyebrow: section.eyebrow || "AI Transform",
          title: section.title || info.name,
          body: section.body || info.description,
          primaryCtaLabel:
            section.primaryCtaLabel ||
            (capabilities.hasMenu ? "Order Now" : undefined),
          secondaryCtaLabel:
            section.secondaryCtaLabel ||
            (capabilities.hasReservations ? "Make a Reservation" : undefined),
        };
      }

      return {
        ...section,
        id,
      };
    }) as AiPageSection[];

  const defaulted = filtered.length > 0 ? filtered : defaultSections(info, capabilities);

  const hasHero = defaulted.some((section) => section.type === "hero");
  const hasFooter = defaulted.some((section) => section.type === "footer");

  const completed = [...defaulted];
  if (!hasHero) {
    completed.unshift(defaultSections(info, capabilities)[0]);
  }
  if (capabilities.hasMenu && !completed.some((section) => section.type === "menu")) {
    const menuSection = defaultSections(info, capabilities).find(
      (section) => section.type === "menu"
    );
    if (menuSection) {
      const insertAt = Math.min(completed.length, 3);
      completed.splice(insertAt, 0, menuSection);
    }
  }
  if (
    capabilities.hasReservations &&
    !completed.some((section) => section.type === "reservation")
  ) {
    const reservationSection = defaultSections(info, capabilities).find(
      (section) => section.type === "reservation"
    );
    if (reservationSection) {
      completed.splice(Math.max(1, completed.length - 1), 0, reservationSection);
    }
  }
  if (!hasFooter) {
    const footerSection = defaultSections(info, capabilities).find(
      (section) => section.type === "footer"
    );
    if (footerSection) completed.push(footerSection);
  }

  return completed;
}

function buildFallbackSnapshot(
  sourceUrl: string,
  slug: string,
  facts?: SourceFacts
): AiRestaurantSnapshot {
  const hostname =
    facts?.hostname ||
    (() => {
      try {
        return new URL(sourceUrl).hostname;
      } catch {
        return "restaurant";
      }
    })();
  const name = facts?.candidateName || hostnameToRestaurantName(hostname);
  const info: AiRestaurantSnapshot["info"] = {
    name,
    slug,
    sourceUrl,
    description:
      facts?.candidateDescription ||
      `${name} can shift to a cleaner, more atmospheric restaurant website without giving layout control away to AI.`,
    address: facts?.candidateAddress,
    phone: facts?.candidatePhone,
    hours: facts?.candidateHours || [],
    heroImage: facts?.candidateImages[0]?.src,
    cuisine: facts?.candidateCuisine,
    priceRange: facts?.candidatePriceRange,
  };
  const deliveryLinks = normalizeDeliveryLinks([], facts || {
    sourceUrl,
    hostname,
    pages: [],
    candidateHours: [],
    candidateMenu: [],
    candidateImages: [],
    candidateLinks: [],
  });
  const menu = facts ? buildMenuFromFacts(facts, info.cuisine) : [];
  const capabilities = deriveCapabilities(info, menu, deliveryLinks);

  return {
    slug,
    createdAt: new Date().toISOString(),
    sourceUrl,
    recommendedThemeId: DEFAULT_THEME_PRESET_ID,
    summary: `${name} can keep its brand voice while shifting to a clearer restaurant experience with stronger imagery, cleaner calls to action, and a more polished first impression.`,
    improvements: [
      "Lead with a more atmospheric hero and clearer restaurant identity.",
      "Bring ordering and reservations into more obvious calls to action.",
      "Use one cohesive theme across discovery, browsing, and conversion moments.",
    ],
    fallbackUsed: true,
    info,
    menu,
    galleryImages: normalizeGalleryImages([], facts || {
      sourceUrl,
      hostname,
      pages: [],
      candidateHours: [],
      candidateMenu: [],
      candidateImages: [],
      candidateLinks: [],
    }, info.heroImage),
    deliveryLinks,
    capabilities,
    sections: defaultSections(info, capabilities),
  };
}

async function generateSnapshotWithAi(
  facts: SourceFacts,
  slug: string
): Promise<AiRestaurantSnapshot> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const response = await client.chat.completions.create({
    model,
    temperature: 0.35,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a restaurant website transformation assistant. Return strict JSON only. Use facts only from the provided extracted website data. If information is missing, omit it. Do not invent menu items, business details, reviews, or links. Prefer extractedFacts.candidateMenu as the source of truth for tabs, categories, items, prices, and descriptions whenever it is present. Choose image URLs only from candidateImages. Choose delivery/reservation/order URLs only from candidateLinks. Recommend exactly one preset theme ID from terracotta-sunset, olive-linen, coastal-citrus. Keep the summary concise and premium. Write exactly three short improvements. Build the transformed page as a bounded section schema only.",
      },
      {
        role: "user",
        content: JSON.stringify({
          availableThemes: THEME_PRESETS.map((preset) => ({
            id: preset.id,
            description: preset.description,
            mood: preset.mood,
          })),
          extractedFacts: facts,
          responseShape: {
            restaurantName: "string",
            recommendedThemeId:
              "terracotta-sunset | olive-linen | coastal-citrus",
            summary: "string under 280 chars",
            improvements: ["string", "string", "string"],
            info: {
              description: "optional string",
              address: "optional string",
              phone: "optional string",
              hours: [{ day: "string", open: "string", close: "string" }],
              heroImage: "optional url from candidateImages only",
              cuisine: "optional string",
              priceRange: "optional string",
            },
            menu: [
              {
                name: "string",
                categories: [
                  {
                    name: "string",
                    items: [
                      {
                        name: "string",
                        description: "optional string",
                        price: 18,
                        image: "optional url from candidateImages only",
                        tags: ["optional short strings"],
                      },
                    ],
                  },
                ],
              },
            ],
            menuGuidance:
              "If extractedFacts.candidateMenu is populated, preserve that menu structure and only lightly clean labels or fill missing images from candidateImages.",
            galleryImages: [
              { src: "url from candidateImages only", alt: "string" },
            ],
            deliveryLinks: [
              {
                label: "string",
                href: "url from candidateLinks only",
                kind: "pickup | delivery | reservation | direct",
              },
            ],
            sections: [
              {
                type:
                  "hero | fact_strip | story | menu | gallery | delivery_options | reservation | footer",
                eyebrow: "optional string",
                title: "optional string",
                body: "optional string",
                primaryCtaLabel: "hero only optional string",
                secondaryCtaLabel: "hero only optional string",
                facts: [
                  { label: "string", value: "string" },
                ],
              },
            ],
          },
        }),
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI did not return JSON content.");
  }

  const draft = aiSnapshotDraftSchema.parse(JSON.parse(content));
  const info: AiRestaurantSnapshot["info"] = {
    name: draft.restaurantName || facts.candidateName || hostnameToRestaurantName(facts.hostname),
    slug,
    sourceUrl: facts.sourceUrl,
    description: draft.info.description || facts.candidateDescription,
    address: draft.info.address || facts.candidateAddress,
    phone: draft.info.phone || facts.candidatePhone,
    hours: draft.info.hours?.length ? draft.info.hours : facts.candidateHours,
    heroImage:
      facts.candidateImages.some((image) => image.src === draft.info.heroImage)
        ? draft.info.heroImage
        : facts.candidateImages[0]?.src,
    cuisine: draft.info.cuisine || facts.candidateCuisine,
    priceRange: draft.info.priceRange || facts.candidatePriceRange,
  };

  const extractedMenu = buildMenuFromFacts(facts, info.cuisine);
  const aiMenu = normalizeMenu(draft.menu, facts, info.cuisine);
  const menu =
    countMenuItems(extractedMenu) === 0
      ? aiMenu
      : countMenuItems(aiMenu) === 0
        ? extractedMenu
        : applyMenuImages(mergeMenus(aiMenu, extractedMenu), facts, info.cuisine);
  const deliveryLinks = normalizeDeliveryLinks(draft.deliveryLinks, facts);
  const capabilities = deriveCapabilities(info, menu, deliveryLinks);
  const galleryImages = normalizeGalleryImages(
    draft.galleryImages,
    facts,
    info.heroImage
  );
  const sections = normalizeSections(
    draft.sections,
    info,
    capabilities,
    deliveryLinks
  );

  return {
    slug,
    createdAt: new Date().toISOString(),
    sourceUrl: facts.sourceUrl,
    recommendedThemeId: draft.recommendedThemeId,
    summary: draft.summary,
    improvements: draft.improvements,
    fallbackUsed: false,
    info,
    menu,
    galleryImages,
    deliveryLinks,
    capabilities,
    sections,
  };
}

export async function generateTransformForUrl(url: URL): Promise<TransformResponse> {
  const slug = createGeneratedSlug(url.toString());
  let facts: SourceFacts | undefined;
  let snapshot: AiRestaurantSnapshot;

  try {
    facts = await crawlSourceFacts(url);
    snapshot = await generateSnapshotWithAi(facts, slug);
  } catch (error) {
    console.error("Transform fallback:", error);
    snapshot = buildFallbackSnapshot(url.toString(), slug, facts);
  }

  await writeTransformSnapshot(snapshot);

  return {
    restaurantName: snapshot.info.name,
    recommendedThemeId: snapshot.recommendedThemeId,
    summary: snapshot.summary,
    improvements: snapshot.improvements,
    fallbackUsed: snapshot.fallbackUsed,
    slug: snapshot.slug,
    snapshot,
  };
}

export function isGeneratedTransformResponse(
  value: TransformResponse | null | undefined
): value is TransformResponse & { slug: string; snapshot: AiRestaurantSnapshot } {
  return Boolean(value?.slug && value?.snapshot);
}
