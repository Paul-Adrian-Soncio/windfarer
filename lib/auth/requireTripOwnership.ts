import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * The one auth check every /api/trips/[tripId]/... route needs, run once at
 * the top of each handler before its own resource lookup: confirms there's
 * a signed-in session, then confirms that session's user owns this trip.
 *
 * Returns a NextResponse to return immediately if either check fails —
 * 401 with no session, 404 if the trip doesn't exist OR belongs to someone
 * else (deliberately the same response for both, so a trip id that isn't
 * yours doesn't reveal that it exists at all).
 *
 * On success, returns { userId } so callers that need it (POST handlers
 * creating new rows) don't have to re-fetch the session themselves.
 */
export async function requireTripOwnership(
  request: NextRequest,
  tripId: string
): Promise<NextResponse | { userId: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip || trip.userId !== session.user.id) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  return { userId: session.user.id };
}

/** Type guard for the union requireTripOwnership returns. */
export function isAuthResponse(result: NextResponse | { userId: string }): result is NextResponse {
  return result instanceof NextResponse;
}
