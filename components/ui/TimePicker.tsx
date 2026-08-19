"use client";

import { useMemo } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/cn";
import { inputBase } from "./Input";
import { usePopover } from "./usePopover";

interface TimePickerProps {
  value: string; // "HH:mm" (24h), or "" for unset — matches every time field's existing storage
  onChange: (value: string) => void;
  // When set, any hour/minute/period combination resolving to a 24h time
  // strictly earlier than this is disabled — used for e.g. "arrival time
  // can't be before departure time," only meaningful when both events fall
  // on the same date (see the callers in TripBasicsForm/AccommodationForm/
  // TravelSegmentForm for exactly when they pass this).
  minTime?: string;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
}

function formatDisplay(value: string): string {
  const [h, m] = value.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
const MINUTES = [0, 15, 30, 45];
const PERIODS = ["AM", "PM"] as const;

// 24h <-> 12h+period conversions — the stored value stays "HH:mm" (24h)
// throughout the app (API, store, every other consumer); only this
// picker's own UI works in 12h+AM/PM.
function to12Hour(h: number): { hour12: number; period: "AM" | "PM" } {
  const period = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return { hour12, period };
}
function to24Hour(hour12: number, period: "AM" | "PM"): number {
  if (period === "AM") return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

function toMinutesSinceMidnight(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Themed replacement for <input type="time"> — same "HH:mm" (24h) string
 * contract in and out, every time field in the app is optional so there's
 * no "required" prop to carry over (see the exploration in the plan doc).
 * The picker UI itself is 12-hour with an AM/PM column, since that's the
 * format people actually think in — no existing time-selection UI in the
 * app to model against, so this is a new pattern, but reuses the same
 * trigger/panel shell as DatePicker and Dropdown.
 */
export function TimePicker({ value, onChange, minTime, placeholder = "Select time", className, "aria-label": ariaLabel }: TimePickerProps) {
  const { open, setOpen, containerRef } = usePopover<HTMLDivElement>();
  const [selectedHour12, selectedMinute, selectedPeriod] = useMemo(() => {
    if (!value) return [undefined, undefined, undefined] as const;
    const [h, m] = value.split(":").map(Number);
    const { hour12, period } = to12Hour(h);
    return [hour12, m, period] as const;
  }, [value]);

  const minMinutes = minTime ? toMinutesSinceMidnight(minTime) : null;

  // Would picking this hour/minute/period (combined with whatever's already
  // selected for the other two dimensions) resolve to a time before minTime?
  function isBefore(hour12: number, minute: number, period: "AM" | "PM"): boolean {
    if (minMinutes === null) return false;
    const hour24 = to24Hour(hour12, period);
    return hour24 * 60 + minute < minMinutes;
  }

  // For the hour column specifically: an hour is only truly unreachable if
  // even its LATEST minute (:45) still falls before minTime — otherwise a
  // still-unset or too-early minute selection would wrongly disable an hour
  // that has valid minutes within it (e.g. hour 5 with departure at 5:30
  // should stay pickable, since 5:45 is valid, even though the minute
  // hasn't been chosen yet).
  function isHourUnreachable(hour12: number, period: "AM" | "PM"): boolean {
    if (minMinutes === null) return false;
    const hour24 = to24Hour(hour12, period);
    const latestMinuteInHour = MINUTES[MINUTES.length - 1];
    return hour24 * 60 + latestMinuteInHour < minMinutes;
  }

  // Same idea for the period column: a period is only unreachable if its
  // latest possible moment is still before minTime. In 12h terms, 11 is
  // the latest hour within either period (12 AM = midnight/hour 0 is
  // actually the EARLIEST moment of the AM period, and 12 PM = noon/hour
  // 12 is the earliest of PM — 11 is latest in both cases, right before
  // the period rolls over). Only affects which of AM/PM is disabled —
  // doesn't change what clicking one does, so no auto-snapping surprises.
  function isPeriodUnreachable(period: "AM" | "PM"): boolean {
    if (minMinutes === null) return false;
    const latestHour24 = to24Hour(11, period);
    const latestMinuteInHour = MINUTES[MINUTES.length - 1];
    return latestHour24 * 60 + latestMinuteInHour < minMinutes;
  }

  // First minute within this hour that's actually valid — used when
  // clicking an hour whose default/currently-selected minute would itself
  // be disabled, so the click always lands on something pickable instead
  // of silently committing an invalid time.
  function firstValidMinute(hour12: number, period: "AM" | "PM", fallback: number): number {
    if (!isBefore(hour12, fallback, period)) return fallback;
    const found = MINUTES.find((m) => !isBefore(hour12, m, period));
    return found ?? fallback;
  }

  function commit(hour12: number, minute: number, period: "AM" | "PM") {
    const hour24 = to24Hour(hour12, period);
    onChange(`${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(inputBase, "flex items-center justify-between gap-2 text-left", className)}
      >
        <span className={value ? "text-ink-900" : "text-ink-500"}>{value ? formatDisplay(value) : placeholder}</span>
        <Clock className="h-4 w-4 shrink-0 text-ink-500" strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-20 flex rounded-lg border border-hair bg-surface p-2 shadow-lift">
          <div className="flex w-12 flex-col">
            <span className="mb-1 text-center font-mono text-[9.5px] font-semibold uppercase tracking-[.06em] text-ink-500">Hr</span>
            <div className="flex max-h-52 flex-col overflow-y-auto">
              {HOURS_12.map((h) => {
                const period = selectedPeriod ?? "AM";
                const disabled = isHourUnreachable(h, period);
                return (
                  <button
                    key={h}
                    type="button"
                    disabled={disabled}
                    onClick={() => commit(h, firstValidMinute(h, period, selectedMinute ?? 0), period)}
                    className={cn(
                      "rounded-md px-2 py-1.5 text-center text-[13.5px] transition-colors",
                      disabled
                        ? "text-ink-300 pointer-events-none"
                        : h === selectedHour12
                          ? "bg-primary-700 text-white"
                          : "text-ink-900 hover:bg-surface-2"
                    )}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex w-12 flex-col border-l border-hair pl-1">
            <span className="mb-1 text-center font-mono text-[9.5px] font-semibold uppercase tracking-[.06em] text-ink-500">Min</span>
            {MINUTES.map((m) => {
              const disabled = isBefore(selectedHour12 ?? 12, m, selectedPeriod ?? "AM");
              return (
                <button
                  key={m}
                  type="button"
                  disabled={disabled}
                  onClick={() => commit(selectedHour12 ?? 12, m, selectedPeriod ?? "AM")}
                  className={cn(
                    "rounded-md px-2 py-1.5 text-center text-[13.5px] transition-colors",
                    disabled
                      ? "text-ink-300 pointer-events-none"
                      : m === selectedMinute
                        ? "bg-primary-700 text-white"
                        : "text-ink-900 hover:bg-surface-2"
                  )}
                >
                  {String(m).padStart(2, "0")}
                </button>
              );
            })}
          </div>
          <div className="flex w-12 flex-col border-l border-hair pl-1">
            <span className="mb-1 text-center font-mono text-[9.5px] font-semibold uppercase tracking-[.06em] text-ink-500">&nbsp;</span>
            {PERIODS.map((p) => {
              const disabled = isPeriodUnreachable(p);
              return (
                <button
                  key={p}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    commit(selectedHour12 ?? 12, selectedMinute ?? 0, p);
                    setOpen(false);
                  }}
                  className={cn(
                    "rounded-md px-2 py-1.5 text-center text-[13.5px] transition-colors",
                    disabled
                      ? "text-ink-300 pointer-events-none"
                      : p === selectedPeriod
                        ? "bg-primary-700 text-white"
                        : "text-ink-900 hover:bg-surface-2"
                  )}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
