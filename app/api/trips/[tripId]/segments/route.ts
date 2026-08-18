import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createTravelSegmentSchema } from "@/lib/validation/travelSegment";
import { isAuthResponse, requireTripOwnership } from "@/lib/auth/requireTripOwnership";

interface RouteContext {
  params: Promise<{ tripId: string }>;
}

// GET /api/trips/[tripId]/segments
// Lists every travel segment belonging to this trip.
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { tripId } = await params;

  const ownership = await requireTripOwnership(request, tripId);
  if (isAuthResponse(ownership)) return ownership;

  const segments = await prisma.travelSegment.findMany({ where: { tripId } });
  return NextResponse.json(segments);
}

// POST /api/trips/[tripId]/segments
// Creates a new travel segment belonging to this trip.
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

  const result = createTravelSegmentSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: z.treeifyError(result.error) },
      { status: 400 }
    );
  }

  const segment = await prisma.travelSegment.create({
    data: {
      ...result.data,
      tripId,
    },
  });

  return NextResponse.json(segment, { status: 201 });
}
