"use client";

import { useState } from "react";
import { Field, Input } from "@/components/ui/Input";
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      plane:
        mode === "plane"
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
          <Input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
        </Field>
        <Field label="Departure time">
          <Input type="time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} />
        </Field>

        <Field label="Arrival date">
          <Input type="date" value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} />
        </Field>
        <Field label="Arrival time">
          <Input type="time" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} />
        </Field>

        <Field label="Cost (optional)">
          <Input type="number" min="0" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" />
        </Field>
      </div>

      <Toggle checked={isLayover} onChange={setIsLayover} label="This is a layover / connecting leg" />

      {mode === "plane" && (
        <div className="flex flex-col gap-3 rounded-xl bg-primary-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">Flight details</p>
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

      <div className="flex gap-2">
        <Button type="submit">Add leg</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
