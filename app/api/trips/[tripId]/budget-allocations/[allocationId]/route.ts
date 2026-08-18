import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { updateBudgetAllocationSchema } from "@/lib/validation/budgetAllocation";
import { isAuthResponse, requireTripOwnership } from "@/lib/auth/requireTripOwnership";

interface RouteContext {
  params: Promise<{ tripId: string; allocationId: string }>;
}

async function findAllocationInTrip(tripId: string, allocationId: string) {
  const allocation = await prisma.budgetAllocation.findUnique({ where: { id: allocationId } });
  if (!allocation || allocation.tripId !== tripId) {
    return null;
  }
  return allocation;
}

// GET /api/trips/[tripId]/budget-allocations/[allocationId]
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { tripId, allocationId } = await params;

  const ownership = await requireTripOwnership(request, tripId);
  if (isAuthResponse(ownership)) return ownership;

  const allocation = await findAllocationInTrip(tripId, allocationId);
  if (!allocation) {
    return NextResponse.json({ error: "Budget allocation not found" }, { status: 404 });
  }

  return NextResponse.json(allocation);
}

// PATCH /api/trips/[tripId]/budget-allocations/[allocationId]
// Only label/amount are editable — see updateBudgetAllocationSchema for why
// scopeKind/dayId/blockId are intentionally not part of this schema.
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { tripId, allocationId } = await params;

  const ownership = await requireTripOwnership(request, tripId);
  if (isAuthResponse(ownership)) return ownership;

  const existing = await findAllocationInTrip(tripId, allocationId);
  if (!existing) {
    return NextResponse.json({ error: "Budget allocation not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const result = updateBudgetAllocationSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: z.treeifyError(result.error) },
      { status: 400 }
    );
  }

  const allocation = await prisma.budgetAllocation.update({
    where: { id: allocationId },
    data: result.data,
  });

  return NextResponse.json(allocation);
}

// DELETE /api/trips/[tripId]/budget-allocations/[allocationId]
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { tripId, allocationId } = await params;

  const ownership = await requireTripOwnership(request, tripId);
  if (isAuthResponse(ownership)) return ownership;

  const existing = await findAllocationInTrip(tripId, allocationId);
  if (!existing) {
    return NextResponse.json({ error: "Budget allocation not found" }, { status: 404 });
  }

  await prisma.budgetAllocation.delete({ where: { id: allocationId } });

  return new NextResponse(null, { status: 204 });
}
