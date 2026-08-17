"use client";

import { useState } from "react";
import { Compass } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useTripStore } from "@/store/tripStore";
import { CURRENCY_OPTIONS, DEFAULT_CURRENCY } from "@/lib/currency";
import { Trip } from "@/types";

export function TripBasicsForm({ trip }: { trip: Trip | null }) {
  const createTrip = useTripStore((s) => s.createTrip);
  const updateTripBasics = useTripStore((s) => s.updateTripBasics);
  const setCurrency = useTripStore((s) => s.setCurrency);

  const [destination, setDestination] = useState(trip?.destination.name ?? "");
  const [departureDate, setDepartureDate] = useState(trip?.departureDate ?? "");
  const [departureTime, setDepartureTime] = useState(trip?.departureTime ?? "");
  const [arrivalDate, setArrivalDate] = useState(trip?.arrivalDate ?? "");
  const [arrivalTime, setArrivalTime] = useState(trip?.arrivalTime ?? "");
  const [returnDate, setReturnDate] = useState(trip?.returnDate ?? "");
  const [returnTime, setReturnTime] = useState(trip?.returnTime ?? "");
  const [currency, setCurrencyDraft] = useState(trip?.budget.currency ?? DEFAULT_CURRENCY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!destination || !departureDate || !arrivalDate || !returnDate) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (trip) {
        await updateTripBasics({
          destination: { name: destination, lat: trip.destination.lat, lng: trip.destination.lng },
          departureDate,
          departureTime: departureTime || undefined,
          arrivalDate,
          arrivalTime: arrivalTime || undefined,
          returnDate,
          returnTime: returnTime || undefined,
        });
        // NOTE: currency changes on an existing trip aren't wired to the API
        // yet — setCurrency is still local-only, part of the budget-related
        // actions this migration hasn't reached. Real for new trips (below),
        // a known gap for edits to an existing one.
        if (currency !== trip.budget.currency) setCurrency(currency);
      } else {
        await createTrip({
          destination: { name: destination, lat: null, lng: null },
          departureDate,
          departureTime: departureTime || undefined,
          arrivalDate,
          arrivalTime: arrivalTime || undefined,
          returnDate,
          returnTime: returnTime || undefined,
          currency,
        });
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Compass className="h-[19px] w-[19px] text-primary-700" strokeWidth={1.9} />
          Where are you headed?
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <Field label="Destination">
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Kyoto, Japan"
              required
            />
          </Field>
          <Field label="Currency">
            <Select value={currency} onChange={(e) => setCurrencyDraft(e.target.value)} className="sm:w-[110px]">
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} {c.symbol}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Departure date" hint="Leaving home">
            <Input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} required />
          </Field>
          <Field label="Departure time (optional)">
            <Input type="time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} />
          </Field>

          <Field label="Arrival date" hint="Landing at destination">
            <Input type="date" value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} required />
          </Field>
          <Field label="Arrival time (optional)">
            <Input type="time" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} />
          </Field>

          <Field label="Return date" hint="Going home">
            <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} required />
          </Field>
          <Field label="Return time (optional)">
            <Input type="time" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} />
          </Field>
        </div>

        {submitError && <p className="text-sm text-danger-600">{submitError}</p>}

        <div>
          <Button type="submit" variant="accent" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : trip ? "Save changes" : "Start this trip"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
