import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createItineraryBlockSchema } from "@/lib/validation/itineraryBlock";
import { isAuthResponse, requireTripOwnership } from "@/lib/auth/requireTripOwnership";

interface RouteContext {
  params: Promise<{ tripId: string; dayId: string }>;
}

async function findDayInTrip(tripId: string, dayId: string) {
  const day = await prisma.itineraryDay.findUnique({ where: { id: dayId } });
  if (!day || day.tripId !== tripId) {
    return null;
  }
  return day;
}

// GET /api/trips/[tripId]/days/[dayId]/blocks
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { tripId, dayId } = await params;

  const ownership = await requireTripOwnership(request, tripId);
  if (isAuthResponse(ownership)) return ownership;

  const day = await findDayInTrip(tripId, dayId);
  if (!day) {
    return NextResponse.json({ error: "Itinerary day not found" }, { status: 404 });
  }

  const blocks = await prisma.itineraryBlock.findMany({
    where: { dayId },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(blocks);
}

// POST /api/trips/[tripId]/days/[dayId]/blocks
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { tripId, dayId } = await params;

  const ownership = await requireTripOwnership(request, tripId);
  if (isAuthResponse(ownership)) return ownership;

  const day = await findDayInTrip(tripId, dayId);
  if (!day) {
    return NextResponse.json({ error: "Itinerary day not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const result = createItineraryBlockSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: z.treeifyError(result.error) },
      { status: 400 }
    );
  }

  // Same fix as itineraryDay's POST route — the frontend never sends
  // sortOrder on create, so compute the real next slot within this day
  // instead of letting every new block collide at the same value.
  let sortOrder = result.data.sortOrder;
  if (sortOrder === undefined) {
    const { _max } = await prisma.itineraryBlock.aggregate({ where: { dayId }, _max: { sortOrder: true } });
    sortOrder = (_max.sortOrder ?? -1) + 1;
  }

  const block = await prisma.itineraryBlock.create({
    data: {
      ...result.data,
      sortOrder,
      dayId,
    },
  });

  return NextResponse.json(block, { status: 201 });
}
