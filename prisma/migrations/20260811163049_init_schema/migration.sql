-- CreateEnum
CREATE TYPE "TravelMode" AS ENUM ('PLANE', 'BOAT', 'CAR', 'TRAIN', 'BUS', 'OTHER');

-- CreateEnum
CREATE TYPE "LocalTravelMode" AS ENUM ('WALK', 'TAXI', 'TRANSIT', 'RIDESHARE', 'OTHER');

-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('ACTIVITY', 'MEAL', 'VISIT', 'REST', 'TRAVEL', 'BLANK');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- CreateEnum
CREATE TYPE "BudgetScopeKind" AS ENUM ('TRIP', 'DAY', 'BLOCK');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "destinationName" TEXT NOT NULL,
    "destinationLat" DOUBLE PRECISION,
    "destinationLng" DOUBLE PRECISION,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "departureTime" TEXT,
    "arrivalDate" TIMESTAMP(3) NOT NULL,
    "arrivalTime" TEXT,
    "returnDate" TIMESTAMP(3) NOT NULL,
    "returnTime" TEXT,
    "totalBudget" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelSegment" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "mode" "TravelMode" NOT NULL,
    "providerName" TEXT,
    "fromPlaceName" TEXT,
    "fromPlaceLat" DOUBLE PRECISION,
    "fromPlaceLng" DOUBLE PRECISION,
    "toPlaceName" TEXT,
    "toPlaceLat" DOUBLE PRECISION,
    "toPlaceLng" DOUBLE PRECISION,
    "departureDate" TIMESTAMP(3),
    "departureTime" TEXT,
    "arrivalDate" TIMESTAMP(3),
    "arrivalTime" TEXT,
    "isLayover" BOOLEAN NOT NULL DEFAULT false,
    "cost" DECIMAL(12,2),
    "flightInsurance" BOOLEAN,
    "mealsIncluded" TEXT,
    "luggageCount" INTEGER,
    "luggageWeightKg" DOUBLE PRECISION,

    CONSTRAINT "TravelSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Accommodation" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "placeName" TEXT NOT NULL,
    "placeLat" DOUBLE PRECISION,
    "placeLng" DOUBLE PRECISION,
    "name" TEXT NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkInTime" TEXT,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "checkOutTime" TEXT,
    "willTransferLater" BOOLEAN NOT NULL DEFAULT false,
    "cost" DECIMAL(12,2),
    "notes" TEXT,

    CONSTRAINT "Accommodation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvanceBooking" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "cost" DECIMAL(12,2),

    CONSTRAINT "AdvanceBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItineraryDay" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ItineraryDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItineraryBlock" (
    "id" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "type" "BlockType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledTime" TEXT,
    "plannedExpense" DECIMAL(12,2),
    "locationName" TEXT,
    "locationLat" DOUBLE PRECISION,
    "locationLng" DOUBLE PRECISION,
    "mealType" "MealType",
    "travelMode" "LocalTravelMode",
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ItineraryBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetAllocation" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "scopeKind" "BudgetScopeKind" NOT NULL,
    "dayId" TEXT,
    "blockId" TEXT,

    CONSTRAINT "BudgetAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetAllocation_dayId_key" ON "BudgetAllocation"("dayId");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetAllocation_blockId_key" ON "BudgetAllocation"("blockId");

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelSegment" ADD CONSTRAINT "TravelSegment_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accommodation" ADD CONSTRAINT "Accommodation_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvanceBooking" ADD CONSTRAINT "AdvanceBooking_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItineraryDay" ADD CONSTRAINT "ItineraryDay_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItineraryBlock" ADD CONSTRAINT "ItineraryBlock_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "ItineraryDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetAllocation" ADD CONSTRAINT "BudgetAllocation_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetAllocation" ADD CONSTRAINT "BudgetAllocation_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "ItineraryDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetAllocation" ADD CONSTRAINT "BudgetAllocation_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "ItineraryBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;
