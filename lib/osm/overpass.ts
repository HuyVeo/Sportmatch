import "server-only";

/**
 * Tìm sân thật trên OpenStreetMap qua Overpass API — miễn phí, không cần key.
 *
 * Mỗi môn ứng với một giá trị tag `sport=*` của OSM. Môn nào không có trong
 * OSM_SPORT_TAGS thì dùng luôn id của môn làm giá trị tag (đa số môn trong OSM
 * đặt tên tiếng Anh viết thường: tennis, volleyball, table_tennis...), nên thêm
 * môn mới thường không phải sửa file này.
 */
const OSM_SPORT_TAGS: Record<string, string[]> = {
  badminton: ["badminton"],
  pickleball: ["pickleball"],
  football: ["soccer"],
  bowling: ["10pin"],
};

// Server chính hay báo quá tải giờ cao điểm → thử lần lượt từng server.
const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

export type OsmCourt = {
  id: string;
  name: string | null;
  address: string;
  /** Quận/huyện hoặc thành phố, nếu OSM có. */
  area: string;
  lat: number;
  lng: number;
  sportIds: string[];
  phone: string | null;
  website: string | null;
  openingHours: string | null;
};

export class OverpassError extends Error {}

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

/** Khung toạ độ theo thứ tự Overpass: nam, tây, bắc, đông. */
export type BBox = { south: number; west: number; north: number; east: number };

function osmTagsFor(sportId: string): string[] {
  const tags = OSM_SPORT_TAGS[sportId] ?? [sportId];
  // Chỉ nhận chữ thường, chữ số + gạch dưới (vd "10pin") để không chèn được
  // gì vào câu truy vấn.
  return tags.filter((tag) => /^[a-z0-9_]+$/.test(tag));
}

function formatAddress(tags: Record<string, string>): string {
  const street = [tags["addr:housenumber"], tags["addr:street"]]
    .filter(Boolean)
    .join(" ");
  return [
    street,
    tags["addr:subdistrict"] ?? tags["addr:suburb"],
    tags["addr:district"],
    tags["addr:city"] ?? tags["addr:province"],
  ]
    .filter(Boolean)
    .join(", ");
}

/** Dữ liệu OSM do cộng đồng nhập → chỉ nhận link http(s), chặn javascript:... */
function safeWebsite(value: string | undefined): string | null {
  if (!value) return null;
  const url = /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.href
      : null;
  } catch {
    return null;
  }
}

function toCourt(
  element: OverpassElement,
  tagToSport: Map<string, string>,
): OsmCourt | null {
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  const tags = element.tags ?? {};
  if (lat === undefined || lng === undefined) return null;

  // tag sport có thể chứa nhiều môn: "badminton;tennis".
  const sportIds = [
    ...new Set(
      (tags.sport ?? "")
        .split(";")
        .map((value) => tagToSport.get(value.trim()))
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  if (sportIds.length === 0) return null;

  return {
    id: `osm-${element.type}-${element.id}`,
    name: tags["name:vi"] ?? tags.name ?? null,
    address: formatAddress(tags),
    area: tags["addr:district"] ?? tags["addr:city"] ?? tags["addr:province"] ?? "",
    lat,
    lng,
    sportIds,
    phone: tags.phone ?? tags["contact:phone"] ?? null,
    website: safeWebsite(tags.website ?? tags["contact:website"]),
    openingHours: tags.opening_hours ?? null,
  };
}

async function queryOverpass(
  query: string,
): Promise<{ elements?: OverpassElement[] }> {
  for (const url of OVERPASS_URLS) {
    try {
      const response = await fetch(url, {
        method: "POST",
        body: new URLSearchParams({ data: query }),
        headers: { "User-Agent": "SportMatch/0.1 (court finder)" },
        cache: "no-store",
        signal: AbortSignal.timeout(30_000),
      });
      // Khi quá tải, Overpass có thể trả trang lỗi HTML thay vì JSON.
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      if (response.ok && isJson) return await response.json();
      console.error(`Overpass ${response.status} từ ${url}`);
    } catch (error) {
      console.error(`Overpass lỗi từ ${url}:`, error);
    }
  }
  throw new OverpassError(
    "OpenStreetMap đang quá tải, chưa tải được sân. Thử lại sau ít phút.",
  );
}

/** Tải toàn bộ sân của các môn trong những khung toạ độ cho trước (1 lượt gọi). */
export async function fetchOsmCourts(
  sportIds: string[],
  boxes: BBox[],
): Promise<OsmCourt[]> {
  const tagToSport = new Map<string, string>();
  for (const sportId of sportIds) {
    for (const tag of osmTagsFor(sportId)) tagToSport.set(tag, sportId);
  }
  if (tagToSport.size === 0 || boxes.length === 0) return [];

  const pattern = `(^|;)(${[...tagToSport.keys()].join("|")})(;|$)`;
  const parts = boxes.map(
    (box) =>
      `nwr["sport"~"${pattern}"](${[box.south, box.west, box.north, box.east]
        .map((value) => value.toFixed(4))
        .join(",")});`,
  );
  const query = `[out:json][timeout:25];
(
${parts.join("\n")}
);
out center tags;`;

  const data = await queryOverpass(query);
  return (data.elements ?? [])
    .map((element) => toCourt(element, tagToSport))
    .filter((court): court is OsmCourt => court !== null);
}
