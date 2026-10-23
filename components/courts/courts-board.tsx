"use client";

import {
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  Globe,
  LayoutGrid,
  Loader2,
  Locate,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Search,
  X,
} from "lucide-react";
import {
  searchCourtsAction,
  type CourtResult,
} from "@/app/(app)/courts/actions";
import { formatPrice } from "@/lib/format";
import { distanceKm, roundKm, type LatLng } from "@/lib/geo";
import { cn } from "@/lib/utils";

// Leaflet cần `window` → chỉ render phía trình duyệt.
const CourtsMap = dynamic(() => import("@/components/courts/courts-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-secondary/40 text-sm text-muted-foreground">
      Đang tải bản đồ...
    </div>
  ),
});

type SportOption = { id: string; name: string; icon: string };

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15_000,
  maximumAge: 60_000,
};

/** Mở chỉ đường trên Google Maps web (không cần API key), xuất phát từ vị trí hiện tại. */
function directionsUrl(court: LatLng) {
  const params = new URLSearchParams({
    api: "1",
    destination: `${court.lat},${court.lng}`,
  });
  return `https://www.google.com/maps/dir/?${params}`;
}

function googleMapsUrl(court: LatLng) {
  const params = new URLSearchParams({
    api: "1",
    query: `${court.lat},${court.lng}`,
  });
  return `https://www.google.com/maps/search/?${params}`;
}

function formatDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${roundKm(km)} km`;
}

export function CourtsBoard({
  sports,
  origin,
  defaultSportId,
}: {
  sports: SportOption[];
  /** Vị trí trong hồ sơ — dùng tới khi định vị được vị trí thật. */
  origin: LatLng;
  /** Môn lọc sẵn khi mở trang (môn đầu tiên trong hồ sơ, hoặc "all"). */
  defaultSportId: string;
}) {
  const [sportId, setSportId] = useState(defaultSportId);
  const [courts, setCourts] = useState<CourtResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [searching, startSearch] = useTransition();
  // Lượt tìm vùng hồ sơ và lượt tìm vị trí thật có thể chạy chồng nhau →
  // chỉ nhận kết quả của lượt mới nhất.
  const latestSearch = useRef(0);

  const [me, setMe] = useState<LatLng | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const [searchCenter, setSearchCenter] = useState(origin);
  const [mapCenter, setMapCenter] = useState(origin);
  const [focus, setFocus] = useState<(LatLng & { key: number }) | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const reference = me ?? origin;
  const sportMap = useMemo(
    () => new Map(sports.map((sport) => [sport.id, sport])),
    [sports],
  );

  const sorted = useMemo(
    () =>
      courts
        .map((court) => ({ court, distance: distanceKm(reference, court) }))
        .sort((a, b) => a.distance - b.distance),
    [courts, reference],
  );

  const selected = courts.find((court) => court.id === selectedId) ?? null;

  // Hiện nút "Tìm ở khu vực này" khi kéo bản đồ xa khỏi điểm tìm gần nhất.
  const movedAway = distanceKm(mapCenter, searchCenter) > 1.5;

  function iconFor(court: CourtResult) {
    return sportMap.get(court.sportIds[0])?.icon ?? "🏅";
  }

  function runSearch(nextSportId: string, center: LatLng) {
    setSearchCenter(center);
    const requestId = ++latestSearch.current;
    startSearch(async () => {
      applyResult(requestId, await searchCourtsAction(nextSportId, center));
    });
  }

  function applyResult(
    requestId: number,
    result: Awaited<ReturnType<typeof searchCourtsAction>>,
  ) {
    if (requestId !== latestSearch.current) return;
    setCourts(result.courts);
    setError(result.error);
    setSelectedId(null);
    setLoaded(true);
  }

  // Mở trang: tìm ngay quanh khu vực trong hồ sơ (song song với việc định vị).
  const onInitialResult = useEffectEvent(applyResult);
  useEffect(() => {
    const requestId = ++latestSearch.current;
    searchCourtsAction(defaultSportId, { lat: origin.lat, lng: origin.lng })
      .then((result) => onInitialResult(requestId, result))
      .catch(() =>
        onInitialResult(requestId, {
          courts: [],
          error: "Không tải được danh sách sân, thử lại sau.",
        }),
      );
  }, [defaultSportId, origin.lat, origin.lng]);

  function changeSport(nextSportId: string) {
    setSportId(nextSportId);
    runSearch(nextSportId, searchCenter);
  }

  function applyPosition(result: GeolocationPosition) {
    const position = {
      lat: result.coords.latitude,
      lng: result.coords.longitude,
    };
    setMe(position);
    setFocus({ ...position, key: Date.now() });
    setLocating(false);
    runSearch(sportId, position);
  }

  // Mở trang là tự định vị luôn. Nếu người dùng từ chối thì im lặng giữ khu
  // vực trong hồ sơ — họ vẫn có thể bấm "Vị trí của tôi" để thử lại.
  const onAutoLocated = useEffectEvent(applyPosition);
  useEffect(() => {
    if (!navigator.geolocation) return;
    let active = true;
    navigator.geolocation.getCurrentPosition(
      (result) => {
        if (active) onAutoLocated(result);
      },
      () => {},
      GEO_OPTIONS,
    );
    return () => {
      active = false;
    };
  }, []);

  function locateMe() {
    if (!navigator.geolocation) {
      setLocateError("Trình duyệt không hỗ trợ định vị.");
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      applyPosition,
      (failure) => {
        setLocating(false);
        setLocateError(
          failure.code === failure.PERMISSION_DENIED
            ? "Bạn đã chặn quyền vị trí. Hãy cho phép trong cài đặt trình duyệt rồi thử lại."
            : "Không lấy được vị trí hiện tại, thử lại sau.",
        );
      },
      GEO_OPTIONS,
    );
  }

  function selectCourt(id: string) {
    setSelectedId(id);
    const court = courts.find((item) => item.id === id);
    if (court) setFocus({ lat: court.lat, lng: court.lng, key: Date.now() });
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Sân thể thao
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {loaded ? `${courts.length} sân` : "Đang tìm sân"} · Gọi điện hoặc
            nhắn tin để đặt sân
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {me
              ? "Đang sắp xếp sân theo vị trí hiện tại."
              : "Đang sắp xếp sân theo khu vực trong hồ sơ."}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={locateMe}
            disabled={locating}
            className="border-brand text-brand hover:bg-brand/10 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {locating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Locate className="size-4" />
            )}
            {locating ? "Đang định vị..." : "Vị trí của tôi"}
          </button>
          {locateError ? (
            <p role="alert" className="text-destructive max-w-72 text-right text-xs">
              {locateError}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <SportChip active={sportId === "all"} onClick={() => changeSport("all")}>
          <LayoutGrid className="size-4" />
          Tất cả
        </SportChip>
        {sports.map((sport) => (
          <SportChip
            key={sport.id}
            active={sportId === sport.id}
            onClick={() => changeSport(sport.id)}
          >
            <span>{sport.icon}</span>
            {sport.name}
          </SportChip>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="relative h-[400px] overflow-hidden rounded-2xl border border-border lg:h-[760px]">
          {/* isolate: gom z-index nội bộ của Leaflet (tới 1000) để nút nổi bên dưới vẫn nằm trên. */}
          <div className="absolute inset-0 isolate">
            <CourtsMap
              courts={courts}
              selectedId={selectedId}
              me={me}
              initialCenter={origin}
              focus={focus}
              onSelect={selectCourt}
              onCenterChange={setMapCenter}
            />
          </div>

          {movedAway || searching ? (
            <button
              type="button"
              disabled={searching}
              onClick={() => runSearch(sportId, mapCenter)}
              className="bg-card/95 absolute top-4 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold shadow-lg backdrop-blur"
            >
              {searching ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              {searching ? "Đang tìm sân..." : "Tìm ở khu vực này"}
            </button>
          ) : null}

          {selected ? (
            <MapCourtCard
              court={selected}
              icon={iconFor(selected)}
              distance={distanceKm(reference, selected)}
              onClose={() => setSelectedId(null)}
            />
          ) : null}
        </div>

        <div className="space-y-4 lg:max-h-[760px] lg:overflow-y-auto lg:pr-1">
          {error ? (
            <p role="alert" className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
              {error}
            </p>
          ) : null}

          {selected ? (
            <CourtPanel
              court={selected}
              distance={distanceKm(reference, selected)}
              sportLabels={selected.sportIds
                .map((id) => sportMap.get(id))
                .filter((sport): sport is SportOption => Boolean(sport))}
              onBack={() => setSelectedId(null)}
            />
          ) : !loaded ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-6 py-12 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Đang tìm sân quanh bạn...
            </div>
          ) : sorted.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center">
              <p className="font-heading font-bold">Chưa có sân nào</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Thử chọn môn thể thao khác hoặc tìm ở khu vực khác.
              </p>
            </div>
          ) : (
            sorted.map(({ court, distance }) => (
              <button
                key={court.id}
                type="button"
                onClick={() => selectCourt(court.id)}
                className="hover:border-brand/50 flex w-full gap-4 rounded-2xl border border-border bg-card p-4 text-left transition-colors"
              >
                <span className="bg-secondary flex size-11 shrink-0 items-center justify-center rounded-full text-lg">
                  {iconFor(court)}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="font-heading block leading-snug font-bold">
                    {court.name}
                  </span>
                  {court.address ? (
                    <span className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0" />
                      <span className="truncate">{court.address}</span>
                    </span>
                  ) : null}

                  <span className="mt-3 flex flex-wrap gap-2">
                    <OpenBadge isOpen={court.isOpen} />
                    <span className="bg-brand/10 text-brand rounded-full px-3 py-1 text-xs font-semibold">
                      {formatDistance(distance)}
                    </span>
                    {court.pricePerHour ? (
                      <span className="bg-secondary rounded-full px-3 py-1 text-xs font-medium">
                        {formatPrice(court.pricePerHour)}
                      </span>
                    ) : null}
                  </span>
                </span>
              </button>
            ))
          )}

          <p className="px-1 text-xs text-muted-foreground">
            Dữ liệu sân từ SportMatch và © OpenStreetMap contributors.
          </p>
        </div>
      </div>
    </div>
  );
}

function SportChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
        active
          ? "bg-brand-gradient text-white"
          : "border border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function OpenBadge({ isOpen }: { isOpen: boolean | null }) {
  if (isOpen === null) return null;
  return isOpen ? (
    <span className="bg-success-muted text-success rounded-full px-3 py-1 text-xs font-semibold">
      Mở cửa
    </span>
  ) : (
    <span className="bg-secondary rounded-full px-3 py-1 text-xs font-semibold text-muted-foreground">
      Đã đóng cửa
    </span>
  );
}

/** Thẻ nổi trên bản đồ khi chọn một sân. */
function MapCourtCard({
  court,
  icon,
  distance,
  onClose,
}: {
  court: CourtResult;
  icon: string;
  distance: number;
  onClose: () => void;
}) {
  return (
    <div className="bg-card/95 absolute right-4 bottom-4 left-4 z-10 flex gap-3 rounded-2xl border border-border p-3 shadow-xl backdrop-blur sm:right-auto sm:w-[360px]">
      <span className="bg-secondary flex size-12 shrink-0 items-center justify-center rounded-full text-xl">
        {icon}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="font-heading line-clamp-2 flex-1 leading-snug font-bold">
            {court.name}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="-mt-1 -mr-1 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {court.address ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {court.address}
          </p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-brand text-xs font-semibold">
            {formatDistance(distance)}
          </span>
          <OpenBadge isOpen={court.isOpen} />
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <a
            href={directionsUrl(court)}
            target="_blank"
            rel="noreferrer"
            className="bg-brand-gradient inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Navigation className="size-3.5" />
            Chỉ đường
          </a>
          {court.phone ? (
            <a
              href={`tel:${court.phone.replace(/\s/g, "")}`}
              className="bg-brand/10 text-brand hover:bg-brand/20 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors"
            >
              <Phone className="size-3.5" />
              Gọi
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CourtPanel({
  court,
  distance,
  sportLabels,
  onBack,
}: {
  court: CourtResult;
  distance: number;
  sportLabels: SportOption[];
  onBack: () => void;
}) {
  const phone = court.phone?.replace(/\s/g, "") ?? null;

  return (
    <article className="space-y-4 rounded-2xl border border-border bg-card p-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Danh sách sân
      </button>

      <div>
        <h2 className="font-heading text-xl leading-snug font-extrabold">
          {court.name}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <OpenBadge isOpen={court.isOpen} />
          {court.pricePerHour ? (
            <span className="bg-secondary rounded-full px-3 py-1 text-xs font-medium">
              {formatPrice(court.pricePerHour)}
            </span>
          ) : null}
        </div>
      </div>

      <p className="flex gap-2 text-sm text-muted-foreground">
        <MapPin className="mt-0.5 size-4 shrink-0" />
        <span>
          {court.address || "Chưa có địa chỉ chi tiết"}
          <span className="text-brand font-semibold">
            {" · "}
            {formatDistance(distance)}
          </span>
        </span>
      </p>

      {sportLabels.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {sportLabels.map((sport) => (
            <span
              key={sport.id}
              className="bg-secondary flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
            >
              <span>{sport.icon}</span>
              {sport.name}
            </span>
          ))}
        </div>
      ) : null}

      <a
        href={directionsUrl(court)}
        target="_blank"
        rel="noreferrer"
        className="bg-brand-gradient shadow-brand/30 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
      >
        <Navigation className="size-4" />
        Chỉ đường
      </a>

      <div className="grid grid-cols-2 gap-2">
        <a
          href={phone ? `tel:${phone}` : undefined}
          aria-disabled={!phone}
          className={cn(
            "bg-brand/10 text-brand flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-colors",
            phone ? "hover:bg-brand/20" : "pointer-events-none opacity-50",
          )}
        >
          <Phone className="size-4" />
          Gọi
        </a>
        <a
          href={phone ? `sms:${phone}` : undefined}
          aria-disabled={!phone}
          className={cn(
            "flex items-center justify-center gap-2 rounded-full bg-chart-4/10 py-2.5 text-sm font-semibold text-chart-4 transition-colors",
            phone ? "hover:bg-chart-4/20" : "pointer-events-none opacity-50",
          )}
        >
          <MessageCircle className="size-4" />
          Nhắn tin
        </a>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {court.phone ?? "Sân chưa có số điện thoại."}
      </p>

      {court.openingHours ? (
        <div className="rounded-xl bg-secondary/40 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="text-brand size-4" />
            Giờ mở cửa
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {court.openingHours}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <a
          href={googleMapsUrl(court)}
          target="_blank"
          rel="noreferrer"
          className="text-brand inline-flex items-center gap-1.5 font-semibold hover:underline"
        >
          <ExternalLink className="size-4" />
          Xem trên Google Maps
        </a>
        {court.website ? (
          <a
            href={court.website}
            target="_blank"
            rel="noreferrer"
            className="text-brand inline-flex items-center gap-1.5 font-semibold hover:underline"
          >
            <Globe className="size-4" />
            Website
          </a>
        ) : null}
      </div>
    </article>
  );
}
