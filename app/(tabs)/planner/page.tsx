"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { useTripStore } from "@/store/tripStore";
import { Button } from "@/components/ui/Button";
import { TripBasicsForm } from "@/components/planner/TripBasicsForm";
import { TravelSegmentList } from "@/components/planner/TravelSegmentList";
import { AccommodationList } from "@/components/planner/AccommodationList";
import { AdvanceBookingList } from "@/components/planner/AdvanceBookingList";

export default function PlannerPage() {
  const trip = useTripStore((s) => s.trip);
  const status = useTripStore((s) => s.status);
  const loadTrips = useTripStore((s) => s.loadTrips);

  // With multi-trip, `trip` here means "the active trip" — Planner still
  // edits that one by default. To start a second (or later) trip without
  // touching the active one, this local toggle switches TripBasicsForm
  // into its own create flow (trip={null}) even while one is already
  // active; creating there sets the new trip active (see tripStore's
  // createTrip), same as the very first trip a user ever makes.
  const [creatingNew, setCreatingNew] = useState(false);

  // Same initial-load trigger as TripGate — this page intentionally isn't
  // wrapped in TripGate, since it needs to render (the "create a trip"
  // form) even when there's no active trip yet.
  useEffect(() => {
    if (status === "idle") {
      loadTrips();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Once a trip becomes active again (the new trip's own createTrip
  // resolved), drop back into "editing the active trip" mode automatically
  // rather than leaving the form stuck in create mode. Tracked here
  // instead of a setState-in-effect: whenever the active trip's id
  // changes out from under `creatingNew`, treat that as the signal to
  // exit create mode, without a render-then-correct round trip.
  const [lastSeenTripId, setLastSeenTripId] = useState(trip?.id);
  if (trip?.id !== lastSeenTripId) {
    setLastSeenTripId(trip?.id);
    if (creatingNew && trip) setCreatingNew(false);
  }

  if (status === "idle" || status === "loading") {
    return <div className="py-24 text-center text-sm text-ink-500">Loading your trip…</div>;
  }

  const formTrip = creatingNew ? null : trip;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-[27px] font-bold tracking-tight text-ink-900">Travel Planner</h1>
          <p className="mt-1 text-[14.5px] text-ink-500">
            {creatingNew
              ? "Tell us about this new trip — it'll become your active one once saved."
              : "Let's map out how you're getting there and where you'll land."}
          </p>
        </div>
        {trip && (
          <Button
            variant={creatingNew ? "ghost" : "secondary"}
            size="sm"
            onClick={() => setCreatingNew((v) => !v)}
            className="shrink-0"
          >
            {creatingNew ? (
              <>
                <X className="h-3.5 w-3.5" strokeWidth={2} /> Cancel
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" strokeWidth={2} /> Plan a new trip
              </>
            )}
          </Button>
        )}
      </div>

      {/* Keyed by trip id (or "new" while creating) so switching the active
          trip — or toggling into/out of "Plan a new trip" — forces a clean
          remount instead of reusing the previous trip's stale local state
          (departureDate, destination, etc. are all useState initializers
          that only run once per mount; see the matching fix in
          CountdownCard for the read-only version of this same bug). */}
      <TripBasicsForm key={formTrip?.id ?? "new"} trip={formTrip} />

      {formTrip && (
        <>
          <TravelSegmentList trip={formTrip} />
          <AccommodationList trip={formTrip} />
          <AdvanceBookingList trip={formTrip} />
        </>
      )}
    </div>
  );
}
