-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('SCHEDULED', 'ONGOING', 'COMPLETE', 'CANCELLED');

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "status" "TripStatus" NOT NULL DEFAULT 'SCHEDULED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activeTripId" TEXT;
