-- Hồ sơ thể thao cho matchmaking: mục đích chơi, khu vực thường chơi, sân yêu
-- thích theo từng môn; lịch rảnh chuyển từ "ngày" sang "ngày + khung giờ".

-- CreateEnum
CREATE TYPE "PlayPurpose" AS ENUM ('SOCIAL', 'PRACTICE', 'COMPETITIVE');

-- DropIndex
DROP INDEX "UserSport_sportId_idx";

-- AlterTable: Availability (userId, day) -> khung giờ có id riêng.
-- Dữ liệu cũ chỉ có ngày nên được giữ lại thành khung "cả ngày" 00:00–23:59;
-- người dùng thu hẹp lại trong Cài đặt.
ALTER TABLE "Availability" DROP CONSTRAINT "Availability_pkey",
ADD COLUMN     "id" TEXT,
ADD COLUMN     "startMinute" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "endMinute" INTEGER NOT NULL DEFAULT 1439;

UPDATE "Availability" SET "id" = md5(random()::text || clock_timestamp()::text || "userId" || "day"::text);

ALTER TABLE "Availability" ALTER COLUMN "id" SET NOT NULL,
ALTER COLUMN "startMinute" DROP DEFAULT,
ALTER COLUMN "endMinute" DROP DEFAULT,
ADD CONSTRAINT "Availability_pkey" PRIMARY KEY ("id"),
ADD CONSTRAINT "Availability_minutes_check" CHECK ("startMinute" >= 0 AND "endMinute" <= 1439 AND "endMinute" > "startMinute");

-- AlterTable
ALTER TABLE "UserSport" ADD COLUMN     "preferredAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "purposes" "PlayPurpose"[] DEFAULT ARRAY[]::"PlayPurpose"[];

-- CreateTable
CREATE TABLE "UserSportCourt" (
    "userId" TEXT NOT NULL,
    "sportId" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,

    CONSTRAINT "UserSportCourt_pkey" PRIMARY KEY ("userId","sportId","courtId")
);

-- CreateIndex
CREATE INDEX "UserSportCourt_courtId_idx" ON "UserSportCourt"("courtId");

-- CreateIndex
CREATE INDEX "Availability_day_startMinute_endMinute_idx" ON "Availability"("day", "startMinute", "endMinute");

-- CreateIndex
CREATE UNIQUE INDEX "Availability_userId_day_startMinute_endMinute_key" ON "Availability"("userId", "day", "startMinute", "endMinute");

-- CreateIndex
CREATE INDEX "UserSport_sportId_skillLevel_idx" ON "UserSport"("sportId", "skillLevel");

-- CreateIndex
CREATE INDEX "UserSport_purposes_idx" ON "UserSport" USING GIN ("purposes");

-- CreateIndex
CREATE INDEX "UserSport_preferredAreas_idx" ON "UserSport" USING GIN ("preferredAreas");

-- AddForeignKey
ALTER TABLE "UserSportCourt" ADD CONSTRAINT "UserSportCourt_userId_sportId_fkey" FOREIGN KEY ("userId", "sportId") REFERENCES "UserSport"("userId", "sportId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSportCourt" ADD CONSTRAINT "UserSportCourt_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;
