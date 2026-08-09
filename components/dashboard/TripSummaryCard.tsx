import { MapPin, CalendarDays, Hotel } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Trip } from "@/types";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function TripSummaryCard({ trip }: { trip: Trip }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary-500" />
          {trip.destination.name || "Untitled trip"}
        </CardTitle>
      </CardHeader>
      <div className="flex flex-col gap-3 text-sm text-ink-600">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-ink-400" />
          <span>
            {formatDate(trip.departureDate)} → {formatDate(trip.returnDate)}
          </span>
        </div>
        {trip.accommodations.length > 0 && (
          <div className="flex items-center gap-2">
            <Hotel className="h-4 w-4 text-ink-400" />
            <span>
              {trip.accommodations.length} stay{trip.accommodations.length > 1 ? "s" : ""} planned
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
