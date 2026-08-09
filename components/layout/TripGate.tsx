"use client";

import { ReactNode } from "react";
import { Compass } from "lucide-react";
import { useTripStore } from "@/store/tripStore";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function TripGate({ children }: { children: ReactNode }) {
  const hasHydrated = useTripStore((s) => s.hasHydrated);
  const trip = useTripStore((s) => s.trip);

  if (!hasHydrated) {
    return <div className="py-24 text-center text-sm text-ink-500">Loading your trip…</div>;
  }

  if (!trip) {
    return (
      <EmptyState
        icon={<Compass className="h-10 w-10" />}
        title="No trip planned yet"
        description="Start by telling us where you're headed and when — WindFarer will help you build out the rest."
        action={
          <Link href="/planner">
            <Button variant="accent">Start planning</Button>
          </Link>
        }
      />
    );
  }

  return <>{children}</>;
}
