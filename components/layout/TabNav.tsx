"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPinned, CalendarRange, Wallet } from "lucide-react";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/planner", label: "Planner", icon: MapPinned },
  { href: "/itinerary", label: "Itinerary", icon: CalendarRange },
  { href: "/budget", label: "Budget", icon: Wallet },
];

export function TabNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 sm:px-6">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-2 whitespace-nowrap px-4 py-3.5 text-sm font-medium transition-colors",
                active ? "text-primary-700" : "text-ink-500 hover:text-ink-800"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
              {active && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent-500" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
