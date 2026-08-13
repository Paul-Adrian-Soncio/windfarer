import { z } from "zod";

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
// while keeping the same validation rules for whichever fields ARE sent.
export const updateTripSchema = createTripSchema.partial().extend({
  totalBudget: z.number().nullable().optional(),
});

export type UpdateTripInput = z.infer<typeof updateTripSchema>;
