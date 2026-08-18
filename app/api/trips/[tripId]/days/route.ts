import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createItineraryDaySchema } from "@/lib/validation/itineraryDay";
import { isAuthResponse, requireTripOwnership } from "@/lib/auth/requireTripOwnership";

interface RouteContext {
  params: Promise<{ tripId: string }>;
}

// GET /api/trips/[tripId]/days
// Lists days for this trip, ordered left-to-right per sortOrder.
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { tripId } = await params;

  const ownership = await requireTripOwnership(request, tripId);
  if (isAuthResponse(ownership)) return ownership;

  const days = await prisma.itineraryDay.findMany({
    where: { tripId },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(days);
}

// POST /api/trips/[tripId]/days
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

  const result = createItineraryDaySchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: z.treeifyError(result.error) },
      { status: 400 }
    );
  }

  const day = await prisma.itineraryDay.create({
    data: {
      ...result.data,
      tripId,
    },
  });

  return NextResponse.json(day, { status: 201 });
}
