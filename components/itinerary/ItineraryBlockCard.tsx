"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, Clock, DollarSign } from "lucide-react";
import { BlockTypeIcon } from "./BlockTypeIcon";
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-start gap-2 rounded-xl border border-ink-100 bg-white p-3 transition-shadow",
        isDragging && "opacity-40",
        overlay && "shadow-lift scale-[1.02]"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-1 shrink-0 cursor-grab touch-none rounded p-1 text-ink-300 hover:text-ink-500 active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <BlockTypeIcon type={block.type} className="mt-0.5 shrink-0" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-900">{block.title}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-500">
          {block.scheduledTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {block.scheduledTime}
            </span>
          )}
          {block.plannedExpense !== undefined && (
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> {block.plannedExpense.toFixed(2)}
            </span>
          )}
        </div>
        {block.description && <p className="mt-1 truncate text-xs text-ink-400">{block.description}</p>}
      </div>

      <div className="flex shrink-0 gap-0.5">
        <button onClick={onEdit} className="rounded-full p-1.5 text-ink-300 hover:bg-primary-50 hover:text-primary-600" aria-label="Edit block">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button onClick={onRemove} className="rounded-full p-1.5 text-ink-300 hover:bg-danger-500/10 hover:text-danger-600" aria-label="Remove block">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
