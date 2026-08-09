"use client";

import { useState } from "react";
import { Plus, Trash2, Hotel, ArrowRightCircle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AccommodationForm } from "./AccommodationForm";
import { useTripStore } from "@/store/tripStore";
import { Trip } from "@/types";

export function AccommodationList({ trip }: { trip: Trip }) {
  const addAccommodation = useTripStore((s) => s.addAccommodation);
  const removeAccommodation = useTripStore((s) => s.removeAccommodation);
  const [showForm, setShowForm] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hotel className="h-5 w-5 text-primary-500" />
          Where you'll stay
        </CardTitle>
        {!showForm && (
          <Button size="sm" variant="secondary" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> Add stay
          </Button>
        )}
      </CardHeader>

      {showForm && (
        <div className="mb-4">
          <AccommodationForm
            onSubmit={(acc) => {
              addAccommodation(acc);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {trip.accommodations.length === 0 && !showForm && (
        <p className="text-sm text-ink-500">No stays added yet.</p>
      )}

      <ul className="flex flex-col gap-3">
        {trip.accommodations.map((acc) => (
          <li key={acc.id} className="flex items-start justify-between gap-3 rounded-xl border border-ink-100 p-4">
            <div>
              <p className="text-sm font-medium text-ink-900">
                {acc.name}
                {acc.willTransferLater && (
                  <Badge className="ml-2 bg-primary-100 text-primary-700">
                    <ArrowRightCircle className="h-3 w-3" /> Transferring later
                  </Badge>
                )}
              </p>
              <p className="text-xs text-ink-500">
                {acc.place.name} · {acc.checkIn} → {acc.checkOut}
              </p>
              {acc.cost !== undefined && <p className="mt-1 text-xs font-medium text-ink-600">${acc.cost.toFixed(2)}</p>}
              {acc.notes && <p className="mt-1 text-xs text-ink-400">{acc.notes}</p>}
            </div>
            <button
              onClick={() => removeAccommodation(acc.id)}
              className="rounded-full p-1.5 text-ink-300 hover:bg-danger-500/10 hover:text-danger-600"
              aria-label="Remove stay"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
