import {
  ApiAccommodation,
  ApiAdvanceBooking,
  ApiBudgetAllocation,
  ApiFullTrip,
  ApiItineraryBlock,
  ApiItineraryDay,
  ApiItineraryDayWithBlocks,
  ApiTrip,
  ApiTravelSegment,
} from "./apiTypes";
import { decimalToNumber } from "./decimal";
import {
  Accommodation,
  AdvanceBooking,
  BudgetAllocation,
  ItineraryBlock,
  ItineraryDay,
  LocalTravelMode,
  Trip,
  TripSummary,
  TravelSegment,
} from "@/types";

/** "PLANE" -> "plane". The API's enums are uppercase; the frontend's are lowercase. */
function toLowerEnum<T extends string>(value: string): T {
  return value.toLowerCase() as T;
}

/**
 * Prisma DateTime fields always serialize to JSON as full ISO datetime
 * strings (e.g. "2026-08-26T00:00:00.000Z"), never plain "YYYY-MM-DD" —
 * even though the frontend's types call these fields `string` and every
 * <input type="date"> in the app expects exactly "YYYY-MM-DD". A native
 * date input silently renders blank (no error, no warning) if handed
 * anything else, which is what made this bug invisible until someone
 * actually looked for it — the value was always "there," just never valid
 * for the input rendering it. Slicing to the date part here, once, at the
 * API boundary, means every consumer downstream can trust the plain shape
 * instead of each one having to defend against it individually (see
 * lib/date/countdown.ts and lib/date/format.ts, which had each already
 * discovered and worked around this same shape independently).
 */
function toDateOnly<T extends string | null | undefined>(value: T): T {
  if (value === null || value === undefined) return value;
  return value.slice(0, 10) as T;
}

function translatePlace(name: string | null, lat: number | null, lng: number | null) {
  if (!name) return undefined;
  return { name, lat, lng };
}

export function translateTravelSegment(api: ApiTravelSegment): TravelSegment {
  const hasPlaneDetails =
    api.flightInsurance !== null ||
    api.mealsIncluded !== null ||
    api.luggageCount !== null ||
    api.luggageWeightKg !== null;

  return {
    id: api.id,
    mode: toLowerEnum(api.mode),
    providerName: api.providerName ?? undefined,
    fromPlace: translatePlace(api.fromPlaceName, api.fromPlaceLat, api.fromPlaceLng),
    toPlace: translatePlace(api.toPlaceName, api.toPlaceLat, api.toPlaceLng),
    departureDate: toDateOnly(api.departureDate) ?? undefined,
    departureTime: api.departureTime ?? undefined,
    arrivalDate: toDateOnly(api.arrivalDate) ?? undefined,
    arrivalTime: api.arrivalTime ?? undefined,
    isLayover: api.isLayover,
    cost: decimalToNumber(api.cost),
    plane: hasPlaneDetails
      ? {
          flightInsurance: api.flightInsurance ?? false,
          mealsIncluded: api.mealsIncluded === "true" ? true : (api.mealsIncluded ?? false),
          luggage:
            api.luggageCount !== null
              ? { count: api.luggageCount, weightKg: api.luggageWeightKg ?? undefined }
              : undefined,
        }
      : undefined,
  };
}

export function translateAccommodation(api: ApiAccommodation): Accommodation {
  return {
    id: api.id,
    place: { name: api.placeName, lat: api.placeLat, lng: api.placeLng },
    name: api.name,
    checkIn: toDateOnly(api.checkIn),
    checkInTime: api.checkInTime ?? undefined,
    checkOut: toDateOnly(api.checkOut),
    checkOutTime: api.checkOutTime ?? undefined,
    willTransferLater: api.willTransferLater,
    cost: decimalToNumber(api.cost),
    notes: api.notes ?? undefined,
  };
}

export function translateAdvanceBooking(api: ApiAdvanceBooking): AdvanceBooking {
  return {
    id: api.id,
    title: api.title,
    notes: api.notes ?? undefined,
    cost: decimalToNumber(api.cost),
  };
}

export function translateItineraryBlock(api: ApiItineraryBlock): ItineraryBlock {
  return {
    id: api.id,
    dayId: api.dayId,
    type: toLowerEnum(api.type),
    title: api.title,
    description: api.description ?? undefined,
    scheduledTime: api.scheduledTime ?? undefined,
    plannedExpense: decimalToNumber(api.plannedExpense),
    location: translatePlace(api.locationName, api.locationLat, api.locationLng),
    mealType: api.mealType
      ? toLowerEnum<"breakfast" | "lunch" | "dinner" | "snack">(api.mealType)
      : undefined,
    travelMode: api.travelMode ? toLowerEnum<LocalTravelMode>(api.travelMode) : undefined,
  };
}

export function translateBudgetAllocation(api: ApiBudgetAllocation): BudgetAllocation {
  const scope =
    api.scopeKind === "DAY"
      ? ({ kind: "day", dayId: api.dayId! } as const)
      : api.scopeKind === "BLOCK"
        ? ({ kind: "block", blockId: api.blockId! } as const)
        : ({ kind: "trip" } as const);

  return {
    id: api.id,
    label: api.label,
    scope,
    amount: Number(api.amount),
  };
}

