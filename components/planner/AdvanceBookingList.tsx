"use client";

import { useState } from "react";
import { Plus, Ticket } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ListRow } from "./ListRow";
import { AdvanceBookingForm } from "./AdvanceBookingForm";
import { useTripStore } from "@/store/tripStore";
import { fmtMoney } from "@/lib/money";
import { Trip } from "@/types";

export function AdvanceBookingList({ trip }: { trip: Trip }) {
  const addAdvanceBooking = useTripStore((s) => s.addAdvanceBooking);
  const updateAdvanceBooking = useTripStore((s) => s.updateAdvanceBooking);
  const removeAdvanceBooking = useTripStore((s) => s.removeAdvanceBooking);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingBooking = editingId ? trip.advanceBookings.find((b) => b.id === editingId) : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Ticket className="h-[19px] w-[19px] text-primary-700" strokeWidth={1.9} />
          Booked ahead of time
        </CardTitle>
        {!showForm && (
          <Button size="sm" variant="secondary" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5" /> Add booking
          </Button>
        )}
      </CardHeader>

      <AdvanceBookingForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={(b) => addAdvanceBooking(b)}
      />

      {editingBooking && (
        <AdvanceBookingForm
          open
          initial={editingBooking}
          onClose={() => setEditingId(null)}
          onSubmit={(patch) => updateAdvanceBooking(editingBooking.id, patch)}
        />
      )}

      {trip.advanceBookings.length === 0 && !showForm && (
        <p className="text-sm text-ink-500">Nothing booked in advance yet — tickets, tours, reservations, etc.</p>
      )}

      <div className="flex flex-col gap-[11px]">
        {trip.advanceBookings.map((b) => (
          <ListRow
            key={b.id}
            icon={<Ticket />}
            title={b.title}
            price={b.cost !== undefined ? fmtMoney(b.cost, trip.budget.currency) : undefined}
            notes={b.notes}
            onEdit={() => setEditingId(b.id)}
            onRemove={() => removeAdvanceBooking(b.id).catch(() => {})}
          />
        ))}
      </div>
    </Card>
  );
}
