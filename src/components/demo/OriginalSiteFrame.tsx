"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import {
  Clock3,
  ExternalLink,
  Globe,
  MapPin,
  Phone,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";
import { SafeImage } from "@/components/shared/SafeImage";
import { AiRestaurantSnapshot } from "@/types";

interface OriginalSiteFrameProps {
  url: string;
  snapshot?: AiRestaurantSnapshot;
}

function getDisplayHostname(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function OriginalSiteFallback({
  url,
  snapshot,
  onRetry,
}: {
  url: string;
  snapshot?: AiRestaurantSnapshot;
  onRetry?: () => void;
}) {
  const title = snapshot?.info.name || getDisplayHostname(url);
  const description =
    snapshot?.info.description ||
    snapshot?.summary ||
    "This site may block embedded previews, but DishTok still captured the public site signals needed for the transformation.";
  const heroImage = snapshot?.info.heroImage;
  const firstHour = snapshot?.info.hours[0];

  return (
    <div className="flex h-full flex-col bg-[#f7f3ee]">
      <div className="border-b border-[#e1d7ca] bg-white/85 px-5 py-4 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8b7663]">
              Original site preview unavailable
            </p>
            <h3 className="mt-1 text-lg font-semibold text-[#2d261f]">{title}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {onRetry ? (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 rounded-full border border-[#d8cbbd] bg-white px-4 py-2 text-sm font-medium text-[#3b3229] transition-colors hover:bg-[#f5eee6]"
              >
                <RefreshCcw className="h-4 w-4" />
                Retry live preview
              </button>
            ) : null}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#3b3229] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Open original site
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="grid flex-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative min-h-[18rem] overflow-hidden rounded-[2rem] border border-[#e1d7ca] bg-[#ece4da]">
          {heroImage ? (
            <>
              <SafeImage
                src={heroImage}
                alt={title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#241d18]/85 via-[#241d18]/15 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#d8b78a,transparent_35%),linear-gradient(180deg,#f0e4d4_0%,#e8dbca_100%)]" />
          )}

          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] backdrop-blur">
              <ShieldAlert className="h-3.5 w-3.5" />
              External preview blocked
            </div>
            <p className="max-w-xl text-sm leading-6 text-white/80">{description}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[2rem] border border-[#e1d7ca] bg-white p-6 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8b7663]">
              Captured from the original site
            </p>
            <div className="mt-4 space-y-4 text-sm text-[#54483c]">
              <div className="flex items-start gap-3">
                <Globe className="mt-0.5 h-4 w-4 text-[#9f876c]" />
                <div className="min-w-0">
                  <p className="font-medium text-[#2d261f]">Website</p>
                  <p className="break-all">{url}</p>
                </div>
              </div>
              {snapshot?.info.address ? (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-[#9f876c]" />
                  <div>
                    <p className="font-medium text-[#2d261f]">Address</p>
                    <p>{snapshot.info.address}</p>
                  </div>
                </div>
              ) : null}
              {snapshot?.info.phone ? (
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 text-[#9f876c]" />
                  <div>
                    <p className="font-medium text-[#2d261f]">Phone</p>
                    <p>{snapshot.info.phone}</p>
                  </div>
                </div>
              ) : null}
              {firstHour ? (
                <div className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 h-4 w-4 text-[#9f876c]" />
                  <div>
                    <p className="font-medium text-[#2d261f]">Hours</p>
                    <p>
                      {firstHour.day}: {firstHour.open} - {firstHour.close}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#e1d7ca] bg-white p-6 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8b7663]">
              Why this happens
            </p>
            <p className="mt-3 text-sm leading-7 text-[#54483c]">
              Many restaurant websites block iframe embedding with browser
              security headers. DishTok can still analyze the public pages and
              generate the transformed experience, but the live original site
              may need to open in a separate tab.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoOriginalSiteMock() {
  return (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="bg-gray-800 p-6 text-center text-white">
        <h2 className="text-2xl font-bold tracking-wider">SON CUBANO</h2>
        <div className="mt-3 flex justify-center gap-6 text-sm text-gray-400">
          <span>HOME</span>
          <span>MENU</span>
          <span>ABOUT</span>
          <span>CONTACT</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-white p-6">
        <h3 className="mb-1 border-b-2 border-gray-300 pb-2 text-lg font-bold text-gray-700">
          DINNER MENU
        </h3>
        <div className="mt-4 space-y-1">
          <h4 className="mb-2 mt-4 text-sm font-bold uppercase text-gray-600">
            Appetizers
          </h4>
          {[
            { name: "Butternut Squash Soup", price: "14.00" },
            { name: "Crab Croquettes", price: "20.00" },
            { name: "Empanadas Mixtas", price: "18.00" },
            { name: "Guacamole", price: "16.00" },
            { name: "Spicy Ceviche Mixto", price: "20.00" },
            { name: "Lobster and Shrimp Tacos", price: "28.00" },
            { name: "Clothesline Bacon", price: "22.00" },
          ].map((item) => (
            <div
              key={item.name}
              className="flex justify-between border-b border-dotted border-gray-200 py-1 text-sm text-gray-600"
            >
              <span>{item.name}</span>
              <span className="font-mono">${item.price}</span>
            </div>
          ))}
          <h4 className="mb-2 mt-6 text-sm font-bold uppercase text-gray-600">
            Entrees
          </h4>
          {[
            { name: "Ropa Vieja", price: "38.00" },
            { name: "Skirt Steak Churrasco", price: "49.00" },
            { name: "BBQ Glazed Salmon", price: "30.00" },
            { name: "Roasted Chicken", price: "31.00" },
            { name: "Crackling Pork Shank", price: "37.00" },
          ].map((item) => (
            <div
              key={item.name}
              className="flex justify-between border-b border-dotted border-gray-200 py-1 text-sm text-gray-600"
            >
              <span>{item.name}</span>
              <span className="font-mono">${item.price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OriginalSiteFrame({ url, snapshot }: OriginalSiteFrameProps) {
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(url === "demo");
  const iframeLoadedRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    iframeLoadedRef.current = false;
    startTransition(() => {
      setIframeLoaded(false);
      setShowFallback(url === "demo");
    });

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    if (url === "demo") {
      return;
    }

    timeoutRef.current = window.setTimeout(() => {
      if (!iframeLoadedRef.current) {
        setShowFallback(true);
      }
    }, 3500);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [url, iframeKey]);

  const handleRetry = () => {
    setShowFallback(false);
    setIframeLoaded(false);
    iframeLoadedRef.current = false;
    setIframeKey((value) => value + 1);
  };

  if (url === "demo") {
    return <DemoOriginalSiteMock />;
  }

  if (showFallback) {
    return (
      <OriginalSiteFallback
        url={url}
        snapshot={snapshot}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-theme-border bg-white px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <p className="truncate text-sm text-theme-ink-soft">
            {getDisplayHostname(url)}
          </p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-theme-border bg-theme-panel px-3 py-1.5 text-xs font-medium text-theme-ink transition-colors hover:bg-theme-surface"
        >
          Open original
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="relative flex-1 overflow-hidden bg-white">
        {!iframeLoaded ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/88 text-center backdrop-blur-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-theme-primary border-t-transparent" />
            <div>
              <p className="text-sm font-medium text-theme-ink">
                Loading original site preview
              </p>
              <p className="mt-1 text-sm text-theme-ink-soft">
                Some sites may block embedded previews.
              </p>
            </div>
          </div>
        ) : null}

        <iframe
          key={`${url}-${iframeKey}`}
          src={url}
          className="h-full w-full border-0"
          title="Original restaurant website"
          onLoad={() => {
            iframeLoadedRef.current = true;
            setIframeLoaded(true);
            if (timeoutRef.current) {
              window.clearTimeout(timeoutRef.current);
            }
          }}
          onError={() => setShowFallback(true)}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
