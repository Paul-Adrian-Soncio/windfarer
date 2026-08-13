import { z } from "zod";

export const createAdvanceBookingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  notes: z.string().nullable().optional(),
  cost: z.number().nullable().optional(),
});

export type CreateAdvanceBookingInput = z.infer<typeof createAdvanceBookingSchema>;

export const updateAdvanceBookingSchema = createAdvanceBookingSchema.partial();

export type UpdateAdvanceBookingInput = z.infer<typeof updateAdvanceBookingSchema>;
