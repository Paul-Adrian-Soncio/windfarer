"use client";

import { ReactNode } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { inputBase } from "./Input";
import { usePopover } from "./usePopover";

export interface DropdownOption {
  value: string;
  label: ReactNode;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  className?: string;
  "aria-label"?: string;
}

/**
 * Themed replacement for the native <select> (see components/ui/Input.tsx's
 * Select) — same value/onChange contract, so it drops into existing forms
 * without touching their state or submit logic. Trigger button reuses
 * inputBase so it sits flush with every other field.
 */
export function Dropdown({ value, onChange, options, className, "aria-label": ariaLabel }: DropdownProps) {
  const { open, setOpen, containerRef } = usePopover<HTMLDivElement>();
  const selected = options.find((o) => o.value === value);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(inputBase, "flex items-center justify-between gap-2 text-left", className)}
      >
        <span className="truncate">{selected?.label ?? value}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-ink-500" strokeWidth={2} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+6px)] z-20 max-h-64 min-w-full overflow-y-auto rounded-lg border border-hair bg-surface p-1.5 shadow-lift"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 whitespace-nowrap rounded-md px-3 py-2 text-left text-[14.5px] transition-colors",
                  isSelected ? "bg-primary-tint text-primary-700" : "text-ink-900 hover:bg-surface-2"
                )}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
