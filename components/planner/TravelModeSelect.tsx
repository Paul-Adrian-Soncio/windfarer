import { TRAVEL_MODE_OPTIONS } from "@/lib/constants";
import { TravelMode } from "@/types";
import { cn } from "@/lib/cn";

export function TravelModeSelect({ value, onChange }: { value: TravelMode; onChange: (mode: TravelMode) => void }) {
  return (
    <div className="flex flex-wrap gap-[7px]">
      {TRAVEL_MODE_OPTIONS.map(({ value: mode, label, icon: Icon }) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={cn(
            "flex min-w-[60px] flex-1 flex-col items-center gap-[5px] rounded-xl border-[1.5px] py-2.5 text-[11px] font-semibold transition-colors",
            value === mode
              ? "border-primary-700 bg-primary-tint text-primary-700"
              : "border-hair bg-surface-2 text-ink-700 hover:border-ink-300"
          )}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
          {label}
        </button>
      ))}
    </div>
  );
}
