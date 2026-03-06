"use client";

import { Suspense, startTransition, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  Columns2,
  Monitor,
  MonitorSmartphone,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OriginalSiteFrame } from "@/components/demo/OriginalSiteFrame";
import { TransformedPreview } from "@/components/demo/TransformedPreview";
import { BeforeAfterSlider } from "@/components/demo/BeforeAfterSlider";
import {
  buildFallbackSnapshot,
  buildFallbackTransform,
  getDemoTransform,
  normalizeWebsiteUrl,
} from "@/lib/transform";
import {
  DEFAULT_THEME_PRESET_ID,
  THEME_PRESETS,
  getThemePreset,
  isThemePresetId,
} from "@/lib/themes";
import { cn } from "@/lib/utils";
import {
  AiRestaurantSnapshot,
  ThemePresetId,
  TransformResponse,
} from "@/types";

type ViewMode = "side-by-side" | "original" | "transformed";

function AnalysisCardSkeleton() {
  return (
    <div className="rounded-[2rem] border border-theme-border bg-theme-panel p-6 shadow-[0_18px_60px_rgba(42,31,27,0.08)]">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-theme-primary/10 text-theme-primary">
          <Bot className="h-5 w-5 animate-pulse" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-theme-ink">
            <span>Analyzing with ChatGPT</span>
            <span className="h-2 w-2 rounded-full bg-theme-accent animate-pulse" />
          </div>
          <div className="h-3 w-72 rounded-full bg-theme-surface-muted" />
          <div className="h-3 w-full rounded-full bg-theme-surface-muted" />
          <div className="h-3 w-5/6 rounded-full bg-theme-surface-muted" />
        </div>
      </div>
    </div>
  );
}

function ThemePreview({
  swatches,
}: {
  swatches: [string, string, string, string];
}) {
  return (
    <div className="flex gap-1.5">
      {swatches.map((swatch) => (
        <span
          key={swatch}
          className="h-3.5 w-3.5 rounded-full border border-black/5"
          style={{ backgroundColor: swatch }}
        />
      ))}
    </div>
  );
}

