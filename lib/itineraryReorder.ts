import { prisma } from "./prisma";

/**
 * Moves/reorders a single ItineraryBlock and keeps every sibling block's
 * sortOrder consistent, matching the frontend's moveBlock(blockId, toDayId,
 * toIndex) semantics from store/tripStore.ts — this is the real, working
 * drag-and-drop feature (block reordering within/across days). There is no
 * equivalent day-reordering feature in the frontend today, so ItineraryDay's
 * sortOrder is just a plain field for now — see its PATCH route.
 *
 * Runs as a single database transaction: either every row involved gets
 * updated together, or (on any failure) none of them do. Without this,
 * a crash partway through could leave two blocks sharing the same
 * sortOrder, or a gap in the sequence — a corrupted, inconsistent state
 * that's hard to detect and even harder to fix by hand later.
 */
export async function moveBlock(blockId: string, toDayId: string, toIndex: number) {
  return prisma.$transaction(async (tx) => {
    const block = await tx.itineraryBlock.findUniqueOrThrow({ where: { id: blockId } });
    const fromDayId = block.dayId;
    const fromIndex = block.sortOrder;

    if (fromDayId === toDayId) {
      // Reordering within the same day.
      if (fromIndex === toIndex) {
        return block;
      }

      if (toIndex > fromIndex) {
        // Moving later in the list: everything strictly between the old and
        // new position shifts one step earlier, closing the gap left behind.
        await tx.itineraryBlock.updateMany({
          where: { dayId: fromDayId, sortOrder: { gt: fromIndex, lte: toIndex } },
          data: { sortOrder: { decrement: 1 } },
        });
      } else {
        // Moving earlier: everything between the new and old position
        // shifts one step later, making room.
        await tx.itineraryBlock.updateMany({
          where: { dayId: fromDayId, sortOrder: { gte: toIndex, lt: fromIndex } },
          data: { sortOrder: { increment: 1 } },
        });
      }

      return tx.itineraryBlock.update({
        where: { id: blockId },
        data: { sortOrder: toIndex },
      });
    }

    // Moving to a different day.
    // In the OLD day: close the gap left behind by this block.
    await tx.itineraryBlock.updateMany({
      where: { dayId: fromDayId, sortOrder: { gt: fromIndex } },
      data: { sortOrder: { decrement: 1 } },
    });

    // In the NEW day: make room at the target position.
    await tx.itineraryBlock.updateMany({
      where: { dayId: toDayId, sortOrder: { gte: toIndex } },
      data: { sortOrder: { increment: 1 } },
    });

    return tx.itineraryBlock.update({
      where: { id: blockId },
      data: { dayId: toDayId, sortOrder: toIndex },
    });
  });
}
