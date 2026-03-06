export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  tags?: string[];
  addOns?: { name: string; price: number }[];
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface MenuTab {
  id: string;
  name: string;
  categories: MenuCategory[];
}

export interface RestaurantHour {
  day: string;
  open: string;
  close: string;
}

export interface RestaurantInfo {
  name: string;
  slug: string;
  description: string;
  address: string;
  phone: string;
  hours: RestaurantHour[];
  heroImage: string;
  cuisine: string;
  priceRange: string;
}

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  addOns: { name: string; price: number }[];
  specialInstructions?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "pending" | "paid" | "preparing" | "ready" | "delivered";
  stripeSessionId?: string;
  orderType: "pickup" | "delivery";
  deliveryAddress?: string;
  restaurantSlug: string;
  createdAt: string;
}

export interface Reservation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  partySize: number;
  date: string;
  time: string;
  specialRequests?: string;
  status: "confirmed" | "cancelled";
  restaurantSlug: string;
  createdAt: string;
}

export type ThemePresetId =
  | "terracotta-sunset"
  | "olive-linen"
  | "coastal-citrus";

export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  description: string;
  mood: string;
  swatches: [string, string, string, string];
}

export interface SourceImageOption {
  src: string;
  alt?: string;
  pageUrl?: string;
}

export interface SourceLinkOption {
  label: string;
  href: string;
  kind:
    | "menu"
    | "about"
    | "contact"
    | "reservation"
    | "order"
    | "delivery"
    | "other";
}

export interface SourcePageFacts {
  url: string;
  kind: "submitted" | "menu" | "about" | "contact";
  title?: string;
  metaDescription?: string;
  firstHeading?: string;
  headings: string[];
  paragraphs: string[];
  menuLines: string[];
  links: SourceLinkOption[];
  images: SourceImageOption[];
}

export interface SourceFacts {
  sourceUrl: string;
  hostname: string;
  pages: SourcePageFacts[];
  candidateName?: string;
  candidateDescription?: string;
  candidateAddress?: string;
  candidatePhone?: string;
  candidateHours: RestaurantHour[];
  candidateCuisine?: string;
  candidatePriceRange?: string;
  candidateMenu: MenuTab[];
  candidateImages: SourceImageOption[];
  candidateLinks: SourceLinkOption[];
}

export interface RestaurantCapabilities {
  hasMenu: boolean;
  hasReservations: boolean;
  hasDeliveryLinks: boolean;
  hasAddress: boolean;
  hasPhone: boolean;
  hasHours: boolean;
  hasHeroImage: boolean;
}

export interface AiRestaurantInfo {
  name: string;
  slug: string;
  sourceUrl: string;
  description?: string;
  address?: string;
  phone?: string;
  hours: RestaurantHour[];
  heroImage?: string;
  cuisine?: string;
  priceRange?: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
}

export interface DeliveryLink {
  label: string;
  href: string;
  kind: "pickup" | "delivery" | "reservation" | "direct";
}

interface AiBaseSection {
  id: string;
  eyebrow?: string;
  title?: string;
  body?: string;
}

export interface AiHeroSection extends AiBaseSection {
  type: "hero";
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
}

export interface AiFactStripSection extends AiBaseSection {
  type: "fact_strip";
  facts?: Array<{ label: string; value: string }>;
}

export interface AiStorySection extends AiBaseSection {
  type: "story";
}

export interface AiMenuSection extends AiBaseSection {
  type: "menu";
}

export interface AiGallerySection extends AiBaseSection {
  type: "gallery";
}

export interface AiDeliverySection extends AiBaseSection {
  type: "delivery_options";
}

export interface AiReservationSection extends AiBaseSection {
  type: "reservation";
}

export interface AiFooterSection extends AiBaseSection {
  type: "footer";
}

export type AiPageSection =
  | AiHeroSection
  | AiFactStripSection
  | AiStorySection
  | AiMenuSection
  | AiGallerySection
  | AiDeliverySection
  | AiReservationSection
  | AiFooterSection;

export interface AiRestaurantSnapshot {
  slug: string;
  createdAt: string;
  sourceUrl: string;
  recommendedThemeId: ThemePresetId;
  summary: string;
  improvements: [string, string, string];
  fallbackUsed: boolean;
  info: AiRestaurantInfo;
  menu: MenuTab[];
  galleryImages: GalleryImage[];
  deliveryLinks: DeliveryLink[];
  capabilities: RestaurantCapabilities;
  sections: AiPageSection[];
}

export interface TransformResponse {
  restaurantName: string;
  recommendedThemeId: ThemePresetId;
  summary: string;
  improvements: [string, string, string];
  fallbackUsed: boolean;
  slug?: string;
  snapshot?: AiRestaurantSnapshot;
}
