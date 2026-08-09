"use client";

import { useState } from "react";
import { Compass } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useTripStore } from "@/store/tripStore";
import { Trip } from "@/types";

export function TripBasicsForm({ trip }: { trip: Trip | null }) {
  const createTrip = useTripStore((s) => s.createTrip);
  const updateTripBasics = useTripStore((s) => s.updateTripBasics);

  const [destination, setDestination] = useState(trip?.destination.name ?? "");
  const [departureDate, setDepartureDate] = useState(trip?.departureDate ?? "");
  const [departureTime, setDepartureTime] = useState(trip?.departureTime ?? "");
  const [arrivalDate, setArrivalDate] = useState(trip?.arrivalDate ?? "");
  const [arrivalTime, setArrivalTime] = useState(trip?.arrivalTime ?? "");
  const [returnDate, setReturnDate] = useState(trip?.returnDate ?? "");
  const [returnTime, setReturnTime] = useState(trip?.returnTime ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!destination || !departureDate || !arrivalDate || !returnDate) return;

    if (trip) {
      updateTripBasics({
        destination: { name: destination, lat: trip.destination.lat, lng: trip.destination.lng },
        departureDate,
        departureTime: departureTime || undefined,
        arrivalDate,
        arrivalTime: arrivalTime || undefined,
        returnDate,
        returnTime: returnTime || undefined,
      });
    } else {
      createTrip({
        destination: { name: destination, lat: null, lng: null },
        departureDate,
        departureTime: departureTime || undefined,
        arrivalDate,
        arrivalTime: arrivalTime || undefined,
        returnDate,
        returnTime: returnTime || undefined,
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-primary-500" />
          Where are you headed?
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Destination">
          <Input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Kyoto, Japan"
            required
          />
        </Field>

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

        <div>
          <Button type="submit" variant="accent">
            {trip ? "Save changes" : "Start this trip"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
