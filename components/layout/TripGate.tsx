"use client";

import { ReactNode, useEffect } from "react";
import { Compass, TriangleAlert } from "lucide-react";
import { useTripStore } from "@/store/tripStore";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface TripGateProps {
  children: ReactNode;
  // Home passes this: it's the one screen a "trips exist, none active" user
  // must be able to reach in order to fix that state (pick one from the
  // list), so it skips that particular block instead of bouncing them back
  // to itself via the empty state's own "Go to your trips" link. Every
  // other tab (Planner's own trip-form branch aside, Itinerary, Budget)
  // still gets the full gate.
  allowNoActiveTrip?: boolean;
}

export function TripGate({ children, allowNoActiveTrip = false }: TripGateProps) {
  const status = useTripStore((s) => s.status);
  const error = useTripStore((s) => s.error);
  const trip = useTripStore((s) => s.trip);
  const trips = useTripStore((s) => s.trips);
  const loadTrips = useTripStore((s) => s.loadTrips);

  // Kick off the initial fetch once, the first time this gate mounts.
  // Deliberately not depending on `loadTrips` itself (a stable Zustand
  // action reference) to avoid re-running on every render.
  useEffect(() => {
    if (status === "idle") {
      loadTrips();
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
          <Button variant="accent" onClick={() => loadTrips()}>
            Try again
          </Button>
        }
      />
    );
  }

  if (!trip && trips.length > 0 && !allowNoActiveTrip) {
    // Trips exist, but none is marked active — e.g. right after deleting
    // the active one. Different from "no trips at all" below: send them
    // to Home's trip list to pick one, not to Planner to create a new one.
    return (
      <EmptyState
        icon={<Compass className="h-10 w-10" />}
        title="No active trip selected"
        description="Pick a trip from your list on Home to make it active — that's the one WindFarer will show here."
        action={
          <Link href="/">
            <Button variant="accent">Go to your trips</Button>
          </Link>
        }
      />
    );
  }

  if (!trip && trips.length === 0) {
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

  // Reaches here in exactly one case: allowNoActiveTrip is set, trips exist,
  // but none is active — render children anyway (Home renders its own
  // conditional sections off `trip` being null, including the trip list
  // that lets the user fix this).
  return <>{children}</>;
}
