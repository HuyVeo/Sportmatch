import "server-only";

import type { LatLng } from "@/lib/geo";
import { prisma } from "@/lib/prisma";
import { fetchOsmCourts, type BBox, type OsmCourt } from "@/lib/osm/overpass";

/**
 * Đồng bộ sân từ OpenStreetMap vào bảng Court theo ô lưới 0.1° (~11 km).
 * Ô đã đồng bộ được ghi vào CourtSyncCell → mở trang lần sau chỉ đọc DB,
 * không gọi Overpass nữa, trừ khi ô quá hạn hoặc danh sách môn thay đổi.
 */

const CELL_SIZE = 0.1;
const SYNC_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 ngày

type Cell = { id: string; box: BBox };

function cellAt(latIndex: number, lngIndex: number): Cell {
  return {
    id: `${latIndex},${lngIndex}`,
    box: {
      south: latIndex * CELL_SIZE,
      west: lngIndex * CELL_SIZE,
      north: (latIndex + 1) * CELL_SIZE,
      east: (lngIndex + 1) * CELL_SIZE,
    },
  };
}

/** Các ô lưới phủ kín hình tròn bán kính `radiusKm` quanh `center`. */
function cellsAround(center: LatLng, radiusKm: number): Cell[] {
  const dLat = radiusKm / 111;
  const dLng = radiusKm / (111 * Math.cos((center.lat * Math.PI) / 180));
  const cells: Cell[] = [];
  for (
    let lat = Math.floor((center.lat - dLat) / CELL_SIZE);
    lat <= Math.floor((center.lat + dLat) / CELL_SIZE);
    lat++
  ) {
    for (
      let lng = Math.floor((center.lng - dLng) / CELL_SIZE);
      lng <= Math.floor((center.lng + dLng) / CELL_SIZE);
      lng++
    ) {
      cells.push(cellAt(lat, lng));
    }
  }
  return cells;
}

function insideAny(court: OsmCourt, boxes: BBox[]) {
  return boxes.some(
    (box) =>
      court.lat >= box.south &&
      court.lat < box.north &&
      court.lng >= box.west &&
      court.lng < box.east,
  );
}

async function saveCourts(
  courts: (OsmCourt & { name: string })[],
): Promise<void> {
  if (courts.length === 0) return;

  const rows = courts.map((court) => ({
    id: court.id,
    name: court.name,
    area: court.area,
    address: court.address,
    phone: court.phone ?? "",
    lat: court.lat,
    lng: court.lng,
    website: court.website,
    openingHours: court.openingHours,
  }));

  // Upsert cả lô trong 1 câu SQL — DB ở xa nên tránh 1 query / sân.
  // Chỉ ghi đè sân nguồn OSM, không bao giờ đụng sân SportMatch tự quản lý.
  await prisma.$executeRaw`
    INSERT INTO "Court" ("id", "name", "area", "address", "phone", "lat", "lng",
                         "source", "website", "openingHours", "syncedAt")
    SELECT x."id", x."name", x."area", x."address", x."phone", x."lat", x."lng",
           'OSM'::"CourtSource", x."website", x."openingHours", NOW()
    FROM jsonb_to_recordset(${JSON.stringify(rows)}::jsonb) AS x(
      "id" text, "name" text, "area" text, "address" text, "phone" text,
      "lat" double precision, "lng" double precision,
      "website" text, "openingHours" text
    )
    ON CONFLICT ("id") DO UPDATE SET
      "name" = EXCLUDED."name",
      "area" = EXCLUDED."area",
      "address" = EXCLUDED."address",
      "phone" = EXCLUDED."phone",
      "lat" = EXCLUDED."lat",
      "lng" = EXCLUDED."lng",
      "website" = EXCLUDED."website",
      "openingHours" = EXCLUDED."openingHours",
      "syncedAt" = EXCLUDED."syncedAt"
    WHERE "Court"."source" = 'OSM'::"CourtSource"
  `;

  await prisma.courtSport.createMany({
    data: courts.flatMap((court) =>
      court.sportIds.map((sportId) => ({ courtId: court.id, sportId })),
    ),
    skipDuplicates: true,
  });
}

// Nhiều request cùng lúc (vd tìm theo hồ sơ + theo vị trí thật) có thể cùng
// cần một nhóm ô → dùng chung một lượt đồng bộ đang chạy.
const inFlight = new Map<string, Promise<void>>();

/**
 * Đảm bảo các ô quanh `center` đã có sân OSM trong DB.
 * `sports`: toàn bộ môn đang mở (đồng bộ tất cả để đổi môn không phải tải lại).
 */
export async function ensureCourtsSynced(
  center: LatLng,
  radiusKm: number,
  sports: { id: string; name: string }[],
): Promise<void> {
  const signature = sports
    .map((sport) => sport.id)
    .sort()
    .join(",");
  const cells = cellsAround(center, radiusKm);

  const synced = await prisma.courtSyncCell.findMany({
    where: { id: { in: cells.map((cell) => cell.id) } },
  });
  const fresh = new Set(
    synced
      .filter(
        (cell) =>
          cell.sports === signature &&
          Date.now() - cell.syncedAt.getTime() < SYNC_TTL_MS,
      )
      .map((cell) => cell.id),
  );
  const stale = cells.filter((cell) => !fresh.has(cell.id));
  if (stale.length === 0) return;

  const key = `${signature}|${stale.map((cell) => cell.id).join(";")}`;
  const running = inFlight.get(key);
  if (running) return running;

  const job = (async () => {
    const boxes = stale.map((cell) => cell.box);
    const sportName = new Map(sports.map((sport) => [sport.id, sport.name]));

    const courts = (await fetchOsmCourts(signature.split(","), boxes))
      // Truy vấn nhiều khung có thể trả trùng phần tử ở mép ô → gộp theo id.
      .filter(
        (court, index, all) =>
          insideAny(court, boxes) &&
          all.findIndex((other) => other.id === court.id) === index,
      )
      .map((court) => ({
        ...court,
        name:
          court.name ?? `Sân ${sportName.get(court.sportIds[0]) ?? "thể thao"}`,
      }));

    await saveCourts(courts);

    const now = new Date();
    await prisma.$transaction(
      stale.map((cell) =>
        prisma.courtSyncCell.upsert({
          where: { id: cell.id },
          create: { id: cell.id, sports: signature, syncedAt: now },
          update: { sports: signature, syncedAt: now },
        }),
      ),
    );
  })().finally(() => inFlight.delete(key));

  inFlight.set(key, job);
  return job;
}
