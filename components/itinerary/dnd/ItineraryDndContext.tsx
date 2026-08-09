"use client";

import { ReactNode, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  closestCenter,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ItineraryBlockCard } from "../ItineraryBlockCard";
import { useTripStore } from "@/store/tripStore";
import { ItineraryDay, ItineraryBlock } from "@/types";

interface ItineraryDndContextProps {
  days: ItineraryDay[];
  blocks: Record<string, ItineraryBlock>;
  children: ReactNode;
}

export function ItineraryDndContext({ days, blocks, children }: ItineraryDndContextProps) {
  const moveBlock = useTripStore((s) => s.moveBlock);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function findDayIdForBlock(blockId: string): string | undefined {
    return days.find((d) => d.blockIds.includes(blockId))?.id;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveBlockId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveBlockId(null);
    if (!over) return;

    const blockId = String(active.id);
    const overId = String(over.id);

    const fromDayId = findDayIdForBlock(blockId);
    if (!fromDayId) return;

    // Dropped directly on a day container (empty area) vs. on another block
    const overIsDay = days.some((d) => d.id === overId);
    const toDayId = overIsDay ? overId : findDayIdForBlock(overId);
    if (!toDayId) return;

    const toDay = days.find((d) => d.id === toDayId)!;
    let toIndex: number;
    if (overIsDay) {
      toIndex = toDay.blockIds.length;
    } else {
      const overIndex = toDay.blockIds.indexOf(overId);
      toIndex = overIndex === -1 ? toDay.blockIds.length : overIndex;
    }

    if (fromDayId === toDayId) {
      const fromIndex = toDay.blockIds.indexOf(blockId);
      if (fromIndex === toIndex) return;
    }

    moveBlock(blockId, toDayId, toIndex);
  }

  const activeBlock = activeBlockId ? blocks[activeBlockId] : undefined;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay>
        {activeBlock ? (
          <ItineraryBlockCard block={activeBlock} onEdit={() => {}} onRemove={() => {}} overlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
