"use client";

import { useState } from "react";
import { Wallet, Pencil, Check } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Input, Select } from "@/components/ui/Input";
import { useTripStore } from "@/store/tripStore";
import { SpentByCategory } from "@/lib/budget/aggregate";
import { fmtMoney } from "@/lib/money";
import { CURRENCY_OPTIONS } from "@/lib/currency";
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
  const setCurrency = useTripStore((s) => s.setCurrency);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(trip.budget.totalBudget?.toString() ?? "");

  const totalBudget = trip.budget.totalBudget;
  const remaining = totalBudget !== null ? totalBudget - totalSpent : null;

  function commit() {
    setTotalBudget(draft ? Number(draft) : null);
    setEditing(false);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_1.4fr]">
      <Card>
        <CardHeader className="mb-0!">
          <CardTitle>
            <Wallet className="h-[19px] w-[19px] text-primary-700" strokeWidth={1.9} />
            Total budget
          </CardTitle>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              aria-label="Edit total budget"
              className="rounded-lg p-1.5 text-ink-500 hover:bg-paper hover:text-primary-700"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </CardHeader>

        {editing ? (
          <div className="mt-4 flex items-center gap-2">
            {/* Select/Input both come with w-full baked into their base
                styles (see components/ui/Input.tsx) — cn() here is a plain
                string join, not tailwind-merge, so a narrower className
                can't reliably beat that in a same-specificity tie. Sizing
                each one via a wrapper div sidesteps the conflict instead. */}
            <div className="w-[92px] shrink-0">
              <Select
                aria-label="Currency"
                value={trip.budget.currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-2.5"
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </Select>
            </div>
            <div className="min-w-0 flex-1">
              <Input
                type="number"
                min="0"
                step="0.01"
                autoFocus
                aria-label="Total budget amount"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <button onClick={commit} aria-label="Save total budget" className="shrink-0 rounded-lg p-2.5 text-primary-700 hover:bg-primary-tint">
              <Check className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <p className="mb-3 mt-1.5 font-display text-[32px] font-bold tracking-tight text-ink-900">
              {totalBudget !== null ? fmtMoney(totalBudget, trip.budget.currency) : "Not set"}
            </p>
            {totalBudget !== null && (
              <>
                <ProgressBar value={totalSpent} max={totalBudget} />
                <p className="mt-2.5 text-[13px] text-ink-500">
                  <b className="font-semibold text-ink-900">{fmtMoney(totalSpent, trip.budget.currency)}</b> spent
                  {remaining !== null && (
                    <>
                      {" "}
                      · <b className="font-semibold text-ink-900">{fmtMoney(Math.abs(remaining), trip.budget.currency)}</b>{" "}
                      <span className={remaining < 0 ? "text-danger-600" : undefined}>
                        {remaining < 0 ? "over" : "remaining"}
                      </span>
                    </>
                  )}
                </p>
              </>
            )}
          </>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spent by category</CardTitle>
        </CardHeader>
        <div className="grid gap-[11px] sm:grid-cols-2">
          {(Object.keys(spentByCategory) as (keyof SpentByCategory)[]).map((key) => (
            <div key={key} className="flex items-center justify-between rounded-md border border-hair bg-surface-2 px-[15px] py-3.5">
              <span className="text-[13.5px] text-ink-700">{CATEGORY_LABELS[key]}</span>
              <span className="font-display text-[15px] font-bold text-ink-900">{fmtMoney(spentByCategory[key], trip.budget.currency)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
