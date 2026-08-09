"use client";

import { useState } from "react";
import { Wallet, Pencil, Check } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useTripStore } from "@/store/tripStore";
import { SpentByCategory } from "@/lib/budget/aggregate";
import { Trip } from "@/types";

const CATEGORY_LABELS: Record<keyof SpentByCategory, string> = {
  activities: "Activities & meals",
  travel: "Travel",
  accommodation: "Accommodation",
  advanceBookings: "Advance bookings",
};

export function BudgetSummaryCards({
  trip,
  totalSpent,
  spentByCategory,
}: {
  trip: Trip;
  totalSpent: number;
  spentByCategory: SpentByCategory;
}) {
  const setTotalBudget = useTripStore((s) => s.setTotalBudget);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(trip.budget.totalBudget?.toString() ?? "");

  const totalBudget = trip.budget.totalBudget;
  const remaining = totalBudget !== null ? totalBudget - totalSpent : null;

  function commit() {
    setTotalBudget(draft ? Number(draft) : null);
    setEditing(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary-500" />
            Total budget
          </CardTitle>
          {!editing && (
            <button onClick={() => setEditing(true)} className="rounded-full p-1.5 text-ink-300 hover:bg-primary-50 hover:text-primary-600">
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </CardHeader>

        {editing ? (
          <div className="flex items-center gap-2">
            <Input type="number" min="0" step="0.01" autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="0.00" />
            <Button size="sm" onClick={commit}>
              <Check className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <p className="font-display text-3xl font-bold text-ink-900">
              {totalBudget !== null ? `$${totalBudget.toFixed(2)}` : "Not set"}
            </p>
            {totalBudget !== null && (
              <>
                <ProgressBar value={totalSpent} max={totalBudget} className="mt-4" />
                <p className="mt-2 text-sm text-ink-500">
                  ${totalSpent.toFixed(2)} spent
                  {remaining !== null && (
                    <span className={remaining < 0 ? "text-danger-600" : "text-ink-500"}>
                      {" "}
                      · {remaining < 0 ? "over by" : "remaining"} ${Math.abs(remaining).toFixed(2)}
                    </span>
                  )}
                </p>
              </>
            )}
          </>
        )}
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Spent by category</CardTitle>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          {(Object.keys(spentByCategory) as (keyof SpentByCategory)[]).map((key) => (
            <div key={key} className="flex items-center justify-between rounded-xl bg-primary-50/60 px-4 py-3">
              <span className="text-sm text-ink-600">{CATEGORY_LABELS[key]}</span>
              <span className="font-display text-sm font-semibold text-ink-900">${spentByCategory[key].toFixed(2)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
