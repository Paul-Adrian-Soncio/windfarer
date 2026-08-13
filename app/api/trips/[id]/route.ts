import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { updateTripSchema } from "@/lib/validation/trip";

// Next.js 16 delivers dynamic route params as a Promise — must be awaited
// before use. This type describes that shape for every handler below.
interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/trips/[id]
// Fetches a single trip by id. 404s if no trip with that id exists.
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const trip = await prisma.trip.findUnique({ where: { id } });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  return NextResponse.json(trip);
}

// PATCH /api/trips/[id]
// Partially updates a trip — only the fields present in the request body
// are changed. 404s if no trip with that id exists.
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

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

  const existing = await prisma.trip.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const trip = await prisma.trip.update({
    where: { id },
    data: result.data,
  });

  return NextResponse.json(trip);
}

// DELETE /api/trips/[id]
// Deletes a trip. Every related row (travel segments, accommodations,
// itinerary days/blocks, budget allocations) is removed automatically via
// the onDelete: Cascade relationships defined in schema.prisma.
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const existing = await prisma.trip.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  await prisma.trip.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}
