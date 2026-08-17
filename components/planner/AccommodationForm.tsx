"use client";

import { useState } from "react";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { Accommodation } from "@/types";

interface AccommodationFormProps {
  onSubmit: (acc: Omit<Accommodation, "id">) => Promise<void>;
  onCancel: () => void;
}

export function AccommodationForm({ onSubmit, onCancel }: AccommodationFormProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [willTransferLater, setWillTransferLater] = useState(false);
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !checkIn || !checkOut) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        name,
        place: { name: location || name, lat: null, lng: null },
        checkIn,
        checkInTime: checkInTime || undefined,
        checkOut,
        checkOutTime: checkOutTime || undefined,
        willTransferLater,
        cost: cost ? Number(cost) : undefined,
        notes: notes || undefined,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name of place">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Hotel, Airbnb, friend's house…" required />
        </Field>
        <Field label="Location (optional)">
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Neighborhood / city" />
        </Field>

        <Field label="Check-in date">
          <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
        </Field>
        <Field label="Check-in time (optional)">
          <Input type="time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} />
        </Field>

        <Field label="Check-out date">
          <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required />
        </Field>
        <Field label="Check-out time (optional)">
          <Input type="time" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} />
        </Field>

        <Field label="Cost (optional)">
          <Input type="number" min="0" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" />
        </Field>
      </div>

      <Toggle checked={willTransferLater} onChange={setWillTransferLater} label="Planning to move to a different place later" />

      <Field label="Notes (optional)">
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Confirmation number, host contact, etc." />
      </Field>

      {submitError && <p className="text-sm text-danger-600">{submitError}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding…" : "Add stay"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
