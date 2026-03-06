import { ArrowRight } from "lucide-react";
import { SafeImage } from "@/components/shared/SafeImage";
import { MenuTab, RestaurantInfo } from "@/types";

interface SignatureGalleryProps {
  info: RestaurantInfo;
  menu: MenuTab[];
}

export function SignatureGallery({ info, menu }: SignatureGalleryProps) {
  const featuredItems = menu
    .flatMap((tab) => tab.categories)
    .flatMap((category) => category.items)
    .filter((item) => item.image)
    .slice(0, 3);

  return (
    <section className="bg-theme-panel py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-between rounded-[2rem] border border-theme-border bg-theme-surface p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-theme-primary">
              Signature Moments
            </p>
            <h2 className="mt-3 max-w-md font-serif text-4xl font-bold text-theme-ink">
              A richer dining story, built into the transformed experience.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-theme-ink-soft">
              DishTok pairs restaurant-ready commerce modules with editorial
              imagery so every page feels more atmospheric, easier to browse,
              and more persuasive on mobile.
            </p>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-theme-border bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-theme-ink-soft">
              For {info.name}
            </p>
            <div className="mt-3 space-y-3 text-sm text-theme-ink">
              <div className="flex items-center justify-between">
                <span>Visual hierarchy</span>
                <span className="text-theme-primary">Upgraded</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Ordering flow</span>
                <span className="text-theme-primary">Mobile-first</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Brand mood</span>
                <span className="text-theme-primary">Preset-driven</span>
              </div>
            </div>
            <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-theme-primary">
              Explore the signature sections
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-[25rem] overflow-hidden rounded-[2rem]">
            <SafeImage
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=1500&fit=crop"
              alt="Restaurant dining room"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-theme-hero-from via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                Atmosphere
              </p>
              <p className="mt-2 max-w-sm font-serif text-2xl font-bold">
                Editorial framing gives the landing moments more warmth and depth.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {featuredItems.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-[1.75rem] border border-theme-border bg-theme-surface"
              >
                {item.image ? (
                  <div className="grid min-h-44 grid-cols-[0.95fr_1.05fr]">
                    <div className="relative">
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="320px"
                      />
                    </div>
                    <div className="flex flex-col justify-center p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-theme-primary">
                        Featured dish
                      </p>
                      <h3 className="mt-2 font-serif text-2xl font-bold text-theme-ink">
                        {item.name}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-theme-ink-soft">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
