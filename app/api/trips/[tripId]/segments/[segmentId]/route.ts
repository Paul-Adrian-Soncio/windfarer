import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { updateTravelSegmentSchema } from "@/lib/validation/travelSegment";
import { isAuthResponse, requireTripOwnership } from "@/lib/auth/requireTripOwnership";

interface RouteContext {
  params: Promise<{ tripId: string; segmentId: string }>;
}

// Looks up a segment and confirms it actually belongs to the given trip —
// not just that a segment with this id exists somewhere in the database.
// Without this check, a caller could pass a valid segmentId that belongs to
// a DIFFERENT trip and it would "work," which is exactly the kind of bug
// (an IDOR — Insecure Direct Object Reference) auth is meant to prevent.
async function findSegmentInTrip(tripId: string, segmentId: string) {
  const segment = await prisma.travelSegment.findUnique({ where: { id: segmentId } });
  if (!segment || segment.tripId !== tripId) {
    return null;
  }
  return segment;
}

// GET /api/trips/[tripId]/segments/[segmentId]
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { tripId, segmentId } = await params;

  const ownership = await requireTripOwnership(request, tripId);
  if (isAuthResponse(ownership)) return ownership;

  const segment = await findSegmentInTrip(tripId, segmentId);
  if (!segment) {
    return NextResponse.json({ error: "Travel segment not found" }, { status: 404 });
  }

  return NextResponse.json(segment);
}

// PATCH /api/trips/[tripId]/segments/[segmentId]
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { tripId, segmentId } = await params;

  const ownership = await requireTripOwnership(request, tripId);
  if (isAuthResponse(ownership)) return ownership;

  const existing = await findSegmentInTrip(tripId, segmentId);
  if (!existing) {
    return NextResponse.json({ error: "Travel segment not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const result = updateTravelSegmentSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: z.treeifyError(result.error) },
      { status: 400 }
    );
  }

  const segment = await prisma.travelSegment.update({
    where: { id: segmentId },
    data: result.data,
  });

  return NextResponse.json(segment);
}

// DELETE /api/trips/[tripId]/segments/[segmentId]
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { tripId, segmentId } = await params;

  const ownership = await requireTripOwnership(request, tripId);
  if (isAuthResponse(ownership)) return ownership;

  const existing = await findSegmentInTrip(tripId, segmentId);
  if (!existing) {
    return NextResponse.json({ error: "Travel segment not found" }, { status: 404 });
  }

  await prisma.travelSegment.delete({ where: { id: segmentId } });

  return new NextResponse(null, { status: 204 });
}
