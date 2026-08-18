import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { updateItineraryBlockSchema } from "@/lib/validation/itineraryBlock";
import { moveBlock } from "@/lib/itineraryReorder";
import { isAuthResponse, requireTripOwnership } from "@/lib/auth/requireTripOwnership";

interface RouteContext {
  params: Promise<{ tripId: string; dayId: string; blockId: string }>;
}

// Confirms the day belongs to the trip, and the block belongs to that day —
// two ownership checks chained together, since ItineraryBlock only has a
// direct relation to ItineraryDay, not to Trip.
async function findBlockInTripDay(tripId: string, dayId: string, blockId: string) {
  const day = await prisma.itineraryDay.findUnique({ where: { id: dayId } });
  if (!day || day.tripId !== tripId) {
    return null;
  }

  const block = await prisma.itineraryBlock.findUnique({ where: { id: blockId } });
  if (!block || block.dayId !== dayId) {
    return null;
  }

  return block;
}

// GET /api/trips/[tripId]/days/[dayId]/blocks/[blockId]
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { tripId, dayId, blockId } = await params;

  const ownership = await requireTripOwnership(request, tripId);
  if (isAuthResponse(ownership)) return ownership;

  const block = await findBlockInTripDay(tripId, dayId, blockId);
  if (!block) {
    return NextResponse.json({ error: "Itinerary block not found" }, { status: 404 });
  }

  return NextResponse.json(block);
}

// PATCH /api/trips/[tripId]/days/[dayId]/blocks/[blockId]
// A plain field edit (title, cost, etc.) updates normally. If the request
// also changes dayId and/or sortOrder, that's a drag-and-drop move — it
// goes through moveBlock() instead, which keeps every sibling block's
// sortOrder consistent via a transaction.
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { tripId, dayId, blockId } = await params;

  const ownership = await requireTripOwnership(request, tripId);
  if (isAuthResponse(ownership)) return ownership;

  const existing = await findBlockInTripDay(tripId, dayId, blockId);
  if (!existing) {
    return NextResponse.json({ error: "Itinerary block not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const result = updateItineraryBlockSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: z.treeifyError(result.error) },
      { status: 400 }
    );
  }

  const { dayId: newDayId, sortOrder: newSortOrder, ...fieldUpdates } = result.data;
  const isMove = newDayId !== undefined || newSortOrder !== undefined;

  if (isMove) {
    // Applying any plain field changes first (if both are sent together),
    // then the move/reorder as its own transactional step.
    if (Object.keys(fieldUpdates).length > 0) {
      await prisma.itineraryBlock.update({ where: { id: blockId }, data: fieldUpdates });
    }
    const block = await moveBlock(blockId, newDayId ?? existing.dayId, newSortOrder ?? existing.sortOrder);
    return NextResponse.json(block);
  }

  const block = await prisma.itineraryBlock.update({
    where: { id: blockId },
    data: fieldUpdates,
  });

  return NextResponse.json(block);
}

// DELETE /api/trips/[tripId]/days/[dayId]/blocks/[blockId]
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { tripId, dayId, blockId } = await params;

  const ownership = await requireTripOwnership(request, tripId);
  if (isAuthResponse(ownership)) return ownership;

  const existing = await findBlockInTripDay(tripId, dayId, blockId);
  if (!existing) {
    return NextResponse.json({ error: "Itinerary block not found" }, { status: 404 });
  }

  await prisma.itineraryBlock.delete({ where: { id: blockId } });

  return new NextResponse(null, { status: 204 });
}
