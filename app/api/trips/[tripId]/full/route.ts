import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthResponse, requireTripOwnership } from "@/lib/auth/requireTripOwnership";

interface RouteContext {
  params: Promise<{ tripId: string }>;
}

// GET /api/trips/[tripId]/full
// Returns a trip with every related resource nested inside it in a single
// query — segments, accommodations, advance bookings, itinerary days (each
// with its blocks, ordered by sortOrder), and budget allocations. This is
// the "detail page" endpoint: everything the frontend needs to render a
// trip in one round-trip, instead of six separate requests.
//
// `include` tells Prisma which related tables to pull alongside the Trip
// row, in the same query — this is a JOIN under the hood, not N+1 separate
// queries. Nested `include`/`orderBy` inside a relation (see `days` below)
// applies to that specific relation's rows only.
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { tripId } = await params;

  const ownership = await requireTripOwnership(request, tripId);
  if (isAuthResponse(ownership)) return ownership;

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      travelSegments: true,
      accommodations: true,
      advanceBookings: true,
      budgetAllocations: true,
      itineraryDays: {
        orderBy: { sortOrder: "asc" },
        include: {
          blocks: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });

  return NextResponse.json(trip);
}
