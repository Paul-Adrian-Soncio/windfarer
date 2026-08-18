import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTripSchema } from "@/lib/validation/trip";

// GET /api/trips
// Lists the signed-in user's own trips only.
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const trips = await prisma.trip.findMany({ where: { userId: session.user.id } });
  return NextResponse.json(trips);
}

// POST /api/trips
// Creates a new trip owned by the signed-in user. Expects a JSON body
// matching createTripSchema.
export async function POST(request: NextRequest) {
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

  const result = createTripSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: z.treeifyError(result.error) },
      { status: 400 }
    );
  }

  const trip = await prisma.trip.create({
    data: {
      ...result.data,
      userId: session.user.id,
    },
  });

  return NextResponse.json(trip, { status: 201 });
}
