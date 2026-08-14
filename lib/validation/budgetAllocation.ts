import { z } from "zod";

// Mirrors types/budget.ts's BudgetScope union almost exactly. A
// discriminated union means Zod picks the matching shape based on the
// scopeKind field and rejects anything that doesn't fit it — e.g. sending
// scopeKind: "DAY" with a blockId (or no dayId at all) is rejected outright,
// rather than silently accepted and only caught later by business logic.
const baseFields = {
  label: z.string().min(1, "Label is required"),
  amount: z.number(),
};

export const createBudgetAllocationSchema = z.discriminatedUnion("scopeKind", [
  z.object({ scopeKind: z.literal("TRIP"), ...baseFields }),
  z.object({ scopeKind: z.literal("DAY"), dayId: z.string().uuid(), ...baseFields }),
  z.object({ scopeKind: z.literal("BLOCK"), blockId: z.string().uuid(), ...baseFields }),
]);

export type CreateBudgetAllocationInput = z.infer<typeof createBudgetAllocationSchema>;

// PATCH allows updating label/amount freely, but NOT scopeKind or which
// day/block it's attached to — changing what an allocation is scoped to is
// conceptually a delete + recreate, not an edit. Keeps the update schema
// simple and avoids re-deriving the discriminated-union rules for a partial
// update (Zod's .partial() doesn't work directly on discriminated unions).
export const updateBudgetAllocationSchema = z.object({
  label: z.string().min(1).optional(),
  amount: z.number().optional(),
});

export type UpdateBudgetAllocationInput = z.infer<typeof updateBudgetAllocationSchema>;
