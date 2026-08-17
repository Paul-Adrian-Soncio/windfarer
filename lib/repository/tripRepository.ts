import { createTripApi, listTripsApi, updateTripApi, UpdateTripBody } from "./createTrip";
import { apiFetch } from "./apiClient";
import { ApiFullTrip } from "./apiTypes";
import { translateFullTrip, translateNewTrip, TranslatedTrip } from "./translate";
import { CreateTripInput } from "@/store/tripStore";
import { Trip } from "@/types";

/**
 * Fetches a trip with everything nested (segments, accommodations,
 * itinerary days+blocks, budget allocations) via the /full endpoint, and
 * translates it into the shape the frontend store actually uses — see
 * translateFullTrip for the field-by-field mapping and why it's needed
 * (enum casing, Decimal-as-string, flattening blocks into a separate map).
 */
export async function fetchFullTrip(tripId: string): Promise<TranslatedTrip> {
  const apiTrip = await apiFetch<ApiFullTrip>(`/api/trips/${tripId}/full`);
  return translateFullTrip(apiTrip);
}

/**
 * There's no auth yet, so there's no notion of "my trips" server-side —
 * every trip currently belongs to the one hardcoded test user (see
 * app/api/trips/route.ts). Lists all trips and returns the first one's
 * FULL data (segments, days, etc. may already exist from a previous
 * session), if any — matching today's single-active-trip frontend model.
 * Once auth exists this is exactly the seam that changes to "my trips,"
 * not the store logic that calls it.
 */
export async function findExistingTrip(): Promise<TranslatedTrip | null> {
  const trips = await listTripsApi();
  if (trips.length === 0) return null;
  return fetchFullTrip(trips[0].id);
}

// A brand-new trip has no nested data yet, so the bare create response is
// enough — no need for a second /full round-trip right after creating.
export async function createTrip(input: CreateTripInput): Promise<Trip> {
  const apiTrip = await createTripApi(input);
  return translateNewTrip(apiTrip);
}

// Only the Trip row's own fields change here — nested data is untouched,
// so there's no need to re-fetch it. The store merges this into its
// existing relations rather than replacing them (see tripStore.ts).
export async function updateTripBasics(tripId: string, patch: UpdateTripBody): Promise<Trip> {
  const apiTrip = await updateTripApi(tripId, patch);
  return translateNewTrip(apiTrip);
}
