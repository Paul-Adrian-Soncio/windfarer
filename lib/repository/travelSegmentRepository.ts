import { apiFetch } from "./apiClient";
import { ApiTravelSegment } from "./apiTypes";
import { translateTravelSegment } from "./translate";
import { TravelMode, TravelSegment } from "@/types";

/** "plane" -> "PLANE". Inverse of translate.ts's toLowerEnum. */
function toUpperMode(mode: TravelMode): ApiTravelSegment["mode"] {
  return mode.toUpperCase() as ApiTravelSegment["mode"];
}

/** Body shape POST/PATCH /api/trips/[tripId]/segments expect — see lib/validation/travelSegment.ts. */
interface TravelSegmentBody {
  mode?: ApiTravelSegment["mode"];
  providerName?: string | null;
  fromPlaceName?: string | null;
  fromPlaceLat?: number | null;
  fromPlaceLng?: number | null;
  toPlaceName?: string | null;
  toPlaceLat?: number | null;
  toPlaceLng?: number | null;
  departureDate?: string | null;
  departureTime?: string | null;
  arrivalDate?: string | null;
  arrivalTime?: string | null;
  isLayover?: boolean;
  cost?: number | null;
  flightInsurance?: boolean | null;
  mealsIncluded?: string | null;
  luggageCount?: number | null;
  luggageWeightKg?: number | null;
}

/**
 * Frontend TravelSegment -> API body. The trickiest part: the frontend
 * nests fromPlace/toPlace objects and a plane{} sub-object (mealsIncluded
 * as boolean | string, luggage as {count, weightKg}), while the API has
 * flat columns for all of it — the mirror image of translateTravelSegment.
 *
 * Note this always sends every place/plane field once its parent object is
 * present on `segment` (e.g. any `plane` object sends all four plane
 * columns), rather than diffing sub-fields individually. That's fine for
 * create (the whole segment is new) and for the only real update caller
 * today, which always builds a complete replacement segment rather than a
 * sparse nested patch — see components/planner/TravelSegmentForm.tsx.
 */
function toTravelSegmentBody(segment: Partial<TravelSegment>): TravelSegmentBody {
  const body: TravelSegmentBody = {};

  if (segment.mode !== undefined) body.mode = toUpperMode(segment.mode);
  if (segment.providerName !== undefined) body.providerName = segment.providerName ?? null;
  if (segment.fromPlace !== undefined) {
    body.fromPlaceName = segment.fromPlace?.name ?? null;
    body.fromPlaceLat = segment.fromPlace?.lat ?? null;
    body.fromPlaceLng = segment.fromPlace?.lng ?? null;
  }
  if (segment.toPlace !== undefined) {
    body.toPlaceName = segment.toPlace?.name ?? null;
    body.toPlaceLat = segment.toPlace?.lat ?? null;
    body.toPlaceLng = segment.toPlace?.lng ?? null;
  }
  if (segment.departureDate !== undefined) body.departureDate = segment.departureDate ?? null;
  if (segment.departureTime !== undefined) body.departureTime = segment.departureTime ?? null;
  if (segment.arrivalDate !== undefined) body.arrivalDate = segment.arrivalDate ?? null;
  if (segment.arrivalTime !== undefined) body.arrivalTime = segment.arrivalTime ?? null;
  if (segment.isLayover !== undefined) body.isLayover = segment.isLayover;
  if (segment.cost !== undefined) body.cost = segment.cost ?? null;
  if (segment.plane !== undefined) {
    body.flightInsurance = segment.plane?.flightInsurance ?? null;
    // The server column is a plain string. Encode true as "true" and a
    // free-text description as itself, but encode false as null (not the
    // string "false") — "false" would be indistinguishable from a real
    // user-typed description on the way back, and would read as truthy
    // to any bare `if (mealsIncluded)` check. null cleanly means "no meals."
    body.mealsIncluded =
      segment.plane?.mealsIncluded === false || segment.plane?.mealsIncluded === undefined
        ? null
        : segment.plane.mealsIncluded === true
          ? "true"
          : segment.plane.mealsIncluded;
    body.luggageCount = segment.plane?.luggage?.count ?? null;
    body.luggageWeightKg = segment.plane?.luggage?.weightKg ?? null;
  }

  return body;
}

export async function createTravelSegment(
  tripId: string,
  segment: Omit<TravelSegment, "id">
): Promise<TravelSegment> {
  const apiSegment = await apiFetch<ApiTravelSegment>(`/api/trips/${tripId}/segments`, {
    method: "POST",
    body: JSON.stringify(toTravelSegmentBody(segment)),
  });
  return translateTravelSegment(apiSegment);
}

export async function updateTravelSegment(
  tripId: string,
  segmentId: string,
  patch: Partial<TravelSegment>
): Promise<TravelSegment> {
  const apiSegment = await apiFetch<ApiTravelSegment>(`/api/trips/${tripId}/segments/${segmentId}`, {
    method: "PATCH",
    body: JSON.stringify(toTravelSegmentBody(patch)),
  });
  return translateTravelSegment(apiSegment);
}

export async function deleteTravelSegment(tripId: string, segmentId: string): Promise<void> {
  await apiFetch<void>(`/api/trips/${tripId}/segments/${segmentId}`, { method: "DELETE" });
}
