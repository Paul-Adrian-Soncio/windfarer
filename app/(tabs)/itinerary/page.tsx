"use client";

import { Plus, CalendarRange } from "lucide-react";
import { TripGate } from "@/components/layout/TripGate";
import { DayCanvas } from "@/components/itinerary/DayCanvas";
import { ItineraryDndContext } from "@/components/itinerary/dnd/ItineraryDndContext";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTripStore } from "@/store/tripStore";

export default function ItineraryPage() {
  const trip = useTripStore((s) => s.trip);
  const blocks = useTripStore((s) => s.blocks);
  const addDay = useTripStore((s) => s.addDay);

  return (
    <TripGate>
      {trip && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-[27px] font-bold tracking-tight text-ink-900">Itinerary Planner</h1>
              <p className="mt-1 text-[14.5px] text-ink-500">
                Build out each day once you've landed — drag blocks to rearrange.
              </p>
            </div>
            <Button variant="accent" onClick={() => addDay()}>
              <Plus className="h-4 w-4" strokeWidth={2.4} /> Add day
            </Button>
          </div>

          {trip.itineraryDays.length === 0 ? (
            <EmptyState
              icon={<CalendarRange className="h-10 w-10" />}
              title="No days yet"
              description="Add your first day to start dropping in activities, meals, and rest stops."
              action={
                <Button variant="accent" onClick={() => addDay()}>
                  <Plus className="h-4 w-4" /> Add day
                </Button>
              }
            />
          ) : (
            <ItineraryDndContext days={trip.itineraryDays} blocks={blocks}>
              <div className="flex gap-[15px] overflow-x-auto pb-2 pt-1">
                {trip.itineraryDays.map((day) => (
                  <DayCanvas key={day.id} day={day} blocks={blocks} />
                ))}
              </div>
            </ItineraryDndContext>
          )}
        </div>
      )}
    </TripGate>
  );
}
