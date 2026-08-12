import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/trips
// Lists every trip in the database. No filtering by user yet — that comes
// once auth exists and we know *whose* trips to return.
export async function GET() {
  const trips = await prisma.trip.findMany();
  return NextResponse.json(trips);
}
