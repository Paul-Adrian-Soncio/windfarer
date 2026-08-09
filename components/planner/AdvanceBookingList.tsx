"use client";

import { useState } from "react";
import { Plus, Trash2, Ticket } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useTripStore } from "@/store/tripStore";
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
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary-500" />
          Booked ahead of time
        </CardTitle>
        {!showForm && (
          <Button size="sm" variant="secondary" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> Add booking
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

      <ul className="flex flex-col gap-3">
        {trip.advanceBookings.map((b) => (
          <li key={b.id} className="flex items-start justify-between gap-3 rounded-xl border border-ink-100 p-4">
            <div>
              <p className="text-sm font-medium text-ink-900">{b.title}</p>
              {b.notes && <p className="text-xs text-ink-500">{b.notes}</p>}
              {b.cost !== undefined && <p className="mt-1 text-xs font-medium text-ink-600">${b.cost.toFixed(2)}</p>}
            </div>
            <button
              onClick={() => removeAdvanceBooking(b.id)}
              className="rounded-full p-1.5 text-ink-300 hover:bg-danger-500/10 hover:text-danger-600"
              aria-label="Remove booking"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
