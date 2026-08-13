import { z } from "zod";

// Mirrors the TravelMode enum in schema.prisma. Zod's z.enum validates the
// incoming string is one of these exact values — anything else is rejected.
export const travelModeSchema = z.enum(["PLANE", "BOAT", "CAR", "TRAIN", "BUS", "OTHER"]);

export const createTravelSegmentSchema = z.object({
  mode: travelModeSchema,
  providerName: z.string().nullable().optional(),

  fromPlaceName: z.string().nullable().optional(),
  fromPlaceLat: z.number().nullable().optional(),
  fromPlaceLng: z.number().nullable().optional(),
  toPlaceName: z.string().nullable().optional(),
  toPlaceLat: z.number().nullable().optional(),
  toPlaceLng: z.number().nullable().optional(),

  departureDate: z.coerce.date().nullable().optional(),
  departureTime: z.string().nullable().optional(),
  arrivalDate: z.coerce.date().nullable().optional(),
  arrivalTime: z.string().nullable().optional(),

  isLayover: z.boolean().default(false),
  cost: z.number().nullable().optional(),

  // Plane-only fields — optional regardless of mode. We don't enforce
  // "only present when mode = PLANE" at the validation layer; the frontend
  // controls when it sends these, matching the schema's own nullable design.
  flightInsurance: z.boolean().nullable().optional(),
  mealsIncluded: z.string().nullable().optional(),
  luggageCount: z.number().int().nullable().optional(),
  luggageWeightKg: z.number().nullable().optional(),
});

export type CreateTravelSegmentInput = z.infer<typeof createTravelSegmentSchema>;

export const updateTravelSegmentSchema = createTravelSegmentSchema.partial();

export type UpdateTravelSegmentInput = z.infer<typeof updateTravelSegmentSchema>;
