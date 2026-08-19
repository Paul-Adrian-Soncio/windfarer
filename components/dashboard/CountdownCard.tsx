"use client";

import { useEffect, useState } from "react";
import { PartyPopper } from "lucide-react";
import { getCountdown } from "@/lib/date/countdown";

export function CountdownCard({ departureDate, departureTime }: { departureDate: string; departureTime?: string }) {
  const [countdown, setCountdown] = useState(() => getCountdown(departureDate, departureTime));

  useEffect(() => {
    // Re-derive immediately when the trip being shown changes — not just on
    // the next 60s tick — otherwise switching the active trip (see
    // TripsListCard's "Set active") leaves this showing the previous
    // trip's countdown for up to a minute, since useState's initializer
    // only ever runs once on mount, and setInterval's first setCountdown
    // call doesn't happen until 60s after the effect (re-)registers.
    setCountdown(getCountdown(departureDate, departureTime));
    const interval = setInterval(() => setCountdown(getCountdown(departureDate, departureTime)), 60_000);
    return () => clearInterval(interval);
  }, [departureDate, departureTime]);

  return (
    <div className="relative overflow-hidden rounded-card bg-countdown-gradient p-[22px] text-[#F1EFE6] shadow-card">
      <span className="absolute right-4 top-4 opacity-50">
        <svg viewBox="0 0 24 24" className="h-[26px] w-[26px] -rotate-12 fill-[#CFE0D3]">
          <path d="M2 21l21-9L2 3v7l15 2-15 2v5z" />
        </svg>
      </span>
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
  );
}
