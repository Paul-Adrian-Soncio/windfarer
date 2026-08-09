"use client";

import { useState } from "react";
import { Plus, Hotel, ArrowRightCircle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AccommodationForm } from "./AccommodationForm";
import { ListRow } from "./ListRow";
import { useTripStore } from "@/store/tripStore";
import { fmtMoney } from "@/lib/money";
import { Trip } from "@/types";

export function AccommodationList({ trip }: { trip: Trip }) {
  const addAccommodation = useTripStore((s) => s.addAccommodation);
  const removeAccommodation = useTripStore((s) => s.removeAccommodation);
  const [showForm, setShowForm] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Hotel className="h-[19px] w-[19px] text-primary-700" strokeWidth={1.9} />
          Where you'll stay
        </CardTitle>
        {!showForm && (
          <Button size="sm" variant="secondary" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5" /> Add stay
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

      <div className="flex flex-col gap-[11px]">
        {trip.accommodations.map((acc) => (
          <ListRow
            key={acc.id}
            icon={<Hotel />}
            title={
              <>
                {acc.name}
                {acc.willTransferLater && (
                  <Badge className="ml-2 bg-primary-tint text-primary-700">
                    <ArrowRightCircle className="h-3 w-3" /> Transferring later
                  </Badge>
                )}
              </>
            }
            meta={`${acc.place.name.toUpperCase()} · ${acc.checkIn} → ${acc.checkOut}`}
            price={acc.cost !== undefined ? fmtMoney(acc.cost) : undefined}
            notes={acc.notes}
            onRemove={() => removeAccommodation(acc.id)}
          />
        ))}
      </div>
    </Card>
  );
}
