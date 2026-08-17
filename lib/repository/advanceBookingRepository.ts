import { apiFetch } from "./apiClient";
import { ApiAdvanceBooking } from "./apiTypes";
import { translateAdvanceBooking } from "./translate";
import { AdvanceBooking } from "@/types";

/** Body shape POST/PATCH /api/trips/[tripId]/advance-bookings expect — see lib/validation/advanceBooking.ts. */
interface AdvanceBookingBody {
  title?: string;
  notes?: string | null;
  cost?: number | null;
}

function toAdvanceBookingBody(booking: Partial<AdvanceBooking>): AdvanceBookingBody {
  const body: AdvanceBookingBody = {};
  if (booking.title !== undefined) body.title = booking.title;
  if (booking.notes !== undefined) body.notes = booking.notes ?? null;
  if (booking.cost !== undefined) body.cost = booking.cost ?? null;
  return body;
}

export async function createAdvanceBooking(
  tripId: string,
  booking: Omit<AdvanceBooking, "id">
): Promise<AdvanceBooking> {
  const apiBooking = await apiFetch<ApiAdvanceBooking>(`/api/trips/${tripId}/advance-bookings`, {
    method: "POST",
    body: JSON.stringify(toAdvanceBookingBody(booking)),
  });
  return translateAdvanceBooking(apiBooking);
}

export async function updateAdvanceBooking(
  tripId: string,
  advanceBookingId: string,
  patch: Partial<AdvanceBooking>
): Promise<AdvanceBooking> {
  const apiBooking = await apiFetch<ApiAdvanceBooking>(
    `/api/trips/${tripId}/advance-bookings/${advanceBookingId}`,
    { method: "PATCH", body: JSON.stringify(toAdvanceBookingBody(patch)) }
  );
  return translateAdvanceBooking(apiBooking);
}

export async function deleteAdvanceBooking(tripId: string, advanceBookingId: string): Promise<void> {
  await apiFetch<void>(`/api/trips/${tripId}/advance-bookings/${advanceBookingId}`, { method: "DELETE" });
}
