"use client";

import { useEffect, useState } from "react";
import { PartyPopper, Plane } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getCountdown } from "@/lib/date/countdown";

export function CountdownCard({ departureDate, departureTime }: { departureDate: string; departureTime?: string }) {
  const [countdown, setCountdown] = useState(() => getCountdown(departureDate, departureTime));

  useEffect(() => {
    const interval = setInterval(() => setCountdown(getCountdown(departureDate, departureTime)), 60_000);
    return () => clearInterval(interval);
  }, [departureDate, departureTime]);

  return (
    <Card className="bg-hero-gradient text-white border-none">
      <div className="flex items-center gap-2 text-primary-100">
        <Plane className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wide">Countdown to departure</span>
      </div>
      {countdown.isPast ? (
        <div className="mt-3 flex items-center gap-2">
          <PartyPopper className="h-7 w-7 text-accent-300" />
          <p className="font-display text-2xl font-semibold">Bon voyage!</p>
        </div>
      ) : (
        <div className="mt-3 flex items-baseline gap-4">
          <div>
            <span className="font-display text-4xl font-bold">{countdown.days}</span>
            <span className="ml-1.5 text-sm text-primary-100">days</span>
          </div>
          <div>
            <span className="font-display text-2xl font-semibold">{countdown.hours}</span>
            <span className="ml-1 text-xs text-primary-100">hrs</span>
          </div>
          <div>
            <span className="font-display text-2xl font-semibold">{countdown.minutes}</span>
            <span className="ml-1 text-xs text-primary-100">min</span>
          </div>
        </div>
      )}
    </Card>
  );
}
