"use client";

import { DayPicker } from "react-day-picker";
import { format, parse, isValid } from "date-fns";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/cn";
import { inputBase } from "./Input";
import { usePopover } from "./usePopover";

interface DatePickerProps {
  value: string; // "YYYY-MM-DD", matching every date field already stored this way (see lib/repository/translate.ts's toDateOnly)
  onChange: (value: string) => void;
  // When set, every day before this one is disabled in the calendar — used
  // for e.g. "arrival date can't be before departure date." Same
  // "YYYY-MM-DD" shape as value.
  minDate?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
}

function parseValue(value: string): Date | undefined {
  if (!value) return undefined;
  const parsed = parse(value, "yyyy-MM-dd", new Date());
  return isValid(parsed) ? parsed : undefined;
}

/**
 * Themed replacement for <input type="date"> — same "YYYY-MM-DD" string
 * contract in and out, so every existing form's state/submit logic is
 * untouched. Trigger reuses inputBase; the calendar panel is styled purely
 * through react-day-picker's classNames prop (no bundled rdp-*.css
 * imported, so there's nothing to override — every visible style here is
 * this app's own tokens).
 */
export function DatePicker({ value, onChange, minDate, required, placeholder = "Select date", className, "aria-label": ariaLabel }: DatePickerProps) {
  const { open, setOpen, containerRef } = usePopover<HTMLDivElement>();
  const selected = parseValue(value);
  const min = minDate ? parseValue(minDate) : undefined;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-required={required}
        onClick={() => setOpen((o) => !o)}
        className={cn(inputBase, "flex items-center justify-between gap-2 text-left", className)}
      >
        <span className={selected ? "text-ink-900" : "text-ink-500"}>
          {selected ? format(selected, "MMM d, yyyy") : placeholder}
        </span>
        <CalendarDays className="h-4 w-4 shrink-0 text-ink-500" strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-20 rounded-lg border border-hair bg-surface p-3 shadow-lift">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(date) => {
              onChange(date ? format(date, "yyyy-MM-dd") : "");
              setOpen(false);
            }}
            defaultMonth={selected ?? min}
            disabled={min ? { before: min } : undefined}
            classNames={{
              root: "font-sans",
              months: "flex flex-col",
              month: "flex flex-col gap-3",
              month_caption: "flex items-center justify-center px-8 h-8",
              caption_label: "text-[13.5px] font-semibold text-ink-900",
              nav: "flex items-center justify-between absolute inset-x-0 top-0 h-8 px-1",
              button_previous:
                "flex h-7 w-7 items-center justify-center rounded-md text-ink-500 hover:bg-surface-2 hover:text-ink-900 disabled:opacity-30 disabled:pointer-events-none",
              button_next:
                "flex h-7 w-7 items-center justify-center rounded-md text-ink-500 hover:bg-surface-2 hover:text-ink-900 disabled:opacity-30 disabled:pointer-events-none",
              chevron: "h-4 w-4 fill-current",
              month_grid: "border-collapse",
              weekdays: "flex",
              weekday: "w-9 text-center font-mono text-[10.5px] font-semibold uppercase tracking-[.06em] text-ink-500",
              week: "flex mt-1",
              day: "h-9 w-9 p-0 text-center text-[13.5px] text-ink-900",
              day_button: "flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-surface-2",
              today: "font-semibold text-primary-700",
              selected: "[&>button]:bg-primary-700 [&>button]:text-white [&>button]:hover:bg-primary-700",
              outside: "text-ink-300",
              disabled: "text-ink-300 pointer-events-none",
            }}
          />
        </div>
      )}
    </div>
  );
}
