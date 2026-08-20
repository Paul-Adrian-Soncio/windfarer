"use client";

import { useState } from "react";
import { Plus, ShieldCheck, UtensilsCrossed, Luggage } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TravelSegmentForm } from "./TravelSegmentForm";
import { TicketStub } from "./TicketStub";
import { useTripStore } from "@/store/tripStore";
import { getTravelModeOption } from "@/lib/constants";
import { formatShortDate } from "@/lib/date/format";
import { Trip } from "@/types";

// mealsIncluded is boolean | string (a free-text description is allowed,
// e.g. "Snacks only") — but after a round-trip through the API, a `false`
// value can come back as the literal string "false", which a bare truthy
// check would wrongly treat as "meals included." Treat both false and the
// string "false" as not-included.
function isMealsIncluded(value: boolean | string | undefined): boolean {
  if (!value) return false;
  return value !== "false";
}

export function TravelSegmentList({ trip }: { trip: Trip }) {
  const addTravelSegment = useTripStore((s) => s.addTravelSegment);
  const updateTravelSegment = useTripStore((s) => s.updateTravelSegment);
  const removeTravelSegment = useTripStore((s) => s.removeTravelSegment);
  const [showForm, setShowForm] = useState(false);
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);

  const editingSegment = editingSegmentId
    ? trip.travelSegments.find((s) => s.id === editingSegmentId)
    : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Getting there (and back)</CardTitle>
        {!showForm && (
          <Button size="sm" variant="secondary" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5" /> Add leg
          </Button>
        )}
      </CardHeader>

      <TravelSegmentForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={async (segment) => {
          await addTravelSegment(segment);
        }}
      />

      {editingSegment && (
        <TravelSegmentForm
          open
          initial={editingSegment}
          onClose={() => setEditingSegmentId(null)}
          onSubmit={(patch) => updateTravelSegment(editingSegment.id, patch)}
        />
      )}

      {trip.travelSegments.length === 0 && !showForm && (
        <p className="text-sm text-ink-500">No travel legs added yet — flights, boats, trains, or the drive there.</p>
      )}

      <div className="flex flex-col">
        {trip.travelSegments.map((segment, i) => {
          const { label, icon: Icon } = getTravelModeOption(segment.mode);
          const route = `${segment.fromPlace?.name ?? "?"} → ${segment.toPlace?.name ?? "?"}${
            segment.departureDate ? ` · ${formatShortDate(segment.departureDate).toUpperCase()}` : ""
          }`;

          return (
            <div key={segment.id}>
              {i > 0 && <div className="ml-[33px] h-4 border-l-2 border-dotted border-secondary-500 opacity-60" />}
              <TicketStub
                icon={<Icon />}
                title={`${label}${segment.providerName ? ` · ${segment.providerName}` : ""}`}
                route={route}
                cost={segment.cost}
                currency={trip.budget.currency}
                onEdit={() => setEditingSegmentId(segment.id)}
                onRemove={() => {
                  // Fire-and-forget: the store already records the failure
                  // in its shared `error` state; this .catch just prevents
                  // an unhandled promise rejection in the console.
                  removeTravelSegment(segment.id).catch(() => {});
                }}
                badges={
                  <>
                    {segment.isLayover && <Badge className="bg-amber-tint text-amber">Layover</Badge>}
                    {segment.plane?.flightInsurance && (
                      <Badge className="bg-moss-tint text-moss">
                        <ShieldCheck className="h-3 w-3" /> Insured
                      </Badge>
                    )}
                    {isMealsIncluded(segment.plane?.mealsIncluded) && (
                      <Badge className="bg-secondary-tint text-secondary-ink">
                        <UtensilsCrossed className="h-3 w-3" /> Meals
                      </Badge>
                    )}
                    {segment.plane?.luggage && (
                      <Badge className="bg-ink-100 text-ink-700">
                        <Luggage className="h-3 w-3" /> {segment.plane.luggage.count} bag
                        {segment.plane.luggage.count === 1 ? "" : "s"}
                      </Badge>
                    )}
                  </>
                }
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
