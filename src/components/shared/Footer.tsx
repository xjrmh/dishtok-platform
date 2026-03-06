import Image from "next/image";
import { UtensilsCrossed } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-theme-panel-strong pb-28 pt-16 text-white md:pb-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-theme-primary text-theme-primary-foreground">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <span className="font-serif text-lg font-bold leading-none md:text-xl">
                DishTok for Merchants
              </span>
            </Link>
            <p className="text-white/60 text-sm max-w-md">
              Transform your restaurant&apos;s online presence with modern
              ordering, reservations, and payments. Powered by the DishTok
              food community.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-theme-accent">Platform</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#why-us" className="hover:text-white transition-colors">
                  Why DishTok
                </a>
              </li>
              <li>
                <Link href="/demo?url=demo" className="hover:text-white transition-colors">
                  Live Demo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-theme-accent">Contact</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>hello@dishtok.com</li>
              <li>New York, NY</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-white/40">
          <p>
            &copy; {new Date().getFullYear()} DishTok for Merchants. All rights
            reserved.
          </p>
          <a
            href="https://www.xjrmh.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto mt-5 flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition-colors hover:border-white/20 hover:bg-white/10"
          >
            <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/10">
              <Image
                src="https://xjrmh.com/profile.jpg"
                alt="Li Zheng"
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Li Zheng</p>
              <p className="text-xs text-white/60">Co-founder</p>
            </div>
          </a>
        </div>
      </div>
    </footer>
  );
}
