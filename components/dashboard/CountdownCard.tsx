"use client";

import { useEffect, useState } from "react";
import { PartyPopper } from "lucide-react";
import { getCountdown } from "@/lib/date/countdown";
import { Topography } from "@/components/ui/Topography";

export function CountdownCard({ departureDate, departureTime }: { departureDate: string; departureTime?: string }) {
  // Derived straight from props during render — not stashed in its own
  // useState — so switching the active trip (see TripsListCard's "Set
  // active") reflects the new departureDate/departureTime immediately.
  // `tick` exists only to force a re-render every 60s so the display stays
  // live between prop changes too; its value is never read.
  const [, setTick] = useState(0);
  const countdown = getCountdown(departureDate, departureTime);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-card bg-countdown-gradient p-[22px] text-[#F1EFE6] shadow-card">
      {/* Same topography treatment as the welcome page's hero/CTA sections
          (see app/welcome/page.tsx) — tuned down for a small dashboard
          tile: lower bands/higher thickness so the contour lines read as
          background texture rather than competing with the countdown
          numbers, and mouse interaction off since a tile this size rarely
          gets deliberately hovered. */}
      <div className="absolute inset-0">
        <Topography
          lowColor="#123024"
          midColor="#3f8f6f"
          highColor="#c2673f"
          bands={2}
          thickness={0.02}
          glow={0.4}
          speed={0.2}
          morphAmount={1}
          morphSpeed={0.04}
          grainIntensity={0.035}
          mouseInteraction={false}
          scale={0.9}
        />
      </div>

      <span className="absolute right-4 top-4 opacity-50">
        <svg viewBox="0 0 24 24" className="h-[26px] w-[26px] -rotate-12 fill-[#CFE0D3]">
          <path d="M2 21l21-9L2 3v7l15 2-15 2v5z" />
        </svg>
      </span>
      <div className="relative">
        <span className="font-mono text-[11px] uppercase tracking-[.13em] text-[#BFD6C5]">
          Countdown to departure
        </span>
        {countdown.isPast ? (
          <div className="mt-3.5 flex items-center gap-2">
            <PartyPopper className="h-7 w-7 text-accent-300" />
            <p className="font-display text-2xl font-bold">Bon voyage!</p>
          </div>
        ) : (
          <div className="mt-3.5 flex items-baseline gap-4">
            <div>
              <span className="font-display text-[42px] font-bold leading-none text-white">{countdown.days}</span>
              <span className="ml-[3px] text-[13px] text-[#C6DBCC]">days</span>
            </div>
            <div>
              <span className="font-display text-2xl font-bold text-white">{countdown.hours}</span>
              <span className="ml-1 text-xs text-[#C6DBCC]">hrs</span>
            </div>
            <div>
              <span className="font-display text-2xl font-bold text-white">{countdown.minutes}</span>
              <span className="ml-1 text-xs text-[#C6DBCC]">min</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
