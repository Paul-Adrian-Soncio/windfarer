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
import { Trip } from "@/types";

export function TravelSegmentList({ trip }: { trip: Trip }) {
  const addTravelSegment = useTripStore((s) => s.addTravelSegment);
  const removeTravelSegment = useTripStore((s) => s.removeTravelSegment);
  const [showForm, setShowForm] = useState(false);

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

      {showForm && (
        <div className="mb-4">
          <TravelSegmentForm
            onSubmit={(segment) => {
              addTravelSegment(segment);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {trip.travelSegments.length === 0 && !showForm && (
        <p className="text-sm text-ink-500">No travel legs added yet — flights, boats, trains, or the drive there.</p>
      )}

      <div className="flex flex-col">
        {trip.travelSegments.map((segment, i) => {
          const { label, icon: Icon } = getTravelModeOption(segment.mode);
          const route = `${segment.fromPlace?.name ?? "?"} → ${segment.toPlace?.name ?? "?"}${
            segment.departureDate ? ` · ${segment.departureDate.toUpperCase()}` : ""
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
                onRemove={() => removeTravelSegment(segment.id)}
                badges={
                  <>
                    {segment.isLayover && <Badge className="bg-amber-tint text-amber">Layover</Badge>}
                    {segment.plane?.flightInsurance && (
                      <Badge className="bg-moss-tint text-moss">
                        <ShieldCheck className="h-3 w-3" /> Insured
                      </Badge>
                    )}
                    {segment.plane?.mealsIncluded && (
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
