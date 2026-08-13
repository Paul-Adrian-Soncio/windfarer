import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { updateAccommodationSchema } from "@/lib/validation/accommodation";

interface RouteContext {
  params: Promise<{ tripId: string; accommodationId: string }>;
}

// Confirms the accommodation exists AND belongs to the given trip — same
// IDOR-prevention pattern used for travel segments.
async function findAccommodationInTrip(tripId: string, accommodationId: string) {
  const accommodation = await prisma.accommodation.findUnique({ where: { id: accommodationId } });
  if (!accommodation || accommodation.tripId !== tripId) {
    return null;
  }
  return accommodation;
}

// GET /api/trips/[tripId]/accommodations/[accommodationId]
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { tripId, accommodationId } = await params;

  const accommodation = await findAccommodationInTrip(tripId, accommodationId);
  if (!accommodation) {
    return NextResponse.json({ error: "Accommodation not found" }, { status: 404 });
  }

  return NextResponse.json(accommodation);
}

// PATCH /api/trips/[tripId]/accommodations/[accommodationId]
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { tripId, accommodationId } = await params;

  const existing = await findAccommodationInTrip(tripId, accommodationId);
  if (!existing) {
    return NextResponse.json({ error: "Accommodation not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const result = updateAccommodationSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: z.treeifyError(result.error) },
      { status: 400 }
    );
  }

  const accommodation = await prisma.accommodation.update({
    where: { id: accommodationId },
    data: result.data,
  });

  return NextResponse.json(accommodation);
}

// DELETE /api/trips/[tripId]/accommodations/[accommodationId]
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { tripId, accommodationId } = await params;

  const existing = await findAccommodationInTrip(tripId, accommodationId);
  if (!existing) {
    return NextResponse.json({ error: "Accommodation not found" }, { status: 404 });
  }

  await prisma.accommodation.delete({ where: { id: accommodationId } });

  return new NextResponse(null, { status: 204 });
}
