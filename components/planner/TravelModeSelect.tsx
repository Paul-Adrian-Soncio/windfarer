import { TRAVEL_MODE_OPTIONS } from "@/lib/constants";
import { TravelMode } from "@/types";
import { cn } from "@/lib/cn";

export function TravelModeSelect({ value, onChange }: { value: TravelMode; onChange: (mode: TravelMode) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TRAVEL_MODE_OPTIONS.map(({ value: mode, label, icon: Icon }) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
            value === mode
              ? "border-primary-500 bg-primary-50 text-primary-700"
              : "border-ink-200 text-ink-600 hover:border-ink-300"
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
