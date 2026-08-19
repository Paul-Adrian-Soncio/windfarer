import { Place } from "./place";
import { TravelSegment } from "./travel";
import { Accommodation } from "./accommodation";
import { AdvanceBooking } from "./advanceBooking";
import { ItineraryDay } from "./itinerary";
import { TripBudget } from "./budget";

// Manual, not auto-derived from dates — a trip's dates alone can't tell
// "cancelled" from "scheduled," so the user sets this by hand.
export type TripStatus = "scheduled" | "ongoing" | "complete" | "cancelled";

export interface Trip {
  id: string;
  destination: Place;
  departureDate: string;
  departureTime?: string;
  arrivalDate: string;
  arrivalTime?: string;
  returnDate: string;
  returnTime?: string;
  status: TripStatus;
  travelSegments: TravelSegment[];
  accommodations: Accommodation[];
  advanceBookings: AdvanceBooking[];
  itineraryDays: ItineraryDay[];
  budget: TripBudget;
  createdAt: string;
  updatedAt: string;
}

// The lightweight shape used for the Home screen's trip list — enough to
// render a row (destination, dates, status) without pulling every
// relation for every trip. See lib/repository/tripRepository.ts's
// listTripSummaries and lib/repository/translate.ts's translateTripSummary.
export interface TripSummary {
  id: string;
  destination: Place;
  departureDate: string;
  returnDate: string;
  status: TripStatus;
}
