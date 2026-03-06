"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  Users,
  Utensils,
} from "lucide-react";
import { AnimatedSection } from "@/components/shared/AnimatedSection";

function AnimatedCounter({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const mockVideos = [
  {
    title: "Golden Hour Ceviche",
    creator: "@soncubano",
    likes: "12.3K",
    comments: "231",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Lobster Tacos",
    creator: "@harbor.table",
    likes: "8.7K",
    comments: "184",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Paella Classic",
    creator: "@mediterraneanmood",
    likes: "15.1K",
    comments: "266",
    image:
      "https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Cuban Sandwich",
    creator: "@latebrunchclub",
    likes: "21.5K",
    comments: "407",
    image:
      "https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Mojito Making",
    creator: "@barcart.diary",
    likes: "9.2K",
    comments: "143",
    image:
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Ceviche Fresh",
    creator: "@coastalplates",
    likes: "6.8K",
    comments: "119",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80",
  },
];

const stats = [
  { icon: Eye, value: 10, suffix: "M+", label: "Monthly Views" },
  { icon: Users, value: 500, suffix: "K+", label: "Food Creators" },
  { icon: Utensils, value: 2, suffix: "M+", label: "Dishes Shared" },
];

export function WhyChooseUs() {
  return (
    <section id="why-us" className="overflow-hidden bg-theme-surface-muted py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <AnimatedSection>
            <div className="relative flex justify-center">
              <motion.div
                className="relative h-[560px] w-[280px] rounded-[3rem] bg-black p-3 shadow-2xl"
                style={{ perspective: 1000 }}
                whileHover={{ rotateY: -5, rotateX: 5 }}
                transition={{ duration: 0.4 }}
              >
                <div className="absolute left-1/2 top-0 z-10 h-6 w-24 -translate-x-1/2 rounded-b-2xl bg-black" />
                <div className="relative h-full w-full overflow-hidden rounded-[2.4rem] bg-[#13161c]">
                  <div className="absolute inset-x-0 top-0 z-20 border-b border-white/10 bg-black/45 backdrop-blur-xl">
                    <div className="flex items-center justify-between px-6 pb-1 pt-3 text-[10px] text-white">
                      <span>9:41</span>
                      <span className="text-sm font-bold"></span>
                      <span>100%</span>
                    </div>
                    <div className="flex items-center justify-between px-5 pb-3">
                      <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/55">
                        DishTok
                      </p>
                      <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-medium text-white/80">
                        Trending Near You
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 top-20 overflow-hidden">
                    <motion.div
                      className="space-y-2.5 px-2.5 pb-4 pt-2.5"
                      animate={{ y: [0, -70, 0] }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <div className="relative min-h-[12rem] overflow-hidden rounded-[1.8rem] border border-white/10">
                        <Image
                          src={mockVideos[0].image}
                          alt={mockVideos[0].title}
                          fill
                          sizes="260px"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                        <div className="absolute left-3 top-3 rounded-full bg-[#f4c26d] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#3e2810]">
                          Featured
                        </div>
                        <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                          <p className="text-sm font-semibold">
                            {mockVideos[0].title}
                          </p>
                          <p className="mt-0.5 text-[10px] text-white/70">
                            {mockVideos[0].creator}
                          </p>
                          <div className="mt-2 flex items-center gap-3 text-[9px] text-white/80">
                            <span className="flex items-center gap-1">
                              <Heart className="h-2.5 w-2.5" />
                              {mockVideos[0].likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-2.5 w-2.5" />
                              {mockVideos[0].comments}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {mockVideos.slice(1).map((video) => (
                          <div
                            key={video.title}
                            className="relative aspect-[0.82] overflow-hidden rounded-[1.2rem] border border-white/10 bg-black"
                          >
                            <Image
                              src={video.image}
                              alt={video.title}
                              fill
                              sizes="126px"
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                            <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                              <div className="ml-0.5 h-0 w-0 border-y-[4px] border-y-transparent border-l-[6px] border-l-white" />
                            </div>
                            <div className="absolute inset-x-0 bottom-0 p-2.5 text-white">
                              <p className="truncate text-[10px] font-semibold">
                                {video.title}
                              </p>
                              <p className="mt-0.5 truncate text-[8px] text-white/65">
                                {video.creator}
                              </p>
                              <div className="mt-1 flex items-center gap-2 text-[8px] text-white/80">
                                <span className="flex items-center gap-0.5">
                                  <Heart className="h-2.5 w-2.5" />
                                  {video.likes}
                                </span>
                                <span className="flex items-center gap-0.5">
                                  <MessageCircle className="h-2.5 w-2.5" />
                                  {video.comments}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              <div className="absolute inset-0 -z-10 rounded-full bg-theme-primary/10 blur-[80px]" />
            </div>
          </AnimatedSection>

          <div>
            <AnimatedSection delay={0.2}>
              <span className="text-sm font-semibold uppercase tracking-[0.24em] text-theme-primary">
                Why DishTok
              </span>
              <h2 className="mt-3 font-serif text-4xl font-bold text-theme-ink md:text-5xl">
                DishTok / 吃什么 connects the transformed site to food discovery.
              </h2>
              <p className="mb-4 mt-6 text-lg text-theme-ink-soft">
                The website conversion is only part of the value. DishTok gives
                restaurants a social layer that keeps signature dishes visible to
                people actively searching for their next meal.
              </p>
              <p className="text-theme-ink-soft">
                In practice, that means better photography, a stronger ordering
                surface, and a discovery channel that already speaks the visual
                language of food lovers.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.4}>
              <div className="mt-8 grid grid-cols-3 gap-6">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-theme-border bg-theme-panel p-4 text-center shadow-sm"
                  >
                    <stat.icon className="mx-auto mb-2 h-6 w-6 text-theme-primary" />
                    <div className="text-2xl font-bold text-theme-ink">
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="mt-1 text-xs text-theme-ink-soft">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.5}>
              <div className="mt-8 flex items-center gap-3 rounded-2xl border border-theme-border bg-theme-panel px-4 py-4">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-sm text-theme-ink-soft">
                  Restaurants on DishTok see an average{" "}
                  <span className="font-semibold text-theme-ink">40% increase</span>{" "}
                  in online orders after pairing discovery with a cleaner site
                  experience.
                </span>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}
