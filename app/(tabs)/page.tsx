"use client";

import { useTripStore } from "@/store/tripStore";
import { TripGate } from "@/components/layout/TripGate";
import { CountdownCard } from "@/components/dashboard/CountdownCard";
import { WeatherForecastCard } from "@/components/dashboard/WeatherForecastCard";
import { TripSummaryCard } from "@/components/dashboard/TripSummaryCard";

export default function HomePage() {
  const trip = useTripStore((s) => s.trip);

  return (
    <TripGate>
      {trip && (
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="font-display text-[27px] font-bold tracking-tight text-ink-900">
              Welcome back, fellow wanderer
            </h1>
            <p className="mt-1 text-[14.5px] text-ink-500">Here's where things stand for your trip.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <CountdownCard departureDate={trip.departureDate} departureTime={trip.departureTime} />
            <TripSummaryCard trip={trip} />
          </div>
          <WeatherForecastCard trip={trip} />
        </div>
      )}
    </TripGate>
  );
}
