import { MapPin, CalendarDays, Hotel } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Trip } from "@/types";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function TripSummaryCard({ trip }: { trip: Trip }) {
  return (
    <Card>
      <div className="flex items-center gap-2 font-display text-[22px] font-bold text-ink-900">
        <MapPin className="h-5 w-5 text-accent-500" strokeWidth={2} />
        {trip.destination.name || "Untitled trip"}
      </div>
      <div className="mt-3 flex flex-col gap-2.5 text-sm text-ink-700">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-[17px] w-[17px] shrink-0 text-secondary-ink" strokeWidth={1.9} />
          <span className="font-mono text-[13.5px] text-ink-900">
            {formatDate(trip.departureDate)} → {formatDate(trip.returnDate)}
          </span>
        </div>
        {trip.accommodations.length > 0 && (
          <div className="flex items-center gap-2">
            <Hotel className="h-[17px] w-[17px] shrink-0 text-secondary-ink" strokeWidth={1.9} />
            <span>
              {trip.accommodations.length} stay{trip.accommodations.length > 1 ? "s" : ""} planned
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
