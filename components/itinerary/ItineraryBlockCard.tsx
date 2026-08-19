"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { BlockTypeIcon } from "./BlockTypeIcon";
import { getBlockTypeOption } from "@/lib/constants";
import { fmtMoney } from "@/lib/money";
import { DEFAULT_CURRENCY } from "@/lib/currency";
import { useTripStore } from "@/store/tripStore";
import { ItineraryBlock } from "@/types";
import { cn } from "@/lib/cn";

interface ItineraryBlockCardProps {
  block: ItineraryBlock;
  onEdit: () => void;
  onRemove: () => void;
  overlay?: boolean;
}

export function ItineraryBlockCard({ block, onEdit, onRemove, overlay }: ItineraryBlockCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const { borderClass } = getBlockTypeOption(block.type);
  const currency = useTripStore((s) => s.trip?.budget.currency) ?? DEFAULT_CURRENCY;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-sm border border-hair border-l-[3px] bg-surface p-3 pl-[13px] shadow-[0_6px_16px_-12px_rgba(43,39,33,0.4)] transition-shadow",
        borderClass,
        isDragging && "opacity-40",
        overlay && "scale-[1.02] shadow-lift"
      )}
    >
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab touch-none rounded p-0.5 text-ink-500 hover:text-ink-700 active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>

        <BlockTypeIcon type={block.type} className="shrink-0 bg-paper! p-1.5!" />

        <p className="min-w-0 flex-1 truncate font-display text-sm font-semibold text-ink-900">{block.title}</p>

        <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 group-active:opacity-100">
          <button onClick={onEdit} className="rounded-lg p-1 text-ink-500 hover:bg-primary-tint hover:text-primary-700" aria-label="Edit block">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={onRemove} className="rounded-lg p-1 text-ink-500 hover:bg-danger-tint hover:text-danger-600" aria-label="Remove block">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {(block.scheduledTime || block.plannedExpense !== undefined) && (
        <div className="ml-[34px] mt-2 flex gap-3.5 font-mono text-[11.5px] text-secondary-ink">
          {block.scheduledTime && <span>{block.scheduledTime}</span>}
          {block.plannedExpense !== undefined && <span>{fmtMoney(block.plannedExpense, currency)}</span>}
        </div>
      )}
      {block.description && <p className="ml-[34px] mt-[5px] text-xs text-ink-500">{block.description}</p>}
    </div>
  );
}
