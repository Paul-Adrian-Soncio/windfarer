import { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { fmtMoney } from "@/lib/money";
import { cn } from "@/lib/cn";

interface TicketStubProps {
  icon: ReactNode;
  title: string;
  route: string;
  cost?: number;
  seatOrRef?: string;
  badges?: ReactNode;
  onRemove: () => void;
  className?: string;
}

/**
 * The signature "boarding pass" element for a travel leg: a main body with
 * mode icon / title / route / badges, and a perforated stub with fare + a
 * seat/reference line — see §5 of the Trailhead redesign brief.
 */
export function TicketStub({ icon, title, route, cost, seatOrRef, badges, onRemove, className }: TicketStubProps) {
  return (
    <div className={cn("relative flex overflow-hidden rounded-md border border-hair bg-surface shadow-[0_6px_16px_-12px_rgba(43,39,33,0.4)]", className)}>
      <div className="min-w-0 flex-1 p-4">
        <div className="flex items-center gap-[11px]">
          <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-primary-tint">
            <span className="[&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:fill-primary-700">{icon}</span>
          </span>
          <div className="min-w-0">
            <div className="font-display text-[15.5px] font-semibold text-ink-900">{title}</div>
            <div className="mt-0.5 font-mono text-[11.5px] tracking-[.02em] text-secondary-ink">{route}</div>
          </div>
        </div>
        {badges && <div className="mt-[11px] flex flex-wrap gap-1.5">{badges}</div>}
      </div>
      <div className="relative flex w-[96px] shrink-0 flex-col justify-center gap-[3px] border-l-2 border-dashed border-hair bg-surface-2 p-3.5 text-right sm:w-[118px]">
        <span className="absolute -left-2 -top-2 h-3.5 w-3.5 rounded-full border border-hair bg-paper" />
        <span className="absolute -bottom-2 -left-2 h-3.5 w-3.5 rounded-full border border-hair bg-paper" />
        <button
          onClick={onRemove}
          className="absolute right-[9px] top-2 rounded-lg p-1 text-ink-500 hover:bg-paper hover:text-danger-600"
          aria-label="Remove leg"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <span className="font-mono text-[9px] tracking-[.08em] text-ink-500">FARE</span>
        <span className="font-display text-[17px] font-bold text-ink-900">
          {cost !== undefined ? fmtMoney(cost) : "—"}
        </span>
        {seatOrRef && <span className="font-mono text-[9px] tracking-[.08em] text-ink-500">{seatOrRef}</span>}
      </div>
    </div>
  );
}
