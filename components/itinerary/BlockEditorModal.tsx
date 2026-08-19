"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { TimePicker } from "@/components/ui/TimePicker";
import { Dropdown } from "@/components/ui/Dropdown";
import { Button } from "@/components/ui/Button";
import { BLOCK_TYPE_OPTIONS } from "@/lib/constants";
import { BlockType, ItineraryBlock } from "@/types";

interface BlockEditorModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (block: Omit<ItineraryBlock, "id" | "dayId">) => Promise<void>;
  initial?: ItineraryBlock;
}

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
const LOCAL_TRAVEL_MODES = ["walk", "taxi", "transit", "rideshare", "other"] as const;

export function BlockEditorModal({ open, onClose, onSubmit, initial }: BlockEditorModalProps) {
  const [type, setType] = useState<BlockType>(initial?.type ?? "activity");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [scheduledTime, setScheduledTime] = useState(initial?.scheduledTime ?? "");
  const [plannedExpense, setPlannedExpense] = useState(initial?.plannedExpense?.toString() ?? "");
  const [locationName, setLocationName] = useState(initial?.location?.name ?? "");
  const [mealType, setMealType] = useState(initial?.mealType ?? "breakfast");
  const [travelMode, setTravelMode] = useState(initial?.travelMode ?? "walk");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        type,
        title,
        description: description || undefined,
        scheduledTime: scheduledTime || undefined,
        plannedExpense: plannedExpense ? Number(plannedExpense) : undefined,
        location: locationName ? { name: locationName, lat: null, lng: null } : undefined,
        mealType: type === "meal" ? mealType : undefined,
        travelMode: type === "travel" ? travelMode : undefined,
      });
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit block" : "Add a block"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Type">
          <div className="flex flex-wrap gap-[7px]">
            {BLOCK_TYPE_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={`flex min-w-[60px] flex-1 flex-col items-center gap-[5px] rounded-xl border-[1.5px] py-2.5 text-[11px] font-semibold transition-colors ${
                  type === value
                    ? "border-primary-700 bg-primary-tint text-primary-700"
                    : "border-hair bg-surface-2 text-ink-700"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                {label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Title">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's happening?" required />
        </Field>

        <Field label="Notes (optional)">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Scheduled time (optional)">
            <TimePicker value={scheduledTime} onChange={setScheduledTime} aria-label="Scheduled time" />
          </Field>
          <Field label="Planned expense (optional)">
            <Input type="number" min="0" step="0.01" value={plannedExpense} onChange={(e) => setPlannedExpense(e.target.value)} placeholder="0.00" />
          </Field>
        </div>

        {(type === "activity" || type === "visit") && (
          <Field label="Location (optional)">
            <Input value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="Where?" />
          </Field>
        )}

        {type === "meal" && (
          <Field label="Meal">
            <Dropdown
              value={mealType}
              onChange={(v) => setMealType(v as typeof mealType)}
              options={MEAL_TYPES.map((m) => ({ value: m, label: m[0].toUpperCase() + m.slice(1) }))}
            />
          </Field>
        )}

        {type === "travel" && (
          <Field label="Getting there by">
            <Dropdown
              value={travelMode}
              onChange={(v) => setTravelMode(v as typeof travelMode)}
              options={LOCAL_TRAVEL_MODES.map((m) => ({ value: m, label: m[0].toUpperCase() + m.slice(1) }))}
            />
          </Field>
        )}

        {submitError && <p className="text-sm text-danger-600">{submitError}</p>}

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : initial ? "Save changes" : "Add block"}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
