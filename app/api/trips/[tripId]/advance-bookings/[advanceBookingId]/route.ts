import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { updateAdvanceBookingSchema } from "@/lib/validation/advanceBooking";
import { isAuthResponse, requireTripOwnership } from "@/lib/auth/requireTripOwnership";

interface RouteContext {
  params: Promise<{ tripId: string; advanceBookingId: string }>;
}

async function findAdvanceBookingInTrip(tripId: string, advanceBookingId: string) {
  const advanceBooking = await prisma.advanceBooking.findUnique({ where: { id: advanceBookingId } });
  if (!advanceBooking || advanceBooking.tripId !== tripId) {
    return null;
  }
  return advanceBooking;
}

// GET /api/trips/[tripId]/advance-bookings/[advanceBookingId]
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { tripId, advanceBookingId } = await params;

  const ownership = await requireTripOwnership(request, tripId);
  if (isAuthResponse(ownership)) return ownership;

  const advanceBooking = await findAdvanceBookingInTrip(tripId, advanceBookingId);
  if (!advanceBooking) {
    return NextResponse.json({ error: "Advance booking not found" }, { status: 404 });
  }

  return NextResponse.json(advanceBooking);
}

// PATCH /api/trips/[tripId]/advance-bookings/[advanceBookingId]
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { tripId, advanceBookingId } = await params;

  const ownership = await requireTripOwnership(request, tripId);
  if (isAuthResponse(ownership)) return ownership;

  const existing = await findAdvanceBookingInTrip(tripId, advanceBookingId);
  if (!existing) {
    return NextResponse.json({ error: "Advance booking not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const result = updateAdvanceBookingSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: z.treeifyError(result.error) },
      { status: 400 }
    );
  }

  const advanceBooking = await prisma.advanceBooking.update({
    where: { id: advanceBookingId },
    data: result.data,
  });

  return NextResponse.json(advanceBooking);
}

// DELETE /api/trips/[tripId]/advance-bookings/[advanceBookingId]
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { tripId, advanceBookingId } = await params;

  const ownership = await requireTripOwnership(request, tripId);
  if (isAuthResponse(ownership)) return ownership;

  const existing = await findAdvanceBookingInTrip(tripId, advanceBookingId);
  if (!existing) {
    return NextResponse.json({ error: "Advance booking not found" }, { status: 404 });
  }

  await prisma.advanceBooking.delete({ where: { id: advanceBookingId } });

  return new NextResponse(null, { status: 204 });
}
