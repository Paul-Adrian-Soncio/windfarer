import { Place } from "./place";
import { TravelSegment } from "./travel";
import { Accommodation } from "./accommodation";
import { AdvanceBooking } from "./advanceBooking";
import { ItineraryDay } from "./itinerary";
import { TripBudget } from "./budget";

export interface Trip {
  id: string;
  destination: Place;
  departureDate: string;
  departureTime?: string;
  arrivalDate: string;
  arrivalTime?: string;
  returnDate: string;
  returnTime?: string;
  travelSegments: TravelSegment[];
  accommodations: Accommodation[];
  advanceBookings: AdvanceBooking[];
  itineraryDays: ItineraryDay[];
  budget: TripBudget;
  createdAt: string;
  updatedAt: string;
}
