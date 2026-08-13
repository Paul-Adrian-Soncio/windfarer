import { z } from "zod";

export const createAccommodationSchema = z.object({
  placeName: z.string().min(1, "Place name is required"),
  placeLat: z.number().nullable().optional(),
  placeLng: z.number().nullable().optional(),

  name: z.string().min(1, "Name is required"),
  checkIn: z.coerce.date(),
  checkInTime: z.string().nullable().optional(),
  checkOut: z.coerce.date(),
  checkOutTime: z.string().nullable().optional(),

  willTransferLater: z.boolean().default(false),
  cost: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type CreateAccommodationInput = z.infer<typeof createAccommodationSchema>;

export const updateAccommodationSchema = createAccommodationSchema.partial();

export type UpdateAccommodationInput = z.infer<typeof updateAccommodationSchema>;
