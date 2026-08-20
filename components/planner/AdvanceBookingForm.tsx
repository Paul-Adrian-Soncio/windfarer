"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AdvanceBooking } from "@/types";

interface AdvanceBookingFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (booking: Omit<AdvanceBooking, "id">) => Promise<void>;
  // Pass an existing booking to edit it in place — same `initial` contract
  // as the other planner forms (TravelSegmentForm, AccommodationForm).
  // Omit to create a new one.
  initial?: AdvanceBooking;
}

/**
 * Was previously an inline form built directly into AdvanceBookingList —
 * pulled out here, modal-wrapped, so it can double as the edit form too
 * (same reasoning as TravelSegmentForm/AccommodationForm's split).
 */
export function AdvanceBookingForm({ open, onClose, onSubmit, initial }: AdvanceBookingFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [cost, setCost] = useState(initial?.cost?.toString() ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({ title, notes: notes || undefined, cost: cost ? Number(cost) : undefined });
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit booking" : "Add a booking"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        {submitError && <p className="text-sm text-danger-600">{submitError}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : initial ? "Save changes" : "Add booking"}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
