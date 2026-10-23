import "server-only";

import { distanceKm, type LatLng } from "@/lib/geo";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { Court, FavoriteCourt } from "@/lib/types";

const courtSelect = {
  id: true,
  name: true,
  area: true,
  address: true,
  pricePerHour: true,
  phone: true,
  isOpen: true,
  lat: true,
  lng: true,
  source: true,
  website: true,
  openingHours: true,
  sports: { select: { sportId: true } },
} as const;

type CourtRow = Prisma.CourtGetPayload<{ select: typeof courtSelect }>;

function toDomainCourt(row: CourtRow): Court {
  return {
    id: row.id,
    name: row.name,
    area: row.area,
    address: row.address,
    sportIds: row.sports.map((entry) => entry.sportId),
    pricePerHour: row.pricePerHour,
    phone: row.phone,
    isOpen: row.isOpen,
    lat: row.lat,
    lng: row.lng,
    source: row.source === "OSM" ? "osm" : "sportmatch",
    website: row.website,
    openingHours: row.openingHours,
  };
}

export async function getCourts(): Promise<Court[]> {
  const rows = await prisma.court.findMany({
    select: courtSelect,
    orderBy: { name: "asc" },
  });
  return rows.map(toDomainCourt);
}

export async function getCourtById(id: string): Promise<Court | null> {
  const row = await prisma.court.findUnique({
    where: { id },
    select: courtSelect,
  });
  return row ? toDomainCourt(row) : null;
}

/** Sân của các môn cho trước, trong bán kính `radiusKm` quanh `center`. */
export async function getCourtsNear(
  center: LatLng,
  radiusKm: number,
  sportIds: string[],
): Promise<Court[]> {
  // Lọc thô bằng khung toạ độ (dùng index lat/lng), rồi lọc chính xác theo khoảng cách.
  const dLat = radiusKm / 111;
  const dLng = radiusKm / (111 * Math.cos((center.lat * Math.PI) / 180));

  const rows = await prisma.court.findMany({
    where: {
      lat: { gte: center.lat - dLat, lte: center.lat + dLat },
      lng: { gte: center.lng - dLng, lte: center.lng + dLng },
      sports: { some: { sportId: { in: sportIds } } },
    },
    select: courtSelect,
  });

  return rows
    .map(toDomainCourt)
    .filter((court) => distanceKm(center, court) <= radiusKm);
}

/**
 * Tìm sân có môn `sportId` theo tên / khu vực / địa chỉ — dùng cho ô chọn
 * "Sân yêu thích". Không phân biệt hoa thường và dấu tiếng Việt (extension
 * `unaccent`). Chuỗi rỗng trả về các sân đầu danh sách.
 */
export async function searchCourts(
  sportId: string,
  query: string,
  limit = 8,
): Promise<FavoriteCourt[]> {
  const term = query.trim().slice(0, 80);
  if (!term) {
    return prisma.court.findMany({
      where: { sports: { some: { sportId } } },
      select: { id: true, name: true, area: true },
      orderBy: { name: "asc" },
      take: limit,
    });
  }

  // Escape ký tự đặc biệt của LIKE để chuỗi người dùng nhập được so khớp nguyên văn.
  const pattern = "%" + term.replace(/[\\%_]/g, (char) => `\\${char}`) + "%";
  return prisma.$queryRaw<FavoriteCourt[]>`
    SELECT c."id", c."name", c."area"
    FROM "Court" c
    WHERE EXISTS (
        SELECT 1 FROM "CourtSport" cs
        WHERE cs."courtId" = c."id" AND cs."sportId" = ${sportId}
      )
      AND (
        unaccent(c."name") ILIKE unaccent(${pattern})
        OR unaccent(c."area") ILIKE unaccent(${pattern})
        OR unaccent(c."address") ILIKE unaccent(${pattern})
      )
    ORDER BY c."name" ASC
    LIMIT ${limit}`;
}
