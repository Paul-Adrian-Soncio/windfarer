"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, Trash2, Pencil, Check } from "lucide-react";
import { ItineraryBlockCard } from "./ItineraryBlockCard";
import { BlockEditorModal } from "./BlockEditorModal";
import { Input } from "@/components/ui/Input";
import { useTripStore } from "@/store/tripStore";
import { ItineraryDay, ItineraryBlock } from "@/types";

interface DayCanvasProps {
  day: ItineraryDay;
  blocks: Record<string, ItineraryBlock>;
}

export function DayCanvas({ day, blocks }: DayCanvasProps) {
  const addBlock = useTripStore((s) => s.addBlock);
  const updateBlock = useTripStore((s) => s.updateBlock);
  const removeBlock = useTripStore((s) => s.removeBlock);
  const renameDay = useTripStore((s) => s.renameDay);
  const removeDay = useTripStore((s) => s.removeDay);

  const { setNodeRef, isOver } = useDroppable({ id: day.id });

  const [showAdd, setShowAdd] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState(day.label);

  const editingBlock = editingBlockId ? blocks[editingBlockId] : undefined;
  const dayBlocks = day.blockIds.map((id) => blocks[id]).filter(Boolean);

  function commitLabel() {
    if (labelDraft.trim()) renameDay(day.id, labelDraft.trim());
    setEditingLabel(false);
  }

  return (
    <div className="flex w-72 shrink-0 flex-col gap-3 rounded-card bg-primary-50/50 p-3">
      <div className="flex items-center justify-between gap-1 px-1">
        {editingLabel ? (
          <div className="flex flex-1 items-center gap-1">
            <Input
              autoFocus
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && commitLabel()}
              className="py-1 text-sm"
            />
            <button onClick={commitLabel} className="rounded-full p-1.5 text-primary-600 hover:bg-primary-100">
              <Check className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <h3 className="font-display text-sm font-semibold text-ink-900">{day.label}</h3>
            <div className="flex gap-0.5">
              <button
                onClick={() => {
                  setLabelDraft(day.label);
                  setEditingLabel(true);
                }}
                className="rounded-full p-1.5 text-ink-300 hover:bg-primary-100 hover:text-primary-600"
                aria-label="Rename day"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => removeDay(day.id)}
                className="rounded-full p-1.5 text-ink-300 hover:bg-danger-500/10 hover:text-danger-600"
                aria-label="Remove day"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        )}
      </div>

      <div
        ref={setNodeRef}
        className={`flex min-h-[80px] flex-col gap-2 rounded-xl p-1 transition-colors ${
          isOver ? "bg-primary-100/70" : ""
        }`}
      >
        <SortableContext items={day.blockIds} strategy={verticalListSortingStrategy}>
          {dayBlocks.map((block) => (
            <ItineraryBlockCard
              key={block.id}
              block={block}
              onEdit={() => setEditingBlockId(block.id)}
              onRemove={() => removeBlock(block.id)}
            />
          ))}
        </SortableContext>
        {dayBlocks.length === 0 && (
          <p className="px-2 py-3 text-center text-xs text-ink-400">Drag blocks here, or add one below.</p>
        )}
      </div>

      <button
        onClick={() => setShowAdd(true)}
        className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary-300 py-2 text-sm font-medium text-primary-600 hover:bg-primary-100/60"
      >
        <Plus className="h-4 w-4" /> Add block
      </button>

      <BlockEditorModal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={(block) => addBlock(day.id, block)} />
      {editingBlock && (
        <BlockEditorModal
          open
          initial={editingBlock}
          onClose={() => setEditingBlockId(null)}
          onSubmit={(patch) => updateBlock(editingBlock.id, patch)}
        />
      )}
    </div>
  );
}
