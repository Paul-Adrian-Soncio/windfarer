"use client";

import { useState } from "react";
import { Compass } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimePicker } from "@/components/ui/TimePicker";
import { Dropdown } from "@/components/ui/Dropdown";
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

    // The date pickers already disable picking an out-of-order date, but a
    // value can still go stale — e.g. arrival was set, then departure got
    // moved to something later than it. Catch that here rather than let it
    // reach the server.
    if (arrivalDate < departureDate) {
      setSubmitError("Arrival date can't be before departure date.");
      return;
    }
    if (returnDate < arrivalDate) {
      setSubmitError("Return date can't be before arrival date.");
      return;
    }

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
        // Currency lives on the Trip row but isn't part of updateTripBasics's
        // patch shape (that's Trip's own fields; budget is a nested object) —
        // a separate call, same as the Budget tab's currency picker uses.
        if (currency !== trip.budget.currency) await setCurrency(currency);
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
            <Dropdown
              value={currency}
              onChange={setCurrencyDraft}
              options={CURRENCY_OPTIONS.map((c) => ({ value: c.code, label: `${c.code} ${c.symbol}` }))}
              className="sm:w-[110px]"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Departure date" hint="Leaving home">
            <DatePicker value={departureDate} onChange={setDepartureDate} required aria-label="Departure date" />
          </Field>
          <Field label="Departure time (optional)">
            <TimePicker value={departureTime} onChange={setDepartureTime} aria-label="Departure time" />
          </Field>

          <Field label="Arrival date" hint="Landing at destination">
            <DatePicker
              value={arrivalDate}
              onChange={setArrivalDate}
              minDate={departureDate || undefined}
              required
              aria-label="Arrival date"
            />
          </Field>
          <Field label="Arrival time (optional)">
            <TimePicker
              value={arrivalTime}
              onChange={setArrivalTime}
              // Only meaningful when arrival and departure are the same
              // day — landing tomorrow can be any time, but landing today
              // can't be before you left.
              minTime={arrivalDate && arrivalDate === departureDate ? departureTime || undefined : undefined}
              aria-label="Arrival time"
            />
          </Field>

          <Field label="Return date" hint="Going home">
            <DatePicker
              value={returnDate}
              onChange={setReturnDate}
              minDate={arrivalDate || departureDate || undefined}
              required
              aria-label="Return date"
            />
          </Field>
          <Field label="Return time (optional)">
            <TimePicker
              value={returnTime}
              onChange={setReturnTime}
              minTime={returnDate && returnDate === arrivalDate ? arrivalTime || undefined : undefined}
              aria-label="Return time"
            />
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
