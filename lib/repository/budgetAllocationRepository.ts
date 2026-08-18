import { apiFetch } from "./apiClient";
import { ApiBudgetAllocation } from "./apiTypes";
import { translateBudgetAllocation } from "./translate";
import { BudgetAllocation } from "@/types";

/** Body shape POST /api/trips/[tripId]/budget-allocations expects — see lib/validation/budgetAllocation.ts. */
type CreateBudgetAllocationBody =
  | { scopeKind: "TRIP"; label: string; amount: number }
  | { scopeKind: "DAY"; dayId: string; label: string; amount: number }
  | { scopeKind: "BLOCK"; blockId: string; label: string; amount: number };

function toCreateBody(input: Omit<BudgetAllocation, "id">): CreateBudgetAllocationBody {
  const { label, amount, scope } = input;
  if (scope.kind === "day") return { scopeKind: "DAY", dayId: scope.dayId, label, amount };
  if (scope.kind === "block") return { scopeKind: "BLOCK", blockId: scope.blockId, label, amount };
  return { scopeKind: "TRIP", label, amount };
}

export async function createBudgetAllocation(
  tripId: string,
  allocation: Omit<BudgetAllocation, "id">
): Promise<BudgetAllocation> {
  const apiAllocation = await apiFetch<ApiBudgetAllocation>(`/api/trips/${tripId}/budget-allocations`, {
    method: "POST",
    body: JSON.stringify(toCreateBody(allocation)),
  });
  return translateBudgetAllocation(apiAllocation);
}

// Scope (kind + dayId/blockId) is intentionally not editable — the server
// rejects it, so this only ever sends label/amount. Changing what an
// allocation is scoped to is a delete + recreate, not an edit (see
// lib/validation/budgetAllocation.ts).
export async function updateBudgetAllocation(
  tripId: string,
  allocationId: string,
  patch: Partial<Pick<BudgetAllocation, "label" | "amount">>
): Promise<BudgetAllocation> {
  const apiAllocation = await apiFetch<ApiBudgetAllocation>(
    `/api/trips/${tripId}/budget-allocations/${allocationId}`,
    { method: "PATCH", body: JSON.stringify(patch) }
  );
  return translateBudgetAllocation(apiAllocation);
}

export async function deleteBudgetAllocation(tripId: string, allocationId: string): Promise<void> {
  await apiFetch<void>(`/api/trips/${tripId}/budget-allocations/${allocationId}`, { method: "DELETE" });
}
