import "server-only";

import type { LatLng } from "@/lib/geo";

/**
 * Đổi toạ độ ↔ tên khu vực qua Photon (komoot) — dữ liệu OpenStreetMap, miễn
 * phí, không cần key. Không dùng nominatim.openstreetmap.org vì một số nhà mạng
 * ở Việt Nam chặn kết nối tới đó. App chỉ gọi khi người dùng bấm "Lấy vị trí"
 * hoặc lưu khu vực mới, nên lượng request rất nhỏ.
 */
const PHOTON_URL = "https://photon.komoot.io";
const HEADERS = { "User-Agent": "SportMatch/0.1 (sportmatch.vn)" };
const TIMEOUT_MS = 6000;
// Giới hạn kết quả tìm kiếm trong lãnh thổ Việt Nam (tây, nam, đông, bắc).
const VIETNAM_BBOX = "102,8,110,24";

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: Partial<
    Record<"name" | "district" | "locality" | "county" | "city" | "state", string>
  >;
};

async function fetchFeatures(url: string): Promise<PhotonFeature[]> {
  try {
    const response = await fetch(url, {
      headers: HEADERS,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) return [];
    const body = (await response.json()) as { features?: PhotonFeature[] };
    return body.features ?? [];
  } catch {
    return [];
  }
}

/** "Tây Hồ, Hà Nội" từ toạ độ; `null` nếu không xác định được. */
export async function reverseGeocode({ lat, lng }: LatLng): Promise<string | null> {
  const [feature] = await fetchFeatures(
    `${PHOTON_URL}/reverse?lang=default&lat=${lat}&lon=${lng}`,
  );
  const place = feature?.properties;
  if (!place) return null;

  const local = place.district ?? place.locality ?? place.county;
  const city = place.city ?? place.state;
  const parts = [local, city].filter(
    (part, index, all): part is string => !!part && all.indexOf(part) === index,
  );
  return parts.length ? parts.join(", ") : null;
}

/**
 * Toạ độ cố định cho các khu vực gợi ý sẵn ở onboarding — vài quận cũ (như
 * Quận 1) đã bị sáp nhập nên dữ liệu OSM không còn đơn vị đó.
 */
const KNOWN_AREAS: Record<string, LatLng> = {
  "cau giay, ha noi": { lat: 21.0287, lng: 105.7866 },
  "dong da, ha noi": { lat: 21.0107, lng: 105.8182 },
  "tay ho, ha noi": { lat: 21.0628, lng: 105.8185 },
  "hoan kiem, ha noi": { lat: 21.0285, lng: 105.8542 },
  "quan 1, tp.hcm": { lat: 10.7756, lng: 106.7019 },
  "hai chau, da nang": { lat: 16.059, lng: 108.2195 },
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Kết quả chỉ được nhận khi tên địa điểm khớp phần đầu khu vực người dùng nhập. */
function matchesQuery(feature: PhotonFeature, query: string): boolean {
  const head = normalize(query.split(",")[0] ?? "");
  if (!head) return false;
  const { name, district, locality, county, city } = feature.properties;
  return [name, district, locality, county, city].some((value) => {
    const candidate = value ? normalize(value) : "";
    return !!candidate && (candidate.includes(head) || head.includes(candidate));
  });
}

/** Toạ độ trung tâm của một khu vực nhập tay; `null` nếu không tìm thấy. */
export async function geocodeArea(area: string): Promise<LatLng | null> {
  const trimmed = area.trim();
  if (!trimmed) return null;
  const known = KNOWN_AREAS[normalize(trimmed)];
  if (known) return known;

  const base = `${PHOTON_URL}/api/?limit=1&lang=default&bbox=${VIETNAM_BBOX}&q=${encodeURIComponent(trimmed)}`;
  // Ưu tiên khớp đơn vị hành chính (quận, phường, thành phố); không có thì lấy
  // địa điểm bất kỳ trùng tên.
  let [feature] = await fetchFeatures(
    `${base}&layer=district&layer=city&layer=locality&layer=county`,
  );
  if (!feature || !matchesQuery(feature, trimmed)) {
    [feature] = await fetchFeatures(base);
  }
  if (!feature || !matchesQuery(feature, trimmed)) return null;

  const [lng, lat] = feature.geometry.coordinates;
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}
