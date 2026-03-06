import { ThemePreset, ThemePresetId } from "@/types";

export const DEFAULT_THEME_PRESET_ID: ThemePresetId = "terracotta-sunset";

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "terracotta-sunset",
    name: "Terracotta Sunset",
    description: "Clay red, saffron, cream, and espresso for a warm, premium dining feel.",
    mood: "Warm editorial",
    swatches: ["#A44A34", "#D89A33", "#F7F1E7", "#2A1F1B"],
  },
  {
    id: "olive-linen",
    name: "Olive Linen",
    description: "Olive, brass, parchment, and walnut for a calm brasserie-style mood.",
    mood: "Refined and organic",
    swatches: ["#5E6A43", "#C49A52", "#F2EBDD", "#342A22"],
  },
  {
    id: "coastal-citrus",
    name: "Coastal Citrus",
    description: "Deep teal, sand, citrus, and slate for a fresh coastal dining tone.",
    mood: "Bright and polished",
    swatches: ["#16606A", "#D6A643", "#F3ECE0", "#1F3441"],
  },
];

const themePresetMap = Object.fromEntries(
  THEME_PRESETS.map((preset) => [preset.id, preset])
) as Record<ThemePresetId, ThemePreset>;

export function isThemePresetId(
  value: string | null | undefined
): value is ThemePresetId {
  return !!value && value in themePresetMap;
}

export function getThemePreset(
  value: string | null | undefined
): ThemePreset {
  return isThemePresetId(value)
    ? themePresetMap[value]
    : themePresetMap[DEFAULT_THEME_PRESET_ID];
}
