"use client";

import { ReactNode, useEffect } from "react";
import { Compass, TriangleAlert } from "lucide-react";
import { useTripStore } from "@/store/tripStore";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function TripGate({ children }: { children: ReactNode }) {
  const status = useTripStore((s) => s.status);
  const error = useTripStore((s) => s.error);
  const trip = useTripStore((s) => s.trip);
  const loadTrip = useTripStore((s) => s.loadTrip);

  // Kick off the initial fetch once, the first time this gate mounts.
  // Deliberately not depending on `loadTrip` itself (a stable Zustand
  // action reference) to avoid re-running on every render.
  useEffect(() => {
    if (status === "idle") {
      loadTrip();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (status === "idle" || status === "loading") {
    return <div className="py-24 text-center text-sm text-ink-500">Loading your trip…</div>;
  }

  if (status === "error") {
    return (
      <EmptyState
        icon={<TriangleAlert className="h-10 w-10 text-danger-500" />}
        title="Couldn't load your trip"
        description={error ?? "Something went wrong talking to the server."}
        action={
          <Button variant="accent" onClick={() => loadTrip()}>
            Try again
          </Button>
        }
      />
    );
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
