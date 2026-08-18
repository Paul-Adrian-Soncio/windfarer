import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { updateItineraryDaySchema } from "@/lib/validation/itineraryDay";
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

// GET /api/trips/[tripId]/days/[dayId]
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { tripId, dayId } = await params;

  const ownership = await requireTripOwnership(request, tripId);
  if (isAuthResponse(ownership)) return ownership;

  const day = await findDayInTrip(tripId, dayId);
  if (!day) {
    return NextResponse.json({ error: "Itinerary day not found" }, { status: 404 });
  }

  return NextResponse.json(day);
}

// PATCH /api/trips/[tripId]/days/[dayId]
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { tripId, dayId } = await params;

  const ownership = await requireTripOwnership(request, tripId);
  if (isAuthResponse(ownership)) return ownership;

  const existing = await findDayInTrip(tripId, dayId);
  if (!existing) {
    return NextResponse.json({ error: "Itinerary day not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const result = updateItineraryDaySchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: z.treeifyError(result.error) },
      { status: 400 }
    );
  }

  const day = await prisma.itineraryDay.update({
    where: { id: dayId },
    data: result.data,
  });

  return NextResponse.json(day);
}

// DELETE /api/trips/[tripId]/days/[dayId]
// Cascade deletes every block belonging to this day too.
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { tripId, dayId } = await params;

  const ownership = await requireTripOwnership(request, tripId);
  if (isAuthResponse(ownership)) return ownership;

  const existing = await findDayInTrip(tripId, dayId);
  if (!existing) {
    return NextResponse.json({ error: "Itinerary day not found" }, { status: 404 });
  }

  await prisma.itineraryDay.delete({ where: { id: dayId } });

  return new NextResponse(null, { status: 204 });
}
