import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAdvanceBookingSchema } from "@/lib/validation/advanceBooking";
import { isAuthResponse, requireTripOwnership } from "@/lib/auth/requireTripOwnership";

interface RouteContext {
  params: Promise<{ tripId: string }>;
}

// GET /api/trips/[tripId]/advance-bookings
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { tripId } = await params;

  const ownership = await requireTripOwnership(request, tripId);
  if (isAuthResponse(ownership)) return ownership;

  const advanceBookings = await prisma.advanceBooking.findMany({ where: { tripId } });
  return NextResponse.json(advanceBookings);
}

// POST /api/trips/[tripId]/advance-bookings
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { tripId } = await params;

  const ownership = await requireTripOwnership(request, tripId);
  if (isAuthResponse(ownership)) return ownership;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const result = createAdvanceBookingSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: z.treeifyError(result.error) },
      { status: 400 }
    );
  }

  const advanceBooking = await prisma.advanceBooking.create({
    data: {
      ...result.data,
      tripId,
    },
  });

  return NextResponse.json(advanceBooking, { status: 201 });
}
