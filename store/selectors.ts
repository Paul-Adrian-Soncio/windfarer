import { useMemo } from "react";
import { useTripStore } from "./tripStore";
import { computeBudgetVsActual, computeSpentByCategory, computeTotalSpent } from "@/lib/budget/aggregate";

export function useSpentByCategory() {
  const trip = useTripStore((s) => s.trip);
  const blocks = useTripStore((s) => s.blocks);
  return useMemo(() => (trip ? computeSpentByCategory(trip, blocks) : null), [trip, blocks]);
}

export function useTotalSpent() {
  const trip = useTripStore((s) => s.trip);
  const blocks = useTripStore((s) => s.blocks);
  return useMemo(() => (trip ? computeTotalSpent(trip, blocks) : 0), [trip, blocks]);
}

export function useBudgetVsActual() {
  const trip = useTripStore((s) => s.trip);
  const blocks = useTripStore((s) => s.blocks);
  return useMemo(() => (trip ? computeBudgetVsActual(trip, blocks) : null), [trip, blocks]);
}
