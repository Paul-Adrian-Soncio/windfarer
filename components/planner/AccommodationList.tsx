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
import { formatShortDate } from "@/lib/date/format";
import { Trip } from "@/types";

export function AccommodationList({ trip }: { trip: Trip }) {
  const addAccommodation = useTripStore((s) => s.addAccommodation);
  const updateAccommodation = useTripStore((s) => s.updateAccommodation);
  const removeAccommodation = useTripStore((s) => s.removeAccommodation);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingAcc = editingId ? trip.accommodations.find((a) => a.id === editingId) : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Hotel className="h-[19px] w-[19px] text-primary-700" strokeWidth={1.9} />
          Where you&apos;ll stay
        </CardTitle>
        {!showForm && (
          <Button size="sm" variant="secondary" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5" /> Add stay
          </Button>
        )}
      </CardHeader>

      <AccommodationForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={(acc) => addAccommodation(acc)}
      />

      {editingAcc && (
        <AccommodationForm
          open
          initial={editingAcc}
          onClose={() => setEditingId(null)}
          onSubmit={(patch) => updateAccommodation(editingAcc.id, patch)}
        />
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
            meta={`${acc.place.name.toUpperCase()} · ${formatShortDate(acc.checkIn)} → ${formatShortDate(acc.checkOut)}`}
            price={acc.cost !== undefined ? fmtMoney(acc.cost, trip.budget.currency) : undefined}
            notes={acc.notes}
            onEdit={() => setEditingId(acc.id)}
            onRemove={() => removeAccommodation(acc.id).catch(() => {})}
          />
        ))}
      </div>
    </Card>
  );
}
