import { MapPin, Phone, Clock, Instagram, Facebook } from "lucide-react";
import { RestaurantInfo } from "@/types";

interface RestaurantFooterProps {
  info: RestaurantInfo;
}

export function RestaurantFooter({ info }: RestaurantFooterProps) {
  return (
    <footer className="bg-theme-panel-strong py-16 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="font-serif text-2xl font-bold mb-4">{info.name}</h3>
            <p className="text-white/60 text-sm mb-4">{info.description}</p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-theme-accent">Contact</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                {info.address}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                {info.phone}
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-theme-accent">Hours</h4>
            <ul className="space-y-2 text-sm text-white/60">
              {info.hours.map((h) => (
                <li key={h.day} className="flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span className="font-medium text-white/80">{h.day}</span>
                  <span>
                    {h.open} - {h.close}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} {info.name}. All rights reserved.
          </p>
          <p className="text-sm text-white/40">
            Powered by{" "}
            <span className="font-semibold text-theme-accent">DishTok Platform</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
