"use client";

import { useState } from "react";
import { MapPinned, CalendarDays, Check, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dropdown } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import { useTripStore } from "@/store/tripStore";
import { formatShortDate } from "@/lib/date/format";
import { cn } from "@/lib/cn";
import { TripStatus, TripSummary } from "@/types";

const STATUS_OPTIONS: { value: TripStatus; label: string }[] = [
  { value: "scheduled", label: "Scheduled" },
  { value: "ongoing", label: "Ongoing" },
  { value: "complete", label: "Complete" },
  { value: "cancelled", label: "Cancelled" },
];

// Tint pairs already used elsewhere in the app (see TravelSegmentList's
// Badge usage) — reused here rather than inventing a new palette.
const STATUS_BADGE_CLASSES: Record<TripStatus, string> = {
  scheduled: "bg-secondary-tint text-secondary-ink",
  ongoing: "bg-moss-tint text-moss",
  complete: "bg-primary-tint text-primary-700",
  cancelled: "bg-brick-tint text-brick",
};

export function TripsListCard() {
  const trips = useTripStore((s) => s.trips);
  const activeTripId = useTripStore((s) => s.activeTripId);
  const setActiveTrip = useTripStore((s) => s.setActiveTrip);
  const updateTripStatus = useTripStore((s) => s.updateTripStatus);
  const deleteTrip = useTripStore((s) => s.deleteTrip);

  const [pendingDelete, setPendingDelete] = useState<TripSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (trips.length === 0) return null;

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteTrip(pendingDelete.id);
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <MapPinned className="h-[19px] w-[19px] text-primary-700" strokeWidth={1.9} />
          Your trips
        </CardTitle>
      </CardHeader>

      <div className="flex flex-col gap-2.5">
        {trips.map((trip) => {
          const isActive = trip.id === activeTripId;
          return (
            <div
              key={trip.id}
              className={cn(
                "flex flex-col gap-2.5 rounded-lg border p-3.5 sm:flex-row sm:items-center sm:justify-between",
                isActive ? "border-primary-500 bg-primary-50" : "border-hair bg-surface-2"
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-display text-[15px] font-bold text-ink-900">
                    {trip.destination.name || "Untitled trip"}
                  </p>
                  <Badge className={STATUS_BADGE_CLASSES[trip.status]}>
                    {STATUS_OPTIONS.find((o) => o.value === trip.status)?.label}
                  </Badge>
                  {isActive && (
                    <Badge className="bg-primary-700 text-white">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      Active
                    </Badge>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[12.5px] text-ink-500">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" strokeWidth={1.9} />
                  <span className="font-mono">
                    {formatShortDate(trip.departureDate)} → {formatShortDate(trip.returnDate)}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Dropdown
                  value={trip.status}
                  onChange={(value) => updateTripStatus(trip.id, value as TripStatus)}
                  options={STATUS_OPTIONS}
                  aria-label={`Status for ${trip.destination.name || "trip"}`}
                  className="w-[132px] py-1.5 text-[13px]"
                />
                {!isActive && (
                  <Button variant="secondary" size="sm" onClick={() => setActiveTrip(trip.id)}>
                    Set active
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => setPendingDelete(trip)}
                  aria-label={`Delete ${trip.destination.name || "trip"}`}
                  className="rounded-lg p-2 text-ink-500 hover:bg-danger-tint hover:text-danger-600"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.9} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={pendingDelete !== null}
        onClose={() => (deleting ? undefined : setPendingDelete(null))}
        title="Delete this trip?"
      >
        <p className="text-sm text-ink-500">
          {pendingDelete?.destination.name || "This trip"} and everything in it — travel, itinerary, budget — will
          be permanently deleted. This can&apos;t be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setPendingDelete(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete trip"}
          </Button>
        </div>
      </Modal>
    </Card>
  );
}