/**
 * Result of translating a full trip: the frontend's nested Trip shape,
 * plus the flat blocks map the store keeps separately (see
 * store/tripStore.ts) — this is the one place that flattening happens,
 * matching the decision from the previous session that the API stays
 * shaped around Prisma's natural nesting, not the store's internal
 * optimization.
 */
export interface TranslatedTrip {
  trip: Trip;
  blocks: Record<string, ItineraryBlock>;
}

// A bare day row, no blocks known — used right after creating a day (a
// brand new day has none yet) and for PATCH responses (a day's own fields
// changed, its block list didn't).
export function translateItineraryDay(api: ApiItineraryDay, blockIds: string[] = []): ItineraryDay {
  return {
    id: api.id,
    label: api.label,
    date: toDateOnly(api.date) ?? undefined,
    blockIds,
  };
}

// A day WITH its blocks nested (the /full endpoint's shape) — splits into
// the day (holding only blockIds) plus a flat map of the block objects
// themselves, matching the store's normalized shape (see TranslatedTrip).
function translateItineraryDayWithBlocks(api: ApiItineraryDayWithBlocks): {
  day: ItineraryDay;
  blocks: Record<string, ItineraryBlock>;
} {
  const blocks: Record<string, ItineraryBlock> = {};
  const blockIds: string[] = [];

  for (const apiBlock of api.blocks) {
    const block = translateItineraryBlock(apiBlock);
    blocks[block.id] = block;
    blockIds.push(block.id);
  }

  return { day: translateItineraryDay(api, blockIds), blocks };
}

/** Trip's own fields, before any relations (segments, allocations, etc.) are attached. */
type TripBasics = Pick<
  Trip,
  "id" | "destination" | "departureDate" | "departureTime" | "arrivalDate" | "arrivalTime" | "returnDate" | "returnTime" | "status" | "createdAt" | "updatedAt"
> & {
  budget: Omit<Trip["budget"], "allocations">;
};

/**
 * Translates just the Trip row's own fields (destination, dates, budget
 * settings) — everything a bare ApiTrip carries, with no relations
 * assumed. Used both by translateFullTrip below and directly for
 * responses that don't include nested data, like POST/PATCH /api/trips
 * and GET /api/trips (the list endpoint).
 */
export function translateTripBasics(api: ApiTrip): TripBasics {
  return {
    id: api.id,
    destination: { name: api.destinationName, lat: api.destinationLat, lng: api.destinationLng },
    departureDate: toDateOnly(api.departureDate),
    departureTime: api.departureTime ?? undefined,
    arrivalDate: toDateOnly(api.arrivalDate),
    arrivalTime: api.arrivalTime ?? undefined,
    returnDate: toDateOnly(api.returnDate),
    returnTime: api.returnTime ?? undefined,
    status: toLowerEnum(api.status),
    budget: {
      totalBudget: decimalToNumber(api.totalBudget) ?? null,
      currency: api.currency,
    },
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

/**
 * Lightweight translation for the Home screen's trip list — just enough
 * to render a row, no relations. Used for every trip in GET /api/trips'
 * response, not just the active one (see translateTripBasics/translateFullTrip
 * for the "one active trip, fully loaded" shape).
 */
export function translateTripSummary(api: ApiTrip): TripSummary {
  return {
    id: api.id,
    destination: { name: api.destinationName, lat: api.destinationLat, lng: api.destinationLng },
    departureDate: toDateOnly(api.departureDate),
    returnDate: toDateOnly(api.returnDate),
    status: toLowerEnum(api.status),
  };
}

/**
 * Translates a bare ApiTrip (no relations) into a full frontend Trip, with
 * every relation defaulted to empty — for the moment right after creating
 * a trip, when nothing nested exists yet.
 */
export function translateNewTrip(api: ApiTrip): Trip {
  const basics = translateTripBasics(api);
  return {
    ...basics,
    travelSegments: [],
    accommodations: [],
    advanceBookings: [],
    itineraryDays: [],
    budget: { ...basics.budget, allocations: [] },
  };
}

export function translateFullTrip(api: ApiFullTrip): TranslatedTrip {
  const allBlocks: Record<string, ItineraryBlock> = {};
  const itineraryDays: ItineraryDay[] = [];

  for (const apiDay of api.itineraryDays) {
    const { day, blocks } = translateItineraryDayWithBlocks(apiDay);
    itineraryDays.push(day);
    Object.assign(allBlocks, blocks);
  }

  const basics = translateTripBasics(api);
  const trip: Trip = {
    ...basics,
    travelSegments: api.travelSegments.map(translateTravelSegment),
    accommodations: api.accommodations.map(translateAccommodation),
    advanceBookings: api.advanceBookings.map(translateAdvanceBooking),
    itineraryDays,
    budget: {
      ...basics.budget,
      allocations: api.budgetAllocations.map(translateBudgetAllocation),
    },
  };

  return { trip, blocks: allBlocks };
}
