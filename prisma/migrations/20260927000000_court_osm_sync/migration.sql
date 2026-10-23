-- CreateEnum
CREATE TYPE "CourtSource" AS ENUM ('SPORTMATCH', 'OSM');

-- AlterTable
ALTER TABLE "Court" ADD COLUMN     "openingHours" TEXT,
ADD COLUMN     "source" "CourtSource" NOT NULL DEFAULT 'SPORTMATCH',
ADD COLUMN     "syncedAt" TIMESTAMP(3),
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "CourtSyncCell" (
    "id" TEXT NOT NULL,
    "sports" TEXT NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourtSyncCell_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Court_lat_lng_idx" ON "Court"("lat", "lng");
