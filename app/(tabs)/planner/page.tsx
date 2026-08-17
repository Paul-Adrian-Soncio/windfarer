"use client";

import { useEffect } from "react";
import { useTripStore } from "@/store/tripStore";
import { TripBasicsForm } from "@/components/planner/TripBasicsForm";
import { TravelSegmentList } from "@/components/planner/TravelSegmentList";
import { AccommodationList } from "@/components/planner/AccommodationList";
import { AdvanceBookingList } from "@/components/planner/AdvanceBookingList";

export default function PlannerPage() {
  const trip = useTripStore((s) => s.trip);
  const status = useTripStore((s) => s.status);
  const loadTrip = useTripStore((s) => s.loadTrip);

  // Same initial-load trigger as TripGate — this page intentionally isn't
  // wrapped in TripGate, since it needs to render (the "create a trip"
  // form) even when there's no trip yet.
  useEffect(() => {
    if (status === "idle") {
      loadTrip();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (status === "idle" || status === "loading") {
    return <div className="py-24 text-center text-sm text-ink-500">Loading your trip…</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-[27px] font-bold tracking-tight text-ink-900">Travel Planner</h1>
        <p className="mt-1 text-[14.5px] text-ink-500">Let's map out how you're getting there and where you'll land.</p>
      </div>

      <TripBasicsForm trip={trip} />

      {trip && (
        <>
          <TravelSegmentList trip={trip} />
          <AccommodationList trip={trip} />
          <AdvanceBookingList trip={trip} />
        </>
      )}
    </div>
  );
}
