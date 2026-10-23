"use server";

import { requireUserId } from "@/lib/auth/session";
import { ensureCourtsSynced } from "@/lib/data/court-sync";
import { getCourtsNear } from "@/lib/data/courts";
import { getSports } from "@/lib/data/sports";
import type { LatLng } from "@/lib/geo";
import { OverpassError } from "@/lib/osm/overpass";

const SEARCH_RADIUS_KM = 10;

export type CourtResult = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  sportIds: string[];
  phone: string | null;
  website: string | null;
  /** Giờ mở cửa dạng chuỗi OSM (vd "Mo-Su 05:00-22:00"). */
  openingHours: string | null;
  /** Chỉ sân SportMatch tự quản lý mới có giá và trạng thái mở cửa. */
  pricePerHour: number | null;
  isOpen: boolean | null;
  source: "sportmatch" | "osm";
};

function isValidLatLng(value: LatLng) {
  return (
    Number.isFinite(value.lat) &&
    Number.isFinite(value.lng) &&
    Math.abs(value.lat) <= 90 &&
    Math.abs(value.lng) <= 180
  );
}

/**
 * Sân quanh một vị trí, đọc từ DB. Khu vực chưa từng tải (hoặc quá hạn) sẽ
 * được đồng bộ từ OpenStreetMap trước — chỉ lần đầu mới chậm. Lỗi OSM không
 * làm mất sân đã có trong DB, chỉ trả kèm thông báo.
 */
export async function searchCourtsAction(
  sportId: string,
  center: LatLng,
): Promise<{ courts: CourtResult[]; error: string | null }> {
  await requireUserId();

  if (!isValidLatLng(center)) {
    return { courts: [], error: "Vị trí không hợp lệ." };
  }

  const sports = await getSports();
  const targetIds =
    sportId === "all"
      ? sports.map((sport) => sport.id)
      : sports.filter((sport) => sport.id === sportId).map((sport) => sport.id);

  let error: string | null = null;
  try {
    await ensureCourtsSynced(center, SEARCH_RADIUS_KM, sports);
  } catch (cause) {
    if (!(cause instanceof OverpassError)) console.error(cause);
    error =
      cause instanceof OverpassError
        ? cause.message
        : "Không tải được sân từ OpenStreetMap, thử lại sau.";
  }

  const courts = await getCourtsNear(center, SEARCH_RADIUS_KM, targetIds);
  const targets = new Set(targetIds);

  return {
    error,
    courts: courts.map((court) => {
      const own = court.source === "sportmatch";
      return {
        id: court.id,
        name: court.name,
        // Địa chỉ OSM thường đã chứa quận → không lặp lại khu vực.
        address:
          court.area && !court.address.includes(court.area)
            ? [court.address, court.area].filter(Boolean).join(", ")
            : court.address,
        lat: court.lat,
        lng: court.lng,
        sportIds: court.sportIds.filter((id) => targets.has(id)),
        phone: court.phone || null,
        website: court.website,
        openingHours: court.openingHours,
        pricePerHour: own ? court.pricePerHour || null : null,
        isOpen: own ? court.isOpen : null,
        source: court.source,
      };
    }),
  };
}
