/**
 * Shapes of what actually arrives over the wire from our API routes —
 * NOT the same as Prisma's generated model types. Those describe
 * server-side query results (Decimal objects, Date instances); once a
 * response has gone through JSON.stringify/JSON.parse, dates become ISO
 * strings and Decimals become plain number strings. These types describe
 * that post-JSON reality, which is what every repository function
 * actually receives.
 */

export interface ApiTrip {
  id: string;
  userId: string;
  destinationName: string;
  destinationLat: number | null;
  destinationLng: number | null;
  departureDate: string;
  departureTime: string | null;
  arrivalDate: string;
  arrivalTime: string | null;
  returnDate: string;
  returnTime: string | null;
  totalBudget: string | null;
  currency: string;
  status: "SCHEDULED" | "ONGOING" | "COMPLETE" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
}

export interface ApiTravelSegment {
  id: string;
  tripId: string;
  mode: "PLANE" | "BOAT" | "CAR" | "TRAIN" | "BUS" | "OTHER";
  providerName: string | null;
  fromPlaceName: string | null;
  fromPlaceLat: number | null;
  fromPlaceLng: number | null;
  toPlaceName: string | null;
  toPlaceLat: number | null;
  toPlaceLng: number | null;
  departureDate: string | null;
  departureTime: string | null;
  arrivalDate: string | null;
  arrivalTime: string | null;
  isLayover: boolean;
  cost: string | null;
  flightInsurance: boolean | null;
  mealsIncluded: string | null;
  luggageCount: number | null;
  luggageWeightKg: number | null;
}

export interface ApiAccommodation {
  id: string;
  tripId: string;
  placeName: string;
  placeLat: number | null;
  placeLng: number | null;
  name: string;
  checkIn: string;
  checkInTime: string | null;
  checkOut: string;
  checkOutTime: string | null;
  willTransferLater: boolean;
  cost: string | null;
  notes: string | null;
}

export interface ApiAdvanceBooking {
  id: string;
  tripId: string;
  title: string;
  notes: string | null;
  cost: string | null;
}

export interface ApiItineraryBlock {
  id: string;
  dayId: string;
  type: "ACTIVITY" | "MEAL" | "VISIT" | "REST" | "TRAVEL" | "BLANK";
  title: string;
  description: string | null;
  scheduledTime: string | null;
  plannedExpense: string | null;
  locationName: string | null;
  locationLat: number | null;
  locationLng: number | null;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK" | null;
  travelMode: "WALK" | "TAXI" | "TRANSIT" | "RIDESHARE" | "OTHER" | null;
  sortOrder: number;
}

// The bare ItineraryDay row — what GET (list)/POST/PATCH /api/trips/[tripId]/days
// return. No `blocks` field; a day's blocks are a separate relation, only
// included when explicitly requested (see ApiItineraryDayWithBlocks below).
export interface ApiItineraryDay {
  id: string;
  tripId: string;
  label: string;
  date: string | null;
  sortOrder: number;
}

// The shape used inside GET /api/trips/[tripId]/full's response, where
// each day's blocks ARE nested (see that route's Prisma `include`).
export interface ApiItineraryDayWithBlocks extends ApiItineraryDay {
  blocks: ApiItineraryBlock[];
}

export interface ApiBudgetAllocation {
  id: string;
  tripId: string;
  label: string;
  amount: string;
  scopeKind: "TRIP" | "DAY" | "BLOCK";
  dayId: string | null;
  blockId: string | null;
}

// The response shape of GET /api/trips/[tripId]/full — an ApiTrip with
// every relation nested, exactly matching the `include` in that route.
export interface ApiFullTrip extends ApiTrip {
  travelSegments: ApiTravelSegment[];
  accommodations: ApiAccommodation[];
  advanceBookings: ApiAdvanceBooking[];
  budgetAllocations: ApiBudgetAllocation[];
  itineraryDays: ApiItineraryDayWithBlocks[];
}
