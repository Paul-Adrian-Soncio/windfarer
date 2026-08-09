"use client";

import { useState } from "react";
import { Plus, Trash2, ShieldCheck, UtensilsCrossed, Luggage } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TravelSegmentForm } from "./TravelSegmentForm";
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
            <Plus className="h-4 w-4" /> Add leg
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

      <ul className="flex flex-col gap-3">
        {trip.travelSegments.map((segment) => {
          const { label, icon: Icon } = getTravelModeOption(segment.mode);
          return (
            <li key={segment.id} className="flex items-start justify-between gap-3 rounded-xl border border-ink-100 p-4">
              <div className="flex gap-3">
                <div className="mt-0.5 rounded-full bg-primary-100 p-2 text-primary-700">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink-900">
                    {label}
                    {segment.providerName ? ` · ${segment.providerName}` : ""}
                    {segment.isLayover && (
                      <Badge className="ml-2 bg-warning-500/15 text-warning-600">Layover</Badge>
                    )}
                  </p>
                  <p className="text-xs text-ink-500">
                    {segment.fromPlace?.name ?? "?"} → {segment.toPlace?.name ?? "?"}
                    {segment.departureDate ? ` · ${segment.departureDate}` : ""}
                  </p>
                  {segment.plane && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {segment.plane.flightInsurance && (
                        <Badge className="bg-success-500/15 text-success-600">
                          <ShieldCheck className="h-3 w-3" /> Insured
                        </Badge>
                      )}
                      {segment.plane.mealsIncluded && (
                        <Badge className="bg-accent-100 text-accent-700">
                          <UtensilsCrossed className="h-3 w-3" /> Meals
                        </Badge>
                      )}
                      {segment.plane.luggage && (
                        <Badge className="bg-ink-100 text-ink-600">
                          <Luggage className="h-3 w-3" /> {segment.plane.luggage.count} bag
                          {segment.plane.luggage.count === 1 ? "" : "s"}
                        </Badge>
                      )}
                    </div>
                  )}
                  {segment.cost !== undefined && (
                    <p className="mt-1 text-xs font-medium text-ink-600">${segment.cost.toFixed(2)}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeTravelSegment(segment.id)}
                className="rounded-full p-1.5 text-ink-300 hover:bg-danger-500/10 hover:text-danger-600"
                aria-label="Remove leg"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
