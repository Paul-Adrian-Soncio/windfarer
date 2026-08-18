"use client";

import { useState } from "react";
import { CalendarDays, Pencil, Check, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Input } from "@/components/ui/Input";
import { useTripStore } from "@/store/tripStore";
import { BudgetVsActual } from "@/lib/budget/aggregate";
import { fmtMoney } from "@/lib/money";
import { Trip } from "@/types";
import { cn } from "@/lib/cn";

function DayAllocationEditor({ dayId, currentAmount }: { dayId: string; currentAmount: number | null }) {
  const upsertAllocation = useTripStore((s) => s.upsertAllocation);
  const removeAllocation = useTripStore((s) => s.removeAllocation);
  const trip = useTripStore((s) => s.trip);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(currentAmount?.toString() ?? "");

  const existing = trip?.budget.allocations.find((a) => a.scope.kind === "day" && a.scope.dayId === dayId);

  function commit() {
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

  function remove() {
    if (existing) removeAllocation(existing.id).catch(() => {});
  }

  if (editing) {
    return (
      <div className="mt-2 flex items-center gap-1.5">
        <Input
          type="number"
          min="0"
          step="0.01"
          autoFocus
          aria-label="Day budget amount"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && commit()}
          className="w-24 py-1 text-xs"
        />
        <button onClick={commit} aria-label="Save day budget" className="rounded-lg p-1 text-primary-700 hover:bg-primary-tint">
          <Check className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-1.5">
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-accent-500"
      >
        {currentAmount !== null ? (
          `Budget: ${fmtMoney(currentAmount, trip?.budget.currency)}`
        ) : (
          <span className="font-semibold text-accent-500">Set day budget</span>
        )}
        <Pencil className={cn("h-3 w-3", currentAmount === null && "text-accent-500")} />
      </button>
      {existing && (
        <button onClick={remove} aria-label="Remove day budget" className="rounded-lg p-1 text-ink-500 hover:bg-paper hover:text-danger-600">
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

export function DayBudgetBreakdown({ trip, budgetVsActual }: { trip: Trip; budgetVsActual: BudgetVsActual }) {
  if (trip.itineraryDays.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <CalendarDays className="h-[19px] w-[19px] text-primary-700" strokeWidth={1.9} />
          By day
        </CardTitle>
      </CardHeader>
      <div>
        {trip.itineraryDays.map((day, i) => {
          const stats = budgetVsActual.byDay[day.id];
          const isLast = i === trip.itineraryDays.length - 1;
          return (
            <div key={day.id} className={cn("py-4", !isLast && "border-b border-hair")}>
              <div className="mb-2.5 flex items-center justify-between gap-3">
                <span className="font-display text-[14.5px] font-semibold text-ink-900">{day.label}</span>
                <span className="font-mono text-xs text-secondary-ink">{fmtMoney(stats.spent, trip.budget.currency)} spent</span>
              </div>
              <ProgressBar value={stats.spent} max={stats.budget ?? 0} />
              <DayAllocationEditor dayId={day.id} currentAmount={stats.budget} />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
