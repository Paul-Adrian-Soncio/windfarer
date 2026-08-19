import {
  createTripApi,
  listTripsApi,
  updateTripApi,
  deleteTripApi,
  getActiveTripIdApi,
  setActiveTripIdApi,
  UpdateTripBody,
} from "./createTrip";
import { apiFetch } from "./apiClient";
import { ApiFullTrip } from "./apiTypes";
import { translateFullTrip, translateNewTrip, translateTripSummary, TranslatedTrip } from "./translate";
import { CreateTripInput } from "@/store/tripStore";
import { Trip, TripSummary } from "@/types";

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
 * Lightweight list of everything the signed-in user owns, for the Home
 * screen's trip list — see types/trip.ts's TripSummary and
 * translate.ts's translateTripSummary for why this doesn't fetch full
 * nested data for every trip.
 */
export async function listTripSummaries(): Promise<TripSummary[]> {
  const trips = await listTripsApi();
  return trips.map(translateTripSummary);
}

export { getActiveTripIdApi as getActiveTripId, setActiveTripIdApi as setActiveTripId };

export async function deleteTrip(tripId: string): Promise<void> {
  await deleteTripApi(tripId);
}

/**
 * Resolves which trip should load as "the" active trip, and fetches its
 * full data. Prefers the user's explicitly-set activeTripId (see
 * app/api/user/active-trip); falls back to the first trip in the list if
 * none is set yet (e.g. an existing single-trip user who never had to
 * choose) — this keeps that case working with zero behavior change. Returns
 * null only when the user has no trips at all.
 */
export async function findExistingTrip(): Promise<TranslatedTrip | null> {
  const [trips, activeTripId] = await Promise.all([listTripsApi(), getActiveTripIdApi()]);
  if (trips.length === 0) return null;

  const targetId = activeTripId && trips.some((t) => t.id === activeTripId) ? activeTripId : trips[0].id;
  return fetchFullTrip(targetId);
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
