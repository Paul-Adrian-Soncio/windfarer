import { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";

interface ListRowProps {
  icon: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  price?: ReactNode;
  notes?: ReactNode;
  onRemove: () => void;
  className?: string;
}

/** The mockup's generic list row: slate icon square, display title, mono meta line, display price. */
export function ListRow({ icon, title, meta, price, notes, onRemove, className }: ListRowProps) {
  return (
    <div
      className={cn(
        "relative flex items-start gap-[13px] rounded-md border border-hair bg-surface-2 px-[15px] py-[14px]",
        className
      )}
    >
      <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-secondary-tint">
        <span className="[&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:stroke-secondary-ink">{icon}</span>
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-display text-[15px] font-semibold text-ink-900">{title}</div>
        {meta && <div className="mt-0.5 font-mono text-[11.5px] text-secondary-ink">{meta}</div>}
        {price && <div className="mt-1.5 font-display text-[15px] font-bold text-ink-900">{price}</div>}
        {notes && <div className="mt-1 text-xs text-ink-500">{notes}</div>}
      </div>
      <button
        onClick={onRemove}
        className="ml-auto shrink-0 rounded-lg p-1.5 text-ink-500 hover:bg-paper hover:text-danger-600"
        aria-label="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
