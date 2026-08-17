import { apiFetch } from "./apiClient";
import { ApiAccommodation } from "./apiTypes";
import { translateAccommodation } from "./translate";
import { Accommodation } from "@/types";

/** Body shape POST/PATCH /api/trips/[tripId]/accommodations expect — see lib/validation/accommodation.ts. */
interface AccommodationBody {
  placeName?: string;
  placeLat?: number | null;
  placeLng?: number | null;
  name?: string;
  checkIn?: string;
  checkInTime?: string | null;
  checkOut?: string;
  checkOutTime?: string | null;
  willTransferLater?: boolean;
  cost?: number | null;
  notes?: string | null;
}

function toAccommodationBody(acc: Partial<Accommodation>): AccommodationBody {
  const body: AccommodationBody = {};

  if (acc.place !== undefined) {
    body.placeName = acc.place.name;
    body.placeLat = acc.place.lat;
    body.placeLng = acc.place.lng;
  }
  if (acc.name !== undefined) body.name = acc.name;
  if (acc.checkIn !== undefined) body.checkIn = acc.checkIn;
  if (acc.checkInTime !== undefined) body.checkInTime = acc.checkInTime ?? null;
  if (acc.checkOut !== undefined) body.checkOut = acc.checkOut;
  if (acc.checkOutTime !== undefined) body.checkOutTime = acc.checkOutTime ?? null;
  if (acc.willTransferLater !== undefined) body.willTransferLater = acc.willTransferLater;
  if (acc.cost !== undefined) body.cost = acc.cost ?? null;
  if (acc.notes !== undefined) body.notes = acc.notes ?? null;

  return body;
}

export async function createAccommodation(
  tripId: string,
  acc: Omit<Accommodation, "id">
): Promise<Accommodation> {
  const apiAcc = await apiFetch<ApiAccommodation>(`/api/trips/${tripId}/accommodations`, {
    method: "POST",
    body: JSON.stringify(toAccommodationBody(acc)),
  });
  return translateAccommodation(apiAcc);
}

export async function updateAccommodation(
  tripId: string,
  accommodationId: string,
  patch: Partial<Accommodation>
): Promise<Accommodation> {
  const apiAcc = await apiFetch<ApiAccommodation>(
    `/api/trips/${tripId}/accommodations/${accommodationId}`,
    { method: "PATCH", body: JSON.stringify(toAccommodationBody(patch)) }
  );
  return translateAccommodation(apiAcc);
}

export async function deleteAccommodation(tripId: string, accommodationId: string): Promise<void> {
  await apiFetch<void>(`/api/trips/${tripId}/accommodations/${accommodationId}`, { method: "DELETE" });
}
