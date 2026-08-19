import { z } from "zod";

// Manual, not auto-derived from dates — see schema.prisma's TripStatus
// comment for why. Keep this list in sync with that enum.
export const tripStatusSchema = z.enum(["SCHEDULED", "ONGOING", "COMPLETE", "CANCELLED"]);

// Shape of an incoming "create a trip" request body. Mirrors the required
// fields on the Trip model — everything not listed here is optional at the
// database level and can be added via a later PATCH.
export const createTripSchema = z.object({
  destinationName: z.string().min(1, "Destination is required"),
  destinationLat: z.number().nullable().optional(),
  destinationLng: z.number().nullable().optional(),

  // Dates arrive from JSON as strings (JSON has no native Date type) —
  // z.coerce.date() parses the string and validates it's a real date.
  departureDate: z.coerce.date(),
  departureTime: z.string().nullable().optional(),
  arrivalDate: z.coerce.date(),
  arrivalTime: z.string().nullable().optional(),
  returnDate: z.coerce.date(),
  returnTime: z.string().nullable().optional(),

  currency: z.string().length(3).default("USD"),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;

// PATCH allows updating any subset of the same fields, plus totalBudget
// (not part of trip creation in the current frontend flow, but editable
// afterward from the Budget tab). .partial() makes every field optional
// while keeping the same validation rules for whichever fields ARE sent —
// EXCEPT currency, which .partial() would otherwise leave defaulting to
// "USD" via createTripSchema's .default("USD") even when omitted (Zod
// applies .default() to fill in a genuinely missing key regardless of
// .partial()). Re-declaring it here without a default means an omitted
// currency in a PATCH body correctly stays absent from result.data, so
// prisma.trip.update's partial data: result.data never touches the
// column — instead of silently resetting it to USD on every PATCH that
// isn't itself a currency change.
export const updateTripSchema = createTripSchema.partial().extend({
  currency: z.string().length(3).optional(),
  totalBudget: z.number().nullable().optional(),
  status: tripStatusSchema.optional(),
});

export type UpdateTripInput = z.infer<typeof updateTripSchema>;
