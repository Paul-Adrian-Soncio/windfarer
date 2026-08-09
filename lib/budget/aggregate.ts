import { Trip, ItineraryBlock } from "@/types";

export interface SpentByCategory {
  activities: number;
  travel: number;
  accommodation: number;
  advanceBookings: number;
}

function sum(values: (number | undefined)[]): number {
  return values.reduce<number>((total, v) => total + (v ?? 0), 0);
}

export function computeSpentByCategory(
  trip: Trip,
  blocks: Record<string, ItineraryBlock>
): SpentByCategory {
  return {
    activities: sum(Object.values(blocks).map((b) => b.plannedExpense)),
    travel: sum(trip.travelSegments.map((s) => s.cost)),
    accommodation: sum(trip.accommodations.map((a) => a.cost)),
    advanceBookings: sum(trip.advanceBookings.map((b) => b.cost)),
  };
}

export function computeTotalSpent(trip: Trip, blocks: Record<string, ItineraryBlock>): number {
  const byCategory = computeSpentByCategory(trip, blocks);
  return byCategory.activities + byCategory.travel + byCategory.accommodation + byCategory.advanceBookings;
}

export function computeSpentByDay(
  trip: Trip,
  blocks: Record<string, ItineraryBlock>
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const day of trip.itineraryDays) {
    result[day.id] = sum(day.blockIds.map((id) => blocks[id]?.plannedExpense));
  }
  return result;
}

export interface BudgetVsActual {
  total: { budget: number | null; spent: number };
  byDay: Record<string, { budget: number | null; spent: number }>;
  byBlock: Record<string, { budget: number | null; spent: number }>;
}

export function computeBudgetVsActual(
  trip: Trip,
  blocks: Record<string, ItineraryBlock>
): BudgetVsActual {
  const spentByDay = computeSpentByDay(trip, blocks);
  const totalSpent = computeTotalSpent(trip, blocks);

  const byDay: BudgetVsActual["byDay"] = {};
  for (const day of trip.itineraryDays) {
    const allocation = trip.budget.allocations.find(
      (a) => a.scope.kind === "day" && a.scope.dayId === day.id
    );
    byDay[day.id] = { budget: allocation?.amount ?? null, spent: spentByDay[day.id] ?? 0 };
  }

  const byBlock: BudgetVsActual["byBlock"] = {};
  for (const block of Object.values(blocks)) {
    const allocation = trip.budget.allocations.find(
      (a) => a.scope.kind === "block" && a.scope.blockId === block.id
    );
    byBlock[block.id] = { budget: allocation?.amount ?? null, spent: block.plannedExpense ?? 0 };
  }

  return {
    total: { budget: trip.budget.totalBudget, spent: totalSpent },
    byDay,
    byBlock,
  };
}
