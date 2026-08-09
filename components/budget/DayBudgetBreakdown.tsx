"use client";

import { useState } from "react";
import { CalendarDays, Pencil, Check } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Input } from "@/components/ui/Input";
import { useTripStore } from "@/store/tripStore";
import { BudgetVsActual } from "@/lib/budget/aggregate";
import { Trip } from "@/types";

function DayAllocationEditor({ dayId, currentAmount }: { dayId: string; currentAmount: number | null }) {
  const upsertAllocation = useTripStore((s) => s.upsertAllocation);
  const trip = useTripStore((s) => s.trip);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(currentAmount?.toString() ?? "");

  function commit() {
    const existing = trip?.budget.allocations.find((a) => a.scope.kind === "day" && a.scope.dayId === dayId);
    if (draft) {
      upsertAllocation({
        id: existing?.id,
        label: `Day budget`,
        scope: { kind: "day", dayId },
        amount: Number(draft),
      });
    }
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <Input
          type="number"
          min="0"
          step="0.01"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && commit()}
          className="w-24 py-1 text-xs"
        />
        <button onClick={commit} className="rounded-full p-1 text-primary-600 hover:bg-primary-50">
          <Check className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs text-ink-400 hover:text-primary-600">
      {currentAmount !== null ? `Budget: $${currentAmount.toFixed(2)}` : "Set day budget"}
      <Pencil className="h-3 w-3" />
    </button>
  );
}

export function DayBudgetBreakdown({ trip, budgetVsActual }: { trip: Trip; budgetVsActual: BudgetVsActual }) {
  if (trip.itineraryDays.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary-500" />
          By day
        </CardTitle>
      </CardHeader>
      <div className="flex flex-col gap-4">
        {trip.itineraryDays.map((day) => {
          const stats = budgetVsActual.byDay[day.id];
          return (
            <div key={day.id} className="rounded-xl border border-ink-100 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-ink-900">{day.label}</span>
                <span className="text-xs text-ink-500">${stats.spent.toFixed(2)} spent</span>
              </div>
              {stats.budget !== null && <ProgressBar value={stats.spent} max={stats.budget} className="mb-2" />}
              <DayAllocationEditor dayId={day.id} currentAmount={stats.budget} />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
