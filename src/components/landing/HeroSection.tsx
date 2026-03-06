"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const demoSnapshots = [
  {
    label: "Before",
    labelClassName: "bg-black/10 text-gray-600",
    src: "/hero/son-cubano-before-full-v3.png",
    alt: "Top-aligned screenshot of the original Son Cubano SinglePlatform menu",
    frameClassName: "bg-[#f1ede8]",
  },
  {
    label: "After",
    labelClassName: "bg-theme-primary/10 text-theme-primary",
    src: "/hero/son-cubano-after-full-v3.png",
    alt: "Top-aligned screenshot of the transformed Son Cubano DishTok demo page",
    frameClassName: "bg-[linear-gradient(180deg,#f7efe4_0%,#efe2d3_100%)]",
  },
] as const;

export function HeroSection() {
  const [url, setUrl] = useState("");
  const [isIntakeInView, setIsIntakeInView] = useState(true);
  const intakeRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    const node = intakeRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntakeInView(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      router.push(`/demo?url=${encodeURIComponent(url.trim())}`);
    }
  };

  const handleDemo = () => {
    router.push("/demo?url=demo");
  };

  const renderIntakeFields = (floating = false) => (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="flex flex-1 items-center rounded-[1.4rem] border border-theme-border bg-white px-4">
        <Search className="h-5 w-5 text-theme-ink-soft" />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste your restaurant website URL"
          className={`flex-1 bg-transparent text-theme-ink outline-none placeholder:text-theme-ink-soft/70 ${
            floating ? "px-4 py-3.5 text-sm md:text-base" : "px-4 py-4 text-base"
          }`}
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="submit"
          className={`rounded-[1.4rem] bg-theme-primary font-semibold text-theme-primary-foreground hover:bg-theme-primary/90 ${
            floating ? "px-6 py-5 text-sm md:text-base" : "px-7 py-6 text-base"
          }`}
        >
          Transform Site
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button
          type="button"
          onClick={handleDemo}
          variant="outline"
          className={`rounded-[1.4rem] border-theme-border bg-white font-semibold text-theme-ink hover:bg-theme-surface ${
            floating ? "px-6 py-5 text-sm md:text-base" : "px-7 py-6 text-base"
          }`}
        >
          Try Demo
        </Button>
      </div>
    </div>
  );

  return (
    <section className="relative overflow-hidden bg-theme-surface pb-8 pt-24 md:pb-12 md:pt-28">
      <div className="absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_top_right,var(--theme-glow),transparent_36%),linear-gradient(180deg,var(--theme-surface-muted),transparent)] opacity-80" />
      <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-theme-accent/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid items-start gap-12 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-theme-border bg-theme-panel px-4 py-2 text-sm text-theme-ink-soft shadow-sm"
            >
              <Sparkles className="h-4 w-4 text-theme-accent" />
              <span>AI reads your site. DishTok turns it into a restaurant-ready experience.</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-8 max-w-3xl font-serif text-5xl font-bold leading-[0.95] text-theme-ink md:text-7xl"
            >
              Turn your aging restaurant site into a warmer,
              <span className="text-theme-primary"> faster revenue surface.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 max-w-2xl text-lg leading-8 text-theme-ink-soft"
            >
              AI reads your restaurant&apos;s public pages, extracts
              the usable brand, menu, and contact signals, and turns them into a
              polished ordering, reservation, and visual experience built for
              restaurant conversion.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="mt-8"
            >
              <div className="grid grid-cols-[0.95fr_0.95fr_1.45fr] gap-4 text-sm text-theme-ink-soft md:max-w-2xl">
                {[
                  { value: "1,000+", label: "Restaurants on waitlist" },
                  { value: "40%", label: "Average order lift" },
                  {
                    value: "DoorDash+",
                    label: "Uber Eats, Grubhub, and more",
                    labelClassName: "whitespace-nowrap text-[11px] md:text-xs",
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xl font-bold text-theme-ink">{item.value}</p>
                    <p className={item.labelClassName}>{item.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative lg:-mt-6"
          >
            <div className="rounded-[2.5rem] border border-theme-border bg-theme-panel p-5 shadow-[0_24px_80px_rgba(42,31,27,0.08)]">
              <div className="mb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-theme-primary">
                    Demo screenshots
                  </p>
                  <h2 className="mt-2 max-w-md font-serif text-3xl font-bold text-theme-ink">
                    Before and after, transformed with just one click.
                  </h2>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {demoSnapshots.map((snapshot) => (
                  <div
                    key={snapshot.label}
                    className="overflow-hidden rounded-[2rem] border border-theme-border bg-white"
                  >
                    <div className="flex items-center gap-3 border-b border-theme-border bg-theme-surface-muted px-4 py-3">
                      <div className="flex gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-red-400" />
                        <div className="h-3 w-3 rounded-full bg-yellow-400" />
                        <div className="h-3 w-3 rounded-full bg-green-400" />
                      </div>
                      <div
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${snapshot.labelClassName}`}
                      >
                        {snapshot.label}
                      </div>
                    </div>
                    <div className={`relative h-[22rem] overflow-hidden ${snapshot.frameClassName}`}>
                      <Image
                        src={snapshot.src}
                        alt={snapshot.alt}
                        fill
                        priority
                        sizes="(min-width: 1024px) 380px, (min-width: 768px) 48vw, 100vw"
                        className="object-cover object-top"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.form
          ref={intakeRef}
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-8 rounded-[2rem] border border-theme-border bg-theme-panel p-3 shadow-[0_18px_60px_rgba(42,31,27,0.08)]"
        >
          {renderIntakeFields()}
        </motion.form>
      </div>

      <AnimatePresence>
        {!isIntakeInView ? (
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 28 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none fixed inset-x-0 bottom-4 z-50 px-4 sm:px-6"
          >
            <motion.form
              onSubmit={handleSubmit}
              className="pointer-events-auto mx-auto max-w-6xl rounded-[1.8rem] border border-theme-border bg-theme-panel/95 p-3 shadow-[0_18px_60px_rgba(42,31,27,0.16)] backdrop-blur-xl"
            >
              {renderIntakeFields(true)}
            </motion.form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
