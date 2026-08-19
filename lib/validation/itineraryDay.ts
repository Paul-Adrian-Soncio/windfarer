import { z } from "zod";

export const createItineraryDaySchema = z.object({
  label: z.string().min(1, "Label is required"),
  date: z.coerce.date().nullable().optional(),
  // No .default(0) — the frontend never sends sortOrder on create (see
  // lib/repository/itineraryDayRepository.ts), and a default here would
  // silently fill it in anyway, making every new day indistinguishable
  // from "explicitly wants slot 0" in the route. Left plainly optional so
  // an omitted field stays truly absent in result.data, and the route can
  // tell the difference and compute the real next slot instead. Same bug
  // shape as the Trip currency default fixed a couple of sessions ago.
  sortOrder: z.number().int().optional(),
});

export type CreateItineraryDayInput = z.infer<typeof createItineraryDaySchema>;

export const updateItineraryDaySchema = createItineraryDaySchema.partial();

export type UpdateItineraryDayInput = z.infer<typeof updateItineraryDaySchema>;
