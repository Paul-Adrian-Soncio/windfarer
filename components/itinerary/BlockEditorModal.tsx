"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BLOCK_TYPE_OPTIONS } from "@/lib/constants";
import { BlockType, ItineraryBlock } from "@/types";

interface BlockEditorModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (block: Omit<ItineraryBlock, "id" | "dayId">) => void;
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;
    onSubmit({
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
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit block" : "Add a block"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Type">
          <div className="flex flex-wrap gap-2">
            {BLOCK_TYPE_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  type === value ? "border-primary-500 bg-primary-50 text-primary-700" : "border-ink-200 text-ink-600"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
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
            <Input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
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
            <Select value={mealType} onChange={(e) => setMealType(e.target.value as typeof mealType)}>
              {MEAL_TYPES.map((m) => (
                <option key={m} value={m}>
                  {m[0].toUpperCase() + m.slice(1)}
                </option>
              ))}
            </Select>
          </Field>
        )}

        {type === "travel" && (
          <Field label="Getting there by">
            <Select value={travelMode} onChange={(e) => setTravelMode(e.target.value as typeof travelMode)}>
              {LOCAL_TRAVEL_MODES.map((m) => (
                <option key={m} value={m}>
                  {m[0].toUpperCase() + m.slice(1)}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <div className="flex gap-2 pt-2">
          <Button type="submit">{initial ? "Save changes" : "Add block"}</Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
