import { cn } from "@/lib/cn";

export function ProgressBar({ value, max, className }: { value: number; max: number; className?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const over = max > 0 && value > max;

  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-pill bg-ink-100", className)}>
      <div
        className={cn("h-full rounded-pill transition-all", over ? "bg-danger-500" : "bg-primary-500")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
