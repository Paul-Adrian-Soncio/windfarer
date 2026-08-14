import { z } from "zod";

export const blockTypeSchema = z.enum(["ACTIVITY", "MEAL", "VISIT", "REST", "TRAVEL", "BLANK"]);
export const mealTypeSchema = z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]);
export const localTravelModeSchema = z.enum(["WALK", "TAXI", "TRANSIT", "RIDESHARE", "OTHER"]);

export const createItineraryBlockSchema = z.object({
  type: blockTypeSchema,
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),

  scheduledTime: z.string().nullable().optional(),
  plannedExpense: z.number().nullable().optional(),

  locationName: z.string().nullable().optional(),
  locationLat: z.number().nullable().optional(),
  locationLng: z.number().nullable().optional(),

  mealType: mealTypeSchema.nullable().optional(),
  travelMode: localTravelModeSchema.nullable().optional(),

  sortOrder: z.number().int().default(0),
});

export type CreateItineraryBlockInput = z.infer<typeof createItineraryBlockSchema>;

export const updateItineraryBlockSchema = createItineraryBlockSchema.partial().extend({
  // Moving a block to a different day: not part of "create" (a block is
  // always created within a specific day), but a valid PATCH operation.
  dayId: z.string().uuid().optional(),
});

export type UpdateItineraryBlockInput = z.infer<typeof updateItineraryBlockSchema>;
