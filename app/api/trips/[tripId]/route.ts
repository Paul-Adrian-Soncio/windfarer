import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { updateTripSchema } from "@/lib/validation/trip";
import { isAuthResponse, requireTripOwnership } from "@/lib/auth/requireTripOwnership";

// Next.js 16 delivers dynamic route params as a Promise — must be awaited
// before use. This type describes that shape for every handler below.
//
// Named `tripId` (not `id`) to match the param name used everywhere a trip
// id appears in the URL — Next.js requires the same slug name at the same
// URL position across the whole route tree (see app/api/trips/[tripId]/segments/).
interface RouteContext {
  params: Promise<{ tripId: string }>;
}

// GET /api/trips/[tripId]
// Fetches a single trip by id. 404s if it doesn't exist OR isn't yours —
// see requireTripOwnership for why those two cases look identical.
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { tripId } = await params;

  const ownership = await requireTripOwnership(request, tripId);
  if (isAuthResponse(ownership)) return ownership;

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  return NextResponse.json(trip);
}

// PATCH /api/trips/[tripId]
// Partially updates a trip — only the fields present in the request body
// are changed. 404s if it doesn't exist OR isn't yours.
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { tripId } = await params;

  const ownership = await requireTripOwnership(request, tripId);
  if (isAuthResponse(ownership)) return ownership;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const result = updateTripSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: z.treeifyError(result.error) },
      { status: 400 }
    );
  }

  const trip = await prisma.trip.update({
    where: { id: tripId },
    data: result.data,
  });

  return NextResponse.json(trip);
}

// DELETE /api/trips/[tripId]
// Deletes a trip. Every related row (travel segments, accommodations,
// itinerary days/blocks, budget allocations) is removed automatically via
// the onDelete: Cascade relationships defined in schema.prisma.
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { tripId } = await params;

  const ownership = await requireTripOwnership(request, tripId);
  if (isAuthResponse(ownership)) return ownership;

  await prisma.trip.delete({ where: { id: tripId } });

  return new NextResponse(null, { status: 204 });
}
