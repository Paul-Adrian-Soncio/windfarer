import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { createBudgetAllocationSchema } from "@/lib/validation/budgetAllocation";
import { isAuthResponse, requireTripOwnership } from "@/lib/auth/requireTripOwnership";

interface RouteContext {
  params: Promise<{ tripId: string }>;
}

// GET /api/trips/[tripId]/budget-allocations
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { tripId } = await params;

  const ownership = await requireTripOwnership(request, tripId);
  if (isAuthResponse(ownership)) return ownership;

  const allocations = await prisma.budgetAllocation.findMany({ where: { tripId } });
  return NextResponse.json(allocations);
}

// POST /api/trips/[tripId]/budget-allocations
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

  const result = createBudgetAllocationSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: z.treeifyError(result.error) },
      { status: 400 }
    );
  }

  const data = result.data;

  // Verify the referenced day/block actually belongs to THIS trip — same
  // ownership principle as every other nested resource, applied here to a
  // reference field rather than the resource's own parent id.
  if (data.scopeKind === "DAY") {
    const day = await prisma.itineraryDay.findUnique({ where: { id: data.dayId } });
    if (!day || day.tripId !== tripId) {
      return NextResponse.json({ error: "Itinerary day not found in this trip" }, { status: 404 });
    }
  }
  if (data.scopeKind === "BLOCK") {
    const block = await prisma.itineraryBlock.findUnique({
      where: { id: data.blockId },
      include: { day: true },
    });
    if (!block || block.day.tripId !== tripId) {
      return NextResponse.json({ error: "Itinerary block not found in this trip" }, { status: 404 });
    }
  }

  try {
    const allocation = await prisma.budgetAllocation.create({
      data: { ...data, tripId },
    });
    return NextResponse.json(allocation, { status: 201 });
  } catch (error) {
    // P2002 = Prisma's unique-constraint-violation code. Here that means
    // this day/block already has an allocation (dayId/blockId are @unique
    // in the schema) — a real, expected conflict, not a server bug.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "This day or block already has a budget allocation" },
        { status: 409 }
      );
    }
    throw error;
  }
}
