"use client";

import { useState } from "react";
import { Plus, Ticket } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ListRow } from "./ListRow";
import { useTripStore } from "@/store/tripStore";
import { fmtMoney } from "@/lib/money";
import { Trip } from "@/types";

export function AdvanceBookingList({ trip }: { trip: Trip }) {
  const addAdvanceBooking = useTripStore((s) => s.addAdvanceBooking);
  const removeAdvanceBooking = useTripStore((s) => s.removeAdvanceBooking);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [cost, setCost] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;
    addAdvanceBooking({ title, notes: notes || undefined, cost: cost ? Number(cost) : undefined });
    setTitle("");
    setNotes("");
    setCost("");
    setShowForm(false);
  }

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

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-4">
          <Field label="What did you book?">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Museum tickets, cooking class" required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Notes (optional)">
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Confirmation number, time, etc." />
            </Field>
            <Field label="Cost (optional)">
              <Input type="number" min="0" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" />
            </Field>
          </div>
          <div className="flex gap-2">
            <Button type="submit">Add booking</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
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
            onRemove={() => removeAdvanceBooking(b.id)}
          />
        ))}
      </div>
    </Card>
  );
}
