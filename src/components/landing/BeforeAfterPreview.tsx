"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Bot, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/shared/AnimatedSection";

export function BeforeAfterPreview() {
  const router = useRouter();

  return (
    <section className="bg-theme-surface py-16 md:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.88fr_1.12fr]">
        <AnimatedSection>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-theme-primary">
            Transformation preview
          </p>
          <h2 className="mt-3 font-serif text-4xl font-bold text-theme-ink md:text-5xl">
            A small AI brief, then a deliberate restaurant redesign.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-theme-ink-soft">
            The before state stays plain and text-heavy. The after state adds
            curated visuals, focused tabs, and a clearer purchase path without
            handing layout control to AI.
          </p>

          <div className="mt-8 rounded-[2rem] border border-theme-border bg-theme-panel p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-theme-primary/10 text-theme-primary">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-theme-ink">
                  ChatGPT review output
                </p>
                <p className="mt-2 text-sm leading-7 text-theme-ink-soft">
                  “Preserve the upscale Latin identity, lead with more cinematic
                  imagery, and move ordering plus reservations into more obvious
                  calls to action.”
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => router.push("/demo?url=demo")}
            className="mt-8 rounded-full bg-theme-primary px-8 py-6 text-base font-semibold text-theme-primary-foreground hover:bg-theme-primary/90"
          >
            <Monitor className="mr-2 h-5 w-5" />
            Explore the Full Experience
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="overflow-hidden rounded-[2.25rem] border border-theme-border bg-theme-panel shadow-[0_24px_80px_rgba(42,31,27,0.08)]">
            <div className="flex items-center gap-3 border-b border-theme-border bg-theme-surface-muted px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 rounded-lg border border-theme-border bg-white px-4 py-1.5 text-center text-xs text-theme-ink-soft">
                soncubano.dishtok.com
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-theme-border">
              <div className="bg-[#f8f8f8] p-6">
                <div className="mb-4 text-center">
                  <span className="rounded-full bg-black/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Before
                  </span>
                </div>
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <div className="bg-gray-800 p-3 text-center">
                    <div className="text-sm font-bold text-white">SON CUBANO</div>
                    <div className="mt-2 flex justify-center gap-4 text-[10px] text-gray-400">
                      <span>Home</span>
                      <span>Menu</span>
                      <span>About</span>
                      <span>Contact</span>
                    </div>
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="h-2 w-3/4 rounded bg-gray-200" />
                    <div className="h-2 w-full rounded bg-gray-200" />
                    <div className="h-2 w-5/6 rounded bg-gray-200" />
                    <div className="mt-4 space-y-2">
                      {["Empanadas....$18", "Ropa Vieja....$38", "Mojito....$16"].map(
                        (item) => (
                          <div
                            key={item}
                            className="border-b border-dashed border-gray-200 pb-1 font-mono text-[10px] text-gray-500"
                          >
                            {item}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-theme-surface p-6">
                <div className="mb-4 text-center">
                  <span className="rounded-full bg-theme-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-theme-primary">
                    After
                  </span>
                </div>
                <div className="overflow-hidden rounded-lg border border-theme-border bg-white shadow-lg">
                  <div className="relative h-24 overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&h=480&fit=crop"
                      alt="Warm dining table"
                      fill
                      className="object-cover"
                      sizes="420px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-theme-hero-from/90 via-theme-hero-via/70 to-theme-hero-to/70" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div>
                        <div className="text-sm font-serif font-bold text-white">
                          Son Cubano
                        </div>
                        <div className="text-center text-[8px] text-white/70">
                          Cuban / Latin
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="mb-3 flex gap-1">
                      {["Dinner", "Brunch", "Drinks"].map((tab) => (
                        <div
                          key={tab}
                          className={`rounded-full px-2 py-0.5 text-[8px] ${
                            tab === "Dinner"
                              ? "bg-theme-primary text-theme-primary-foreground"
                              : "bg-theme-surface text-theme-ink-soft"
                          }`}
                        >
                          {tab}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: "Empanadas", price: "$18" },
                        { name: "Ropa Vieja", price: "$38" },
                      ].map((item) => (
                        <div key={item.name} className="rounded-lg bg-theme-panel p-2">
                          <div className="mb-1.5 h-12 overflow-hidden rounded">
                            <Image
                              src={
                                item.name === "Empanadas"
                                  ? "https://images.unsplash.com/photo-1609525313344-a56b96f0e123?w=300&h=200&fit=crop"
                                  : "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop"
                              }
                              alt={item.name}
                              width={300}
                              height={200}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="text-[9px] font-semibold text-theme-ink">
                            {item.name}
                          </div>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-[8px] font-bold text-theme-primary">
                              {item.price}
                            </span>
                            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-theme-primary text-[8px] text-theme-primary-foreground">
                              +
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
