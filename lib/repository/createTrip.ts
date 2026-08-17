import { apiFetch } from "./apiClient";
import { ApiTrip } from "./apiTypes";
import { CreateTripInput } from "@/store/tripStore";

/**
 * Body shape POST /api/trips actually expects — see
 * lib/validation/trip.ts's createTripSchema on the server. Dates go over
 * the wire as plain "YYYY-MM-DD" strings (the server coerces them into
 * DateTime), matching what the frontend's date inputs already produce.
 */
interface CreateTripBody {
  destinationName: string;
  destinationLat?: number | null;
  destinationLng?: number | null;
  departureDate: string;
  departureTime?: string;
  arrivalDate: string;
  arrivalTime?: string;
  returnDate: string;
  returnTime?: string;
  currency?: string;
}

export async function createTripApi(input: CreateTripInput): Promise<ApiTrip> {
  const body: CreateTripBody = {
    destinationName: input.destination.name,
    destinationLat: input.destination.lat,
    destinationLng: input.destination.lng,
    departureDate: input.departureDate,
    departureTime: input.departureTime,
    arrivalDate: input.arrivalDate,
    arrivalTime: input.arrivalTime,
    returnDate: input.returnDate,
    returnTime: input.returnTime,
    currency: input.currency,
  };

  return apiFetch<ApiTrip>("/api/trips", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export interface UpdateTripBody {
  destinationName?: string;
  destinationLat?: number | null;
  destinationLng?: number | null;
  departureDate?: string;
  departureTime?: string;
  arrivalDate?: string;
  arrivalTime?: string;
  returnDate?: string;
  returnTime?: string;
  totalBudget?: number | null;
  currency?: string;
}

export async function updateTripApi(tripId: string, body: UpdateTripBody): Promise<ApiTrip> {
  return apiFetch<ApiTrip>(`/api/trips/${tripId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function listTripsApi(): Promise<ApiTrip[]> {
  return apiFetch<ApiTrip[]>("/api/trips");
}
