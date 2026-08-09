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
    <nav className="sticky top-0 z-40 border-b border-hair bg-surface/95 shadow-[0_2px_10px_-8px_rgba(43,39,33,0.5)] backdrop-blur">
      <div className="mx-auto flex max-w-5xl gap-0.5 overflow-x-auto px-3 sm:px-6">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-1.5 whitespace-nowrap border-b-[2.5px] border-transparent px-4 py-3.5 text-sm font-medium transition-colors",
                active ? "font-semibold text-primary-700" : "text-ink-500 hover:text-ink-800"
              )}
            >
              <Icon className={cn("h-[17px] w-[17px]", active ? "stroke-primary-700" : "stroke-ink-500")} strokeWidth={1.9} />
              {label}
              {active && <span className="absolute inset-x-0 -bottom-px h-[2.5px] rounded-full bg-accent-500" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
