import { apiFetch } from "./apiClient";
import { ApiItineraryDay } from "./apiTypes";
import { translateItineraryDay } from "./translate";
import { ItineraryDay } from "@/types";

/** Body shape POST/PATCH /api/trips/[tripId]/days expect — see lib/validation/itineraryDay.ts. */
interface ItineraryDayBody {
  label?: string;
  date?: string | null;
  sortOrder?: number;
}

function toItineraryDayBody(day: Partial<Omit<ItineraryDay, "id" | "blockIds">>): ItineraryDayBody {
  const body: ItineraryDayBody = {};
  if (day.label !== undefined) body.label = day.label;
  if (day.date !== undefined) body.date = day.date ?? null;
  return body;
}

export async function createItineraryDay(tripId: string, label: string): Promise<ItineraryDay> {
  const apiDay = await apiFetch<ApiItineraryDay>(`/api/trips/${tripId}/days`, {
    method: "POST",
    body: JSON.stringify({ label }),
  });
  // A brand-new day has no blocks yet — the default empty blockIds is correct.
  return translateItineraryDay(apiDay);
}

export async function updateItineraryDay(
  tripId: string,
  dayId: string,
  patch: Partial<Omit<ItineraryDay, "id" | "blockIds">>,
  currentBlockIds: string[]
): Promise<ItineraryDay> {
  const apiDay = await apiFetch<ApiItineraryDay>(`/api/trips/${tripId}/days/${dayId}`, {
    method: "PATCH",
    body: JSON.stringify(toItineraryDayBody(patch)),
  });
  // PATCH only returns the day's own fields, not its blocks — preserve the
  // caller's existing blockIds rather than dropping them.
  return translateItineraryDay(apiDay, currentBlockIds);
}

export async function deleteItineraryDay(tripId: string, dayId: string): Promise<void> {
  await apiFetch<void>(`/api/trips/${tripId}/days/${dayId}`, { method: "DELETE" });
}
