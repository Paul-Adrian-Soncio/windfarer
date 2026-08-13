import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAdvanceBookingSchema } from "@/lib/validation/advanceBooking";

interface RouteContext {
  params: Promise<{ tripId: string }>;
}

// GET /api/trips/[tripId]/advance-bookings
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { tripId } = await params;

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const advanceBookings = await prisma.advanceBooking.findMany({ where: { tripId } });
  return NextResponse.json(advanceBookings);
}

// POST /api/trips/[tripId]/advance-bookings
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { tripId } = await params;

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

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
