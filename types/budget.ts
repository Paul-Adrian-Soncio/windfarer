export type BudgetScope =
  | { kind: "day"; dayId: string }
  | { kind: "block"; blockId: string }
  | { kind: "trip" };

export interface BudgetAllocation {
  id: string;
  label: string;
  scope: BudgetScope;
  amount: number;
}

export interface TripBudget {
  totalBudget: number | null;
  allocations: BudgetAllocation[];
}