function getDisplayHostname(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function DemoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawUrl = searchParams.get("url") || "demo";
  const url = normalizeWebsiteUrl(rawUrl);
  const [viewMode, setViewMode] = useState<ViewMode>(
    url === "demo" ? "side-by-side" : "transformed"
  );
  const [transform, setTransform] = useState<TransformResponse | null>(null);
  const [generatedSnapshot, setGeneratedSnapshot] =
    useState<AiRestaurantSnapshot | null>(null);
  const [selectedThemeId, setSelectedThemeId] = useState<ThemePresetId>(
    DEFAULT_THEME_PRESET_ID
  );
  const [loading, setLoading] = useState(true);
  const [fallbackNote, setFallbackNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTransform() {
      startTransition(() => {
        setLoading(true);
        setFallbackNote(null);
      });

      if (url === "demo") {
        const demoTransform = getDemoTransform();
        if (!cancelled) {
          startTransition(() => {
            setTransform(demoTransform);
            setGeneratedSnapshot(null);
            setSelectedThemeId(demoTransform.recommendedThemeId);
            setLoading(false);
          });
        }
        return;
      }

      if (!cancelled) {
        startTransition(() => {
          setTransform(null);
          setGeneratedSnapshot(null);
          setSelectedThemeId(DEFAULT_THEME_PRESET_ID);
        });
      }

      try {
        const response = await fetch("/api/transform", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to analyze this website.");
        }

        if (cancelled) return;

        startTransition(() => {
          setTransform(data);
          setGeneratedSnapshot(data.snapshot ?? null);
          setSelectedThemeId(
            isThemePresetId(data.recommendedThemeId)
              ? data.recommendedThemeId
              : DEFAULT_THEME_PRESET_ID
          );
          setFallbackNote(
            data.fallbackUsed
              ? "Live metadata was limited, so DishTok used a reliable template brief instead."
              : null
          );
        });
      } catch {
        if (cancelled) return;
        const fallback = buildFallbackTransform(url);
        startTransition(() => {
          setTransform(fallback);
          setGeneratedSnapshot(buildFallbackSnapshot(url));
          setSelectedThemeId(fallback.recommendedThemeId);
          setFallbackNote(
            "ChatGPT could not reach the site cleanly, so DishTok fell back to a curated template brief."
          );
        });
      } finally {
        if (!cancelled) {
          startTransition(() => {
            setLoading(false);
          });
        }
      }
    }

    loadTransform();
    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    document.body.dataset.theme = selectedThemeId;
    return () => {
      document.body.dataset.theme = DEFAULT_THEME_PRESET_ID;
    };
  }, [selectedThemeId]);

  useEffect(() => {
    setViewMode(url === "demo" ? "side-by-side" : "transformed");
  }, [url]);

  const fullExperienceHref =
    url === "demo"
      ? `/demo/son-cubano?theme=${selectedThemeId}`
      : transform?.slug
        ? `/demo/${transform.slug}?theme=${selectedThemeId}`
        : null;
  const showGeneratedBuildState = url !== "demo" && loading && !generatedSnapshot;

  return (
    <div
      data-theme={selectedThemeId}
      className="min-h-screen bg-theme-surface text-theme-ink"
    >
      <div className="relative">
        <div className="border-b border-theme-border/80 bg-theme-panel/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm text-theme-ink-soft transition-colors hover:text-theme-ink"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
              <div className="hidden h-5 w-px bg-theme-border md:block" />
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-theme-primary text-theme-primary-foreground shadow-sm">
                  <UtensilsCrossed className="h-4 w-4" />
                </div>
                <span className="font-serif text-base font-bold leading-none text-theme-ink sm:text-lg">
                  DishTok for Merchants
                </span>
              </Link>
            </div>

            <div className="hidden items-center gap-1 rounded-xl bg-theme-surface-muted p-1 md:flex">
              {[
                { mode: "original" as const, icon: Monitor, label: "Original" },
                { mode: "side-by-side" as const, icon: Columns2, label: "Compare" },
                {
                  mode: "transformed" as const,
                  icon: MonitorSmartphone,
                  label: "Transformed",
                },
              ].map((item) => (
                <button
                  key={item.mode}
                  onClick={() => setViewMode(item.mode)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    viewMode === item.mode
                      ? "bg-theme-panel text-theme-ink shadow-sm"
                      : "text-theme-ink-soft hover:text-theme-ink"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              ))}
            </div>

            <Button
              onClick={() => {
                if (fullExperienceHref) {
                  router.push(fullExperienceHref);
                }
              }}
              disabled={!fullExperienceHref}
              className="rounded-full bg-theme-primary px-5 text-theme-primary-foreground hover:bg-theme-primary/90"
            >
              Explore Full Site
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-theme-ink-soft">
            Preview
          </p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-8 h-full"
          >
            {viewMode === "side-by-side" && (
              <div className="h-[calc(100vh-340px)] min-h-[36rem]">
                <BeforeAfterSlider
                  beforeContent={
                    <div className="h-full w-full">
                      <OriginalSiteFrame
                        url={url}
                        snapshot={generatedSnapshot ?? undefined}
                      />
                    </div>
                  }
                  afterContent={
                    <div className="h-full w-full">
                      <TransformedPreview
                        themeId={selectedThemeId}
                        snapshot={generatedSnapshot ?? undefined}
                        isBuilding={showGeneratedBuildState}
                        sourceUrl={url}
                      />
                    </div>
                  }
                />
              </div>
            )}

            {viewMode === "original" && (
              <div className="h-[calc(100vh-340px)] min-h-[36rem] overflow-hidden rounded-[2rem] border border-theme-border bg-white shadow-lg">
                <OriginalSiteFrame
                  url={url}
                  snapshot={generatedSnapshot ?? undefined}
                />
              </div>
            )}

            {viewMode === "transformed" && (
              <div className="h-[calc(100vh-340px)] min-h-[36rem] overflow-hidden rounded-[2rem] border border-theme-border bg-theme-panel shadow-lg">
                <TransformedPreview
                  themeId={selectedThemeId}
                  snapshot={generatedSnapshot ?? undefined}
                  isBuilding={showGeneratedBuildState}
                  sourceUrl={url}
                />
              </div>
            )}
          </motion.div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-theme-ink-soft">
            Configurations
          </p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]"
          >
            {loading || !transform ? (
              <AnalysisCardSkeleton />
            ) : (
              <div className="rounded-[2rem] border border-theme-border bg-theme-panel p-6 shadow-[0_18px_60px_rgba(42,31,27,0.08)]">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-theme-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-theme-primary">
                    <Bot className="h-3.5 w-3.5" />
                    ChatGPT Review
                  </span>
                  <span className="text-sm text-theme-ink-soft">
                    {url === "demo" ? "soncubano.com" : getDisplayHostname(url)}
                  </span>
                </div>

                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-theme-ink-soft">
                      Recommended template
                    </p>
                    <h1 className="mt-2 font-serif text-3xl font-bold text-theme-ink">
                      {transform.restaurantName}
                    </h1>
                  </div>
                  <span className="rounded-full bg-theme-accent px-3 py-1 text-xs font-semibold text-theme-accent-foreground">
                    {getThemePreset(transform.recommendedThemeId).name}
                  </span>
                </div>

                <p className="max-w-3xl text-base leading-7 text-theme-ink-soft">
                  {transform.summary}
                </p>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {transform.improvements.map((improvement, index) => (
                    <div
                      key={`${improvement}-${index}`}
                      className="rounded-2xl border border-theme-border bg-theme-surface px-4 py-4"
                    >
                      <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-theme-primary/10 text-sm font-semibold text-theme-primary">
                        0{index + 1}
                      </span>
                      <p className="text-sm leading-6 text-theme-ink-soft">
                        {improvement}
                      </p>
                    </div>
                  ))}
                </div>

                {fallbackNote ? (
                  <p className="mt-4 text-sm text-theme-ink-soft">{fallbackNote}</p>
                ) : null}
              </div>
            )}

            <div className="rounded-[2rem] border border-theme-border bg-theme-panel p-6 shadow-[0_18px_60px_rgba(42,31,27,0.08)]">
              <div className="mb-5 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-theme-accent" />
                <div>
                  <p className="text-sm font-semibold text-theme-ink">
                    Theme presets
                  </p>
                  <p className="text-sm text-theme-ink-soft">
                    ChatGPT recommends a preset, but you can switch instantly.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {THEME_PRESETS.map((preset) => {
                  const active = selectedThemeId === preset.id;
                  const recommended =
                    transform?.recommendedThemeId === preset.id;

                  return (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedThemeId(preset.id)}
                      className={cn(
                        "w-full rounded-2xl border p-4 text-left transition-all",
                        active
                          ? "border-theme-border-strong bg-theme-surface shadow-sm"
                          : "border-theme-border bg-transparent hover:bg-theme-surface"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-theme-ink">
                              {preset.name}
                            </span>
                            {recommended ? (
                              <span className="rounded-full bg-theme-primary/10 px-2 py-0.5 text-[11px] font-semibold text-theme-primary">
                                Recommended
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm text-theme-ink-soft">
                            {preset.description}
                          </p>
                          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-theme-ink-soft">
                            {preset.mood}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <ThemePreview swatches={preset.swatches} />
                          {active ? (
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-theme-primary text-theme-primary-foreground">
                              <Check className="h-4 w-4" />
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function DemoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-theme-surface">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-theme-primary border-t-transparent" />
        </div>
      }
    >
      <DemoContent />
    </Suspense>
  );
}
