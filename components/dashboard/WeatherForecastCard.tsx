"use client";

import { useEffect, useState } from "react";
import { CloudSun, Loader2, Search } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useTripStore } from "@/store/tripStore";
import { geocodePlace, getForecast, describeWeatherCode } from "@/lib/weather/openMeteoClient";
import { DailyForecast, GeocodeResult } from "@/lib/weather/weatherTypes";
import { Trip } from "@/types";

const MAX_FORECAST_DAYS_OUT = 15;

export function WeatherForecastCard({ trip }: { trip: Trip }) {
  const updateTripBasics = useTripStore((s) => s.updateTripBasics);
  const [forecast, setForecast] = useState<DailyForecast[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(trip.destination.name);
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);

  const hasCoords = trip.destination.lat !== null && trip.destination.lng !== null;

  useEffect(() => {
    if (!hasCoords) return;
    const daysOut = Math.ceil((new Date(trip.arrivalDate).getTime() - Date.now()) / 86_400_000);
    if (daysOut > MAX_FORECAST_DAYS_OUT) {
      setForecast(null);
      return;
    }
    // Open-Meteo's free forecast only covers ~16 days from today, regardless of
    // how the trip's own date range is bounded, so clamp the request's end date.
    const latestAvailable = new Date(Date.now() + MAX_FORECAST_DAYS_OUT * 86_400_000);
    const clampedEndDate =
      new Date(trip.returnDate) > latestAvailable
        ? latestAvailable.toISOString().slice(0, 10)
        : trip.returnDate;

    setLoading(true);
    setError(null);
    getForecast(trip.destination.lat!, trip.destination.lng!, trip.arrivalDate, clampedEndDate)
      .then(setForecast)
      .catch(() => setError("Couldn't load the forecast right now."))
      .finally(() => setLoading(false));
  }, [hasCoords, trip.destination.lat, trip.destination.lng, trip.arrivalDate, trip.returnDate]);

  async function handleSearch() {
    setSearching(true);
    try {
      const found = await geocodePlace(query);
      setResults(found);
    } finally {
      setSearching(false);
    }
  }

  function confirmPlace(result: GeocodeResult) {
    updateTripBasics({
      destination: { name: result.name, lat: result.lat, lng: result.lng },
    });
    setResults([]);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudSun className="h-5 w-5 text-primary-500" />
          Weather at {trip.destination.name || "your destination"}
        </CardTitle>
      </CardHeader>

      {!hasCoords && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink-500">Confirm your destination's location to see a live forecast.</p>
          <div className="flex gap-2">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a city…" />
            <Button variant="secondary" onClick={handleSearch} disabled={searching}>
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          {results.length > 0 && (
            <ul className="flex flex-col gap-1">
              {results.map((r, i) => (
                <li key={i}>
                  <button
                    onClick={() => confirmPlace(r)}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-ink-700 hover:bg-primary-50"
                  >
                    {r.name}
                    {r.admin1 ? `, ${r.admin1}` : ""}
                    {r.country ? `, ${r.country}` : ""}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {hasCoords && loading && (
        <div className="flex items-center gap-2 text-sm text-ink-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading forecast…
        </div>
      )}

      {hasCoords && error && <p className="text-sm text-danger-600">{error}</p>}

      {hasCoords && !loading && !error && forecast === null && (
        <p className="text-sm text-ink-500">
          Forecasts are available within {MAX_FORECAST_DAYS_OUT} days of departure — check back closer to your trip.
        </p>
      )}

      {hasCoords && forecast && forecast.length > 0 && (
        <>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {forecast.map((day) => (
              <div
                key={day.date}
                className="flex min-w-[92px] flex-col items-center gap-1 rounded-xl bg-primary-50 px-3 py-3 text-center"
              >
                <span className="text-xs font-medium text-ink-500">
                  {new Date(day.date).toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}
                </span>
                <span className="text-xs text-ink-500">{describeWeatherCode(day.weatherCode)}</span>
                <span className="font-display text-sm font-semibold text-ink-900">
                  {Math.round(day.tempMaxC)}° / {Math.round(day.tempMinC)}°
                </span>
              </div>
            ))}
          </div>
          {forecast[forecast.length - 1].date < trip.returnDate && (
            <p className="mt-3 text-xs text-ink-400">
              Showing what's forecastable so far — the rest of your trip will fill in closer to departure.
            </p>
          )}
        </>
      )}
    </Card>
  );
}
