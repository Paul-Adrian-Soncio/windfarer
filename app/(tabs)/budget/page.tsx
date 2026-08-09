"use client";

import { TripGate } from "@/components/layout/TripGate";
import { BudgetSummaryCards } from "@/components/budget/BudgetSummaryCards";
import { DayBudgetBreakdown } from "@/components/budget/DayBudgetBreakdown";
import { useTripStore } from "@/store/tripStore";
import { useBudgetVsActual, useSpentByCategory, useTotalSpent } from "@/store/selectors";

export default function BudgetPage() {
  const trip = useTripStore((s) => s.trip);
  const totalSpent = useTotalSpent();
  const spentByCategory = useSpentByCategory();
  const budgetVsActual = useBudgetVsActual();

  return (
    <TripGate>
      {trip && spentByCategory && budgetVsActual && (
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900">Budget</h1>
            <p className="mt-1 text-sm text-ink-500">Everything you've planned to spend, in one place.</p>
          </div>

          <BudgetSummaryCards trip={trip} totalSpent={totalSpent} spentByCategory={spentByCategory} />
          <DayBudgetBreakdown trip={trip} budgetVsActual={budgetVsActual} />
        </div>
      )}
    </TripGate>
  );
}
