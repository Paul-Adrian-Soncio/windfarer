import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createTripSchema } from "@/lib/validation/trip";

// Hardcoded until auth exists — every trip created through this route
// belongs to this one test user. Replace with the logged-in user's id
// once auth is wired up.
const TEST_USER_ID = "278ffb3b-fce1-4a17-91d0-ebaee99c81e5";

// GET /api/trips
// Lists every trip in the database. No filtering by user yet — that comes
// once auth exists and we know *whose* trips to return.
export async function GET() {
  const trips = await prisma.trip.findMany();
  return NextResponse.json(trips);
}

// POST /api/trips
// Creates a new trip. Expects a JSON body matching createTripSchema.
export async function POST(request: NextRequest) {
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
      userId: TEST_USER_ID,
    },
  });

  return NextResponse.json(trip, { status: 201 });
}
