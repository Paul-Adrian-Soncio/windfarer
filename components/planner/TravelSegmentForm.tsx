"use client";

import { useState } from "react";
import { Field, Input } from "@/components/ui/Input";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimePicker } from "@/components/ui/TimePicker";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { TravelModeSelect } from "./TravelModeSelect";
import { TravelMode, TravelSegment } from "@/types";

interface TravelSegmentFormProps {
  onSubmit: (segment: Omit<TravelSegment, "id">) => void;
  onCancel: () => void;
}

export function TravelSegmentForm({ onSubmit, onCancel }: TravelSegmentFormProps) {
  const [mode, setMode] = useState<TravelMode>("plane");
  const [providerName, setProviderName] = useState("");
  const [fromName, setFromName] = useState("");
  const [toName, setToName] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [isLayover, setIsLayover] = useState(false);
  const [cost, setCost] = useState("");

  const [flightInsurance, setFlightInsurance] = useState(false);
  const [mealsIncluded, setMealsIncluded] = useState(false);
  const [luggageCount, setLuggageCount] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Both dates are optional here, so only enforce ordering once both are
    // actually set — same stale-value safety net as the other planner
    // forms, for when arrival was picked before departure got moved later.
    if (departureDate && arrivalDate && arrivalDate < departureDate) {
      setSubmitError("Arrival date can't be before departure date.");
      return;
    }
    setSubmitError(null);

    onSubmit({
      mode,
      providerName: providerName || undefined,
      fromPlace: fromName ? { name: fromName, lat: null, lng: null } : undefined,
      toPlace: toName ? { name: toName, lat: null, lng: null } : undefined,
      departureDate: departureDate || undefined,
      departureTime: departureTime || undefined,
      arrivalDate: arrivalDate || undefined,
      arrivalTime: arrivalTime || undefined,
      isLayover,
      cost: cost ? Number(cost) : undefined,
      // Only attach plane details when the user actually set one of them —
      // sending {flightInsurance: false, mealsIncluded: false} for every
      // plane-mode segment (even when nothing was toggled) makes "no plane
      // info given" indistinguishable from "explicitly declined," and
      // previously caused a stale-looking "Meals" badge to render even
      // when nothing was selected.
      plane:
        mode === "plane" && (flightInsurance || mealsIncluded || luggageCount)
          ? {
              flightInsurance,
              mealsIncluded,
              luggage: luggageCount ? { count: Number(luggageCount) } : undefined,
            }
          : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Mode of travel">
        <TravelModeSelect value={mode} onChange={setMode} />
      </Field>

      <Field label="Provider / airline / agency (optional)">
        <Input
          value={providerName}
          onChange={(e) => setProviderName(e.target.value)}
          placeholder="e.g. ANA, Hertz, Grand Travel Co."
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="From (optional)">
          <Input value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="Origin" />
        </Field>
        <Field label="To (optional)">
          <Input value={toName} onChange={(e) => setToName(e.target.value)} placeholder="Destination" />
        </Field>

        <Field label="Departure date">
          <DatePicker value={departureDate} onChange={setDepartureDate} aria-label="Departure date" />
        </Field>
        <Field label="Departure time">
          <TimePicker value={departureTime} onChange={setDepartureTime} aria-label="Departure time" />
        </Field>

        <Field label="Arrival date">
          <DatePicker
            value={arrivalDate}
            onChange={setArrivalDate}
            minDate={departureDate || undefined}
            aria-label="Arrival date"
          />
        </Field>
        <Field label="Arrival time">
          <TimePicker
            value={arrivalTime}
            onChange={setArrivalTime}
            minTime={arrivalDate && arrivalDate === departureDate ? departureTime || undefined : undefined}
            aria-label="Arrival time"
          />
        </Field>

        <Field label="Cost (optional)">
          <Input type="number" min="0" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" />
        </Field>
      </div>

      <Toggle checked={isLayover} onChange={setIsLayover} label="This is a layover / connecting leg" />

      {mode === "plane" && (
        <div className="flex flex-col gap-3 rounded-xl bg-primary-tint/60 p-4">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[.1em] text-primary-700">Flight details</p>
          <Toggle checked={flightInsurance} onChange={setFlightInsurance} label="Flight insurance availed" />
          <Toggle checked={mealsIncluded} onChange={setMealsIncluded} label="Meals included" />
          <Field label="Luggage registered (count, optional)">
            <Input
              type="number"
              min="0"
              value={luggageCount}
              onChange={(e) => setLuggageCount(e.target.value)}
              placeholder="e.g. 2"
            />
          </Field>
        </div>
      )}

      {submitError && <p className="text-sm text-danger-600">{submitError}</p>}

      <div className="flex gap-2">
        <Button type="submit">Add leg</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
