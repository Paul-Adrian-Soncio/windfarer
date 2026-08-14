import { z } from "zod";

export const createItineraryDaySchema = z.object({
  label: z.string().min(1, "Label is required"),
  date: z.coerce.date().nullable().optional(),
  sortOrder: z.number().int().default(0),
});

export type CreateItineraryDayInput = z.infer<typeof createItineraryDaySchema>;

export const updateItineraryDaySchema = createItineraryDaySchema.partial();

export type UpdateItineraryDayInput = z.infer<typeof updateItineraryDaySchema>;
