import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const setActiveTripSchema = z.object({
  // null clears the active trip (e.g. after deleting it, or deliberately
  // deselecting) — a trip id sets it, after confirming ownership below.
  tripId: z.string().uuid().nullable(),
});

// GET /api/user/active-trip
// Returns which trip (if any) is currently active for the signed-in user.
// Separate from GET /api/trips (which lists trip rows) since this reads
// the User row's own column.
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { activeTripId: true },
  });

  return NextResponse.json({ activeTripId: user?.activeTripId ?? null });
}

// PATCH /api/user/active-trip
// Sets (or clears) which of the signed-in user's trips is "active" — the
// one Home/Planner/Itinerary/Budget resolve to by default. Lives under
// /api/user rather than /api/trips/[tripId] since this mutates the User
// row, not the Trip row.
export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const result = setActiveTripSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: z.treeifyError(result.error) },
      { status: 400 }
    );
  }

  const { tripId } = result.data;

  if (tripId !== null) {
    // Same "404 either way" shape as requireTripOwnership — a trip id
    // that isn't yours shouldn't reveal whether it exists.
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip || trip.userId !== session.user.id) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { activeTripId: tripId },
    select: { activeTripId: true },
  });

  return NextResponse.json(user);
}
