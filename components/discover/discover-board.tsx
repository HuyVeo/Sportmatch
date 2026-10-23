"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  ChevronDown,
  Crosshair,
  MapPin,
  MessageCircle,
  Plus,
  RotateCcw,
  Search,
  Send,
  Shield,
  SlidersHorizontal,
  Star,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { openDirectChatAction } from "@/app/(app)/chat/actions";
import { UserAvatar } from "@/components/ui/user-avatar";
import { WEEKDAYS, WEEKDAY_SHORT, type Weekday } from "@/lib/types";
import { cn } from "@/lib/utils";

export type DiscoverUser = {
  id: string;
  name: string;
  avatar: string;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  bio: string;
  area: string;
  distanceKm: number;
  isOnline: boolean;
  gender: string;
  age: number;
  trustScore: number;
  averageStars: number;
  matchCount: number;
  availability: Weekday[];
  sports: { id: string; name: string; icon: string; skillLevel: string }[];
  isMock?: boolean;
};

const SKILL_FILTERS = ["Tất cả", "Mới chơi", "Trung cấp", "Chuyên nghiệp"];

const GENDER_FILTERS = [
  { value: "Tất cả", icon: "" },
  { value: "Nam", icon: "👦" },
  { value: "Nữ", icon: "👧" },
  { value: "Khác", icon: "🧑" },
];

const SORT_OPTIONS = [
  { id: "match", label: "Phù hợp nhất" },
  { id: "distance", label: "Gần nhất" },
  { id: "rating", label: "Đánh giá cao" },
];

const FREE_INVITES_PER_DAY = 20;
const AGE_SUGGESTIONS = [
  ...Array.from({ length: 81 }, (_, age) => String(age)),
  "60+",
];

function getSportIcon(name: string, fallback = "") {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("vi")
    .trim();

  if (normalized.includes("cau long") || normalized.includes("badminton")) {
    return "🏸";
  }
  if (normalized.includes("pickleball")) return "🏓";
  if (normalized.includes("ma soi") || normalized.includes("werewolf")) {
    return "🐺";
  }
  if (
    normalized.includes("da bong") ||
    normalized.includes("bong da") ||
    normalized.includes("football") ||
    normalized.includes("soccer")
  ) {
    return "⚽";
  }
  if (normalized.includes("bong ro") || normalized.includes("basketball")) {
    return "🏀";
  }
  if (normalized.includes("tennis")) return "🎾";
  if (normalized.includes("boi loi") || normalized.includes("swimming")) {
    return "🏊";
  }
  if (normalized.includes("chay bo") || normalized.includes("running")) {
    return "🏃";
  }

  return fallback === "🏅" ? "🏅" : fallback;
}

type Invitation = {
  id: string;
  player: DiscoverUser;
  invitedAt: number;
  status: "PENDING" | "ACCEPTED";
};

const MOCK_PLAYER_DETAILS = [
  { name: "Minh Anh", avatar: "👩🏻", bio: "Thích đánh đôi sau giờ làm.", area: "Cầu Giấy", distanceKm: 2.4, gender: "Nữ", age: 24, trustScore: 96, averageStars: 4.9, matchCount: 18, sport: "Cầu lông", skillLevel: "Trung cấp", isOnline: true, availability: ["Thứ ba", "Thứ năm", "Thứ bảy"] },
  { name: "Quốc Bảo", avatar: "🧑🏻", bio: "Tìm bạn chơi vui, đều mỗi tuần.", area: "Đống Đa", distanceKm: 3.1, gender: "Nam", age: 27, trustScore: 91, averageStars: 4.8, matchCount: 12, sport: "Pickleball", skillLevel: "Mới chơi", isOnline: false, availability: ["Thứ hai", "Thứ tư", "Chủ nhật"] },
  { name: "Thảo Vy", avatar: "👩🏻‍🦰", bio: "Ưu tiên những trận vui vẻ, thân thiện.", area: "Ba Đình", distanceKm: 4.8, gender: "Nữ", age: 22, trustScore: 98, averageStars: 5, matchCount: 21, sport: "Pickleball", skillLevel: "Trung cấp", isOnline: true, availability: ["Thứ tư", "Thứ sáu", "Thứ bảy"] },
  { name: "Hoàng Nam", avatar: "👨🏻", bio: "Có vợt dự phòng, sân quen khu vực.", area: "Hai Bà Trưng", distanceKm: 6.2, gender: "Nam", age: 30, trustScore: 88, averageStars: 4.6, matchCount: 9, sport: "Cầu lông", skillLevel: "Mới chơi", isOnline: false, availability: ["Thứ hai", "Thứ năm", "Chủ nhật"] },
  { name: "Ngọc Hà", avatar: "👩🏼", bio: "Chơi cầu lông được khoảng hai năm.", area: "Thanh Xuân", distanceKm: 7.5, gender: "Nữ", age: 26, trustScore: 94, averageStars: 4.7, matchCount: 15, sport: "Cầu lông", skillLevel: "Trung cấp", isOnline: true, availability: ["Thứ ba", "Thứ sáu", "Chủ nhật"] },
  { name: "Đức Anh", avatar: "👨🏽", bio: "Mới tập pickleball, muốn tìm bạn cùng tiến.", area: "Tây Hồ", distanceKm: 9.3, gender: "Nam", age: 23, trustScore: 90, averageStars: 4.8, matchCount: 7, sport: "Pickleball", skillLevel: "Mới chơi", isOnline: true, availability: ["Thứ hai", "Thứ tư", "Thứ bảy"] },
  { name: "Phương Linh", avatar: "👩🏽", bio: "Rảnh buổi tối các ngày trong tuần.", area: "Nam Từ Liêm", distanceKm: 12.1, gender: "Nữ", age: 28, trustScore: 97, averageStars: 4.9, matchCount: 24, sport: "Cầu lông", skillLevel: "Trung cấp", isOnline: false, availability: ["Thứ ba", "Thứ năm", "Thứ sáu"] },
  { name: "Gia Huy", avatar: "🧑🏽", bio: "Chơi cả cầu lông và pickleball.", area: "Long Biên", distanceKm: 16.4, gender: "Nam", age: 25, trustScore: 93, averageStars: 4.7, matchCount: 11, sport: "Pickleball", skillLevel: "Trung cấp", isOnline: true, availability: ["Thứ tư", "Thứ sáu", "Chủ nhật"] },
] as const;

function resolveMockSports(
  sports: { id: string; name: string; icon: string }[],
) {
  const findSport = (name: string, id: string, icon: string) =>
    sports.find((sport) => sport.name.toLocaleLowerCase("vi").includes(name)) ?? {
      id,
      name: name === "cầu lông" ? "Cầu lông" : "Pickleball",
      icon,
    };

  return {
    badminton: findSport("cầu lông", "badminton", "🏸"),
    pickleball: findSport("pickleball", "pickleball", "🏓"),
  };
}

function createMockPlayers(
  sports: { id: string; name: string; icon: string }[],
): DiscoverUser[] {
  const mockSports = resolveMockSports(sports);

  return MOCK_PLAYER_DETAILS.map((player, index) => {
    const sport = player.sport === "Cầu lông" ? mockSports.badminton : mockSports.pickleball;

    return {
      id: `demo-player-${index + 1}`,
      name: player.name,
      avatar: player.avatar,
      avatarUrl: null,
      coverImageUrl: null,
      bio: player.bio,
      area: player.area,
      distanceKm: player.distanceKm,
      isOnline: player.isOnline,
      gender: player.gender,
      age: player.age,
      trustScore: player.trustScore,
      averageStars: player.averageStars,
      matchCount: player.matchCount,
      availability: [...player.availability] as Weekday[],
      sports: [{ ...sport, skillLevel: player.skillLevel }],
      isMock: true,
    };
  });
}

function useMidnightCountdown() {
  const [label, setLabel] = useState("--:--:--");

  useEffect(() => {
    function tick() {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.max(0, midnight.getTime() - now.getTime());
      const hours = Math.floor(diff / 3_600_000);
      const minutes = Math.floor((diff % 3_600_000) / 60_000);
      const seconds = Math.floor((diff % 60_000) / 1000);
      setLabel(
        [hours, minutes, seconds]
          .map((value) => String(value).padStart(2, "0"))
          .join(":"),
      );
    }

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  return label;
}

export function DiscoverBoard({
  users,
  sports,
  myAvailability,
}: {
  users: DiscoverUser[];
  sports: { id: string; name: string; icon: string }[];
  myAvailability: Weekday[];
}) {
  const [showFilters, setShowFilters] = useState(true);
  const [showCustomSportInput, setShowCustomSportInput] = useState(false);
  const [customSportName, setCustomSportName] = useState("");
  const [customSports, setCustomSports] = useState<
    { id: string; name: string; icon: string }[]
  >([]);
  const [name, setName] = useState("");
  const [sportId, setSportId] = useState("all");
  const [skill, setSkill] = useState("Tất cả");
  const [gender, setGender] = useState("Tất cả");
  const [ageFrom, setAgeFrom] = useState("16");
  const [ageTo, setAgeTo] = useState("60+");
  const [distance, setDistance] = useState(20);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [days, setDays] = useState<Weekday[]>([]);
  const [sort, setSort] = useState("match");
  const [invitesUsed, setInvitesUsed] = useState(0);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [invitationDialogOpen, setInvitationDialogOpen] = useState(false);
  const [skipped, setSkipped] = useState<string[]>([]);

  const countdown = useMidnightCountdown();
  const filterSports = useMemo(() => {
    const fallbackSports = resolveMockSports(sports);
    const availableSports = [...sports];
    for (const fallback of [fallbackSports.badminton, fallbackSports.pickleball]) {
      if (!availableSports.some((sport) => sport.id === fallback.id)) {
        availableSports.push(fallback);
      }
    }
    for (const customSport of customSports) {
      if (!availableSports.some((sport) => sport.id === customSport.id)) {
        availableSports.push(customSport);
      }
    }
    return availableSports;
  }, [sports, customSports]);

  const matched = useMemo(() => {
    const query = name.trim().toLowerCase();
    const candidates = users.length > 0 ? users : createMockPlayers(filterSports);

    const list = candidates.filter((user) => {
      if (skipped.includes(user.id)) return false;
      if (query && !user.name.toLowerCase().includes(query)) return false;
      if (sportId !== "all" && !user.sports.some((s) => s.id === sportId)) {
        return false;
      }
      if (
        skill !== "Tất cả" &&
        !user.sports.some((s) => s.skillLevel === skill)
      ) {
        return false;
      }
      if (gender !== "Tất cả" && user.gender !== gender) return false;
      if (user.age < Number(ageFrom)) return false;
      if (ageTo !== "60+" && user.age > Number(ageTo)) return false;
      if (user.distanceKm > distance) return false;
      if (onlineOnly && !user.isOnline) return false;
      if (
        days.length > 0 &&
        !days.some((day) => user.availability.includes(day))
      ) {
        return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sort === "distance") return a.distanceKm - b.distanceKm;
      if (sort === "rating") return b.averageStars - a.averageStars;
      const score = (user: DiscoverUser) =>
        user.averageStars * 10 +
        user.trustScore / 10 -
        user.distanceKm +
        (user.isOnline ? 5 : 0);
      return score(b) - score(a);
    });
  }, [
    users,
    filterSports,
    skipped,
    name,
    sportId,
    skill,
    gender,
    ageFrom,
    ageTo,
    distance,
    onlineOnly,
    days,
    sort,
  ]);

  function toggleDay(day: Weekday) {
    setDays((currentDays) =>
      currentDays.includes(day)
        ? currentDays.filter((value) => value !== day)
        : [...currentDays, day],
    );
  }

  function addCustomSport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = customSportName.trim();
    if (!name) return;

    const existing = filterSports.find(
      (sport) => sport.name.toLocaleLowerCase("vi") === name.toLocaleLowerCase("vi"),
    );
    const sport = existing ?? {
      id: `custom-${Date.now()}`,
      name,
      icon: "🏅",
    };

    if (!existing) setCustomSports((currentSports) => [...currentSports, sport]);
    setSportId(sport.id);
    setCustomSportName("");
    setShowCustomSportInput(false);
  }

  function invite(user: DiscoverUser) {
    if (invitesUsed >= FREE_INVITES_PER_DAY) return;
    setInvitesUsed((value) => value + 1);
    setInvitations((current) => [
      {
        id: `${user.id}-${Date.now()}`,
        player: user,
        invitedAt: Date.now(),
        status: "PENDING",
      },
      ...current,
    ]);
    setSkipped((list) => [...list, user.id]);
  }

  function changeAgeFrom(value: string) {
    setAgeFrom(value);
  }

  function changeAgeTo(value: string) {
    setAgeTo(value);
  }

  function selectAgeFrom(value: string) {
    setAgeFrom(value);
    if (ageTo !== "60+" && Number(value) > Number(ageTo)) setAgeTo(value);
  }

  function selectAgeTo(value: string) {
    setAgeTo(value);
    if (value !== "60+" && Number(value) < Number(ageFrom)) {
      setAgeFrom(value);
    }
  }

  function normalizeAgeFrom() {
    const normalized = String(Math.min(80, Math.max(0, Number(ageFrom) || 0)));
    setAgeFrom(normalized);
    if (ageTo !== "60+" && Number(normalized) > Number(ageTo)) {
      setAgeTo(normalized);
    }
  }

  function normalizeAgeTo() {
    if (ageTo === "60+") return;
    const normalized = String(Math.min(80, Math.max(0, Number(ageTo) || 0)));
    setAgeTo(normalized);
    if (Number(normalized) < Number(ageFrom)) setAgeFrom(normalized);
  }

  const activeFilterCount = [
    name.trim() !== "",
    sportId !== "all",
    skill !== "Tất cả",
    gender !== "Tất cả",
    ageFrom !== "16" || ageTo !== "60+",
    distance !== 20,
    onlineOnly,
    days.length > 0,
  ].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0 || skipped.length > 0;

  function resetFilters() {
    setName("");
    setSportId("all");
    setSkill("Tất cả");
    setGender("Tất cả");
    setAgeFrom("16");
    setAgeTo("60+");
    setDistance(20);
    setOnlineOnly(false);
    setDays([]);
    setSkipped([]);
    setCustomSports([]);
    setCustomSportName("");
    setShowCustomSportInput(false);
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] px-6 py-8">
      <Dialog open={invitationDialogOpen} onOpenChange={setInvitationDialogOpen}>
      <div
        className={cn(
          "grid items-start transition-[grid-template-columns,gap] duration-300 ease-in-out",
          showFilters
            ? "gap-7 lg:grid-cols-[360px_minmax(0,1fr)]"
            : "gap-0 lg:grid-cols-[0_minmax(0,1fr)]",
        )}
      >
        <div
          aria-hidden={!showFilters}
          inert={!showFilters}
          className={cn(
            "sticky top-20 min-w-0 transition-[max-height,opacity,transform] duration-300 ease-in-out",
            showFilters
              ? "max-h-[calc(100vh-100px)] overflow-y-auto translate-x-0 opacity-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              : "pointer-events-none max-h-0 overflow-hidden -translate-x-3 opacity-0",
          )}
        >
          <aside className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-heading flex items-center gap-2 text-lg font-bold">
                <span className="bg-brand-gradient flex size-8 items-center justify-center rounded-lg">
                  <SlidersHorizontal className="size-4 text-white" />
                </span>
                Bộ lọc
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                  aria-label="Đặt lại bộ lọc"
                  title="Đặt lại"
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-orange-600 transition-colors hover:bg-orange-500/10 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <RotateCcw className="size-3.5" />
                  Đặt lại
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  aria-label="Đóng bộ lọc"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="mt-7 space-y-6">
              <div>
                <p className="text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">
                  Tìm theo tên
                </p>
                <label className="mt-3 flex h-12 items-center gap-3 rounded-2xl bg-secondary/65 px-4 transition focus-within:bg-secondary focus-within:ring-2 focus-within:ring-orange-500/25">
                  <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <input
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                    }}
                    placeholder="Nhập tên người chơi..."
                    aria-label="Tìm theo tên người chơi"
                    className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </label>
              </div>

              <div>
                <p className="text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">
                  Môn thể thao
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  <FilterChip
                    active={sportId === "all"}
                    onClick={() => {
                      setSportId("all");
                    }}
                  >
                    Tất cả
                  </FilterChip>
                  {filterSports.map((sport) => (
                    <FilterChip
                      key={sport.id}
                      active={sportId === sport.id}
                      onClick={() => {
                        setSportId(sport.id);
                      }}
                    >
                      {getSportIcon(sport.name, sport.icon) ? (
                        <span className="mr-1">
                          {getSportIcon(sport.name, sport.icon)}
                        </span>
                      ) : null}
                      {sport.name}
                    </FilterChip>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomSportInput((isOpen) => !isOpen)}
                  aria-expanded={showCustomSportInput}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-500/10"
                >
                  <Plus className="size-4" />
                  Thêm môn
                </button>
                {showCustomSportInput ? (
                  <form onSubmit={addCustomSport} className="mt-2 flex gap-2">
                    <input
                      autoFocus
                      value={customSportName}
                      onChange={(event) => setCustomSportName(event.target.value)}
                      placeholder="Ví dụ: Tennis, Bóng rổ..."
                      aria-label="Tên môn thể thao mới"
                      className="h-11 min-w-0 flex-1 rounded-xl bg-secondary/65 px-3 text-sm outline-none transition focus:ring-2 focus:ring-orange-500/25"
                    />
                    <button
                      type="submit"
                      disabled={!customSportName.trim()}
                      className="rounded-xl bg-orange-500 px-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Thêm
                    </button>
                  </form>
                ) : null}
              </div>

              <div>
                <p className="text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">
                  Trình độ
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  {SKILL_FILTERS.map((option) => (
                    <FilterChip
                      key={option}
                      active={skill === option}
                      onClick={() => {
                        setSkill(option);
                      }}
                    >
                      {option}
                    </FilterChip>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">
                  Giới tính
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  {GENDER_FILTERS.map((option) => (
                    <FilterChip
                      key={option.value}
                      active={gender === option.value}
                      onClick={() => {
                        setGender(option.value);
                      }}
                    >
                      {option.icon ? (
                        <span className="mr-1">{option.icon}</span>
                      ) : null}
                      {option.value}
                    </FilterChip>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">
                  Độ tuổi
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <AgeCombobox
                    label="Từ"
                    ariaLabel="Tuổi từ"
                    value={ageFrom}
                    options={AGE_SUGGESTIONS.filter((option) => option !== "60+")}
                    onChange={changeAgeFrom}
                    onSelect={selectAgeFrom}
                    onBlur={normalizeAgeFrom}
                  />
                  <AgeCombobox
                    label="Đến"
                    ariaLabel="Tuổi đến"
                    value={ageTo}
                    options={AGE_SUGGESTIONS}
                    onChange={changeAgeTo}
                    onSelect={selectAgeTo}
                    onBlur={normalizeAgeTo}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">
                    Khoảng cách
                  </p>
                  <span className="text-brand text-sm font-bold">
                    {distance} km
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={distance}
                  aria-label="Khoảng cách tối đa"
                  onChange={(event) => {
                    setDistance(Number(event.target.value));
                  }}
                  className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full"
                  style={{
                    background: `linear-gradient(to right, var(--brand) ${
                      ((distance - 1) / 49) * 100
                    }%, var(--secondary) ${((distance - 1) / 49) * 100}%)`,
                  }}
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>1 km</span>
                  <span>50 km</span>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(() => {});
                    }
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold transition-colors hover:border-brand"
                >
                  <Crosshair className="size-4" />
                  Lấy vị trí của tôi
                </button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Dùng vị trí đã lưu trong hồ sơ
                </p>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <span className="bg-success size-2.5 rounded-full" />
                    Online ngay
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Chỉ hiện người đang online
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={onlineOnly}
                  aria-label="Chỉ hiện người đang online"
                  onClick={() => {
                    setOnlineOnly((value) => !value);
                  }}
                  className={cn(
                    "flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors",
                    onlineOnly ? "bg-brand" : "bg-secondary",
                  )}
                >
                  <span
                    className={cn(
                      "size-5 rounded-full bg-white transition-transform",
                      onlineOnly && "translate-x-5",
                    )}
                  />
                </button>
              </div>

              <div>
                <p className="text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">
                  Lịch rảnh
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => (
                    <FilterChip
                      key={day}
                      active={days.includes(day)}
                      onClick={() => toggleDay(day)}
                    >
                      {WEEKDAY_SHORT[day]}
                    </FilterChip>
                  ))}
                </div>
              </div>

            </div>
          </aside>
        </div>

        <div>
          {!showFilters ? (
            <button
              type="button"
              onClick={() => setShowFilters(true)}
              aria-label={`Mở bộ lọc${activeFilterCount ? `, ${activeFilterCount} mục đang chọn` : ""}`}
              className="sticky top-20 z-20 mb-5 inline-flex self-start items-center gap-2.5 rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm font-semibold shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-orange-500/40 hover:shadow-md"
            >
              <SlidersHorizontal className="size-4 text-orange-500" />
              Bộ lọc
              {activeFilterCount > 0 ? (
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-3">
            <StatPill
              icon={<Users className="size-5 text-white" />}
              value={String(matched.length)}
              label="người phù hợp"
            />
            <StatPill
              icon={<Zap className="size-5 text-white" />}
              value={`${invitesUsed}/${FREE_INVITES_PER_DAY}`}
              label="lượt mời miễn phí"
              onClick={() => setInvitationDialogOpen(true)}
            />
            <StatPill
              icon={<Clock className="size-5 text-white" />}
              value={countdown}
              label="reset lúc 0h"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              <span className="font-bold">{matched.length}</span>{" "}
              <span className="text-muted-foreground">người chơi</span>
            </p>
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
              }}
              aria-label="Sắp xếp"
              className="h-11 rounded-xl border border-border bg-card px-4 text-sm font-medium outline-none focus:border-brand"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {users.length === 0 ? (
            <p className="mt-5 text-xs text-muted-foreground">
              Đây là hồ sơ minh họa để xem giao diện; chưa phải người chơi thật.
            </p>
          ) : null}

          {matched.length === 0 ? (
            <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center sm:py-20">
              <span className="mb-5 flex size-20 items-center justify-center rounded-full bg-orange-500/10">
                <Trophy className="size-9 text-orange-500" aria-hidden="true" />
              </span>
              <h2 className="font-heading text-lg font-bold">
                Không tìm thấy người chơi phù hợp
              </h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Thử nới rộng bộ lọc hoặc quay lại sau.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
              >
                <RotateCcw className="size-4" />
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {matched.map((player) => {
                const sharedDays = player.availability.filter((day) => myAvailability.includes(day));

                return (
                  <article
                  key={player.id}
                  className="group overflow-hidden rounded-3xl border border-border bg-card transition duration-200 hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-950/5"
                >
                  <div className="from-orange-500/15 relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br via-secondary/40 to-card">
                    {player.coverImageUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element -- ảnh người dùng qua /api/media */}
                        <img
                          src={player.coverImageUrl}
                          alt=""
                          aria-hidden
                          className="absolute inset-0 size-full object-cover"
                        />
                        <span className="absolute inset-0 bg-black/25" />
                      </>
                    ) : null}
                    <span className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                      <span className={cn("size-2 rounded-full", player.isOnline ? "bg-emerald-500" : "bg-muted-foreground/40")} />
                      {player.isOnline ? "Online" : "Offline"}
                    </span>
                    <UserAvatar
                      emoji={player.avatar}
                      src={player.avatarUrl}
                      name={player.name}
                      className="relative z-10 size-20 border-4 border-background bg-orange-500/10 text-5xl shadow-md transition-transform group-hover:scale-105"
                    />
                    {player.sports[0] ? (
                      <span className="absolute bottom-3 left-4 z-10 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold backdrop-blur">
                        {player.sports[0].icon} {player.sports[0].name}
                      </span>
                    ) : null}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        {player.isMock ? (
                          <h2 className="font-heading truncate text-lg font-bold">{player.name}</h2>
                        ) : (
                          <Link href={`/profile/${player.id}`} className="font-heading block truncate text-lg font-bold hover:text-orange-600">
                            {player.name}
                          </Link>
                        )}
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="size-4 shrink-0" />
                          {player.area} · {player.distanceKm} km
                        </p>
                      </div>
                      <span className="flex shrink-0 items-center gap-1 text-sm font-bold">
                        <Star className="size-4 fill-amber-400 text-amber-400" />
                        {player.averageStars.toFixed(1)}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-700">
                        {player.sports[0]?.skillLevel ?? "Mới chơi"}
                      </span>
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                        {player.age} tuổi
                      </span>
                      <span className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                        <Shield className="size-3.5" /> {player.trustScore}% uy tín
                      </span>
                    </div>

                    <p className="mt-4 min-h-10 text-sm leading-5 text-muted-foreground">
                      {player.bio}
                    </p>

                    {sharedDays.length > 0 ? (
                      <p className="mt-3 text-xs text-muted-foreground">
                        📅 Rảnh cùng bạn: {sharedDays.map((day) => WEEKDAY_SHORT[day]).join(", ")}
                      </p>
                    ) : null}

                    <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
                      <button
                        type="button"
                        onClick={() => invite(player)}
                        disabled={invitesUsed >= FREE_INVITES_PER_DAY}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Send className="size-4" />
                        Gửi lời mời
                      </button>
                      <form action={openDirectChatAction.bind(null, player.id)}>
                        <button
                          type="submit"
                          aria-label={`Nhắn tin với ${player.name}`}
                          className="inline-flex h-full items-center justify-center rounded-xl border border-border px-3 py-2.5 text-muted-foreground transition-colors hover:border-orange-500 hover:text-orange-600"
                        >
                          <MessageCircle className="size-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <DialogContent
        showCloseButton={false}
        className="max-h-[min(80dvh,720px)] gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <DialogHeader className="border-b border-border px-5 py-5 pr-12 sm:px-6">
          <DialogTitle className="font-heading text-lg font-bold sm:text-xl">
            Danh sách đã gửi lời mời ({invitesUsed}/{FREE_INVITES_PER_DAY})
          </DialogTitle>
          <DialogDescription>
            Theo dõi những người chơi bạn đã gửi lời mời.
          </DialogDescription>
          <DialogClose
            aria-label="Đóng danh sách lời mời"
            className="absolute top-4 right-4 rounded-lg p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <X className="size-4" />
          </DialogClose>
        </DialogHeader>

        {invitations.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
            <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
              <Send className="size-6" />
            </span>
            <p className="font-semibold">Chưa có lời mời nào được gửi</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Khi bạn mời người chơi, họ sẽ xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <div className="max-h-[calc(min(80dvh,720px)-100px)] space-y-3 overflow-y-auto p-4 sm:p-5">
            {invitations.map((invitation) => {
              const sport = invitation.player.sports[0];
              const accepted = invitation.status === "ACCEPTED";
              return (
                <article
                  key={invitation.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center"
                >
                  <UserAvatar
                    emoji={invitation.player.avatar}
                    src={invitation.player.avatarUrl}
                    name={invitation.player.name}
                    className="size-12 bg-orange-500/10 text-2xl"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{invitation.player.name}</p>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {sport ? `${sport.icon} ${sport.name} · ${sport.skillLevel}` : "Môn thể thao chưa chọn"}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="size-3.5" />
                      {formatInviteTime(invitation.invitedAt)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
                      accepted
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-orange-500/10 text-orange-600 dark:text-orange-400",
                    )}
                  >
                    {accepted ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : (
                      <Clock className="size-3.5" />
                    )}
                    {accepted ? "Đã chấp nhận" : "Đang chờ phản hồi"}
                  </span>
                </article>
              );
            })}
          </div>
        )}
      </DialogContent>
      </Dialog>
    </div>
  );
}

function AgeCombobox({
  label,
  ariaLabel,
  value,
  options,
  onChange,
  onSelect,
  onBlur,
}: {
  label: string;
  ariaLabel: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  onBlur: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const suggestions = options.filter((option) => {
    if (!isEditing || value === "" || value === "60+") return true;
    return option.startsWith(value) || option === "60+";
  });

  return (
    <div
      className="relative flex min-w-0 flex-col gap-1.5 text-xs font-medium text-muted-foreground"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsOpen(false);
          setIsEditing(false);
          onBlur();
        }
      }}
    >
      <span>{label}</span>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          role="combobox"
          aria-label={ariaLabel}
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={`${ariaLabel.replaceAll(" ", "-")}-suggestions`}
          value={value}
          onFocus={() => {
            setIsEditing(false);
            setIsOpen(true);
          }}
          onClick={() => setIsOpen(true)}
          onChange={(event) => {
            const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 2);
            onChange(digitsOnly);
            setIsEditing(true);
            setIsOpen(true);
          }}
          placeholder="Tuổi"
          className="h-11 w-full rounded-xl bg-secondary/70 py-2 pr-14 pl-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-orange-500/25"
        />
        {value ? (
          <span className="pointer-events-none absolute top-1/2 right-8 -translate-y-1/2 text-xs text-muted-foreground">
            tuổi
          </span>
        ) : null}
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </div>
      {isOpen ? (
        <div
          id={`${ariaLabel.replaceAll(" ", "-")}-suggestions`}
          role="listbox"
          aria-label={`${label}: gợi ý độ tuổi`}
          className="absolute top-full right-0 left-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl"
        >
          {suggestions.length > 0 ? (
            suggestions.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={value === option}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(option);
                  setIsEditing(false);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-orange-500/10 hover:text-orange-600",
                  value === option && "bg-orange-500/10 text-orange-600",
                )}
              >
                {option === "60+" ? "60+ tuổi" : `${option} tuổi`}
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              Nhập tuổi từ 0 đến 80
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function FilterChip({
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
        "inline-flex min-h-10 items-center justify-center rounded-xl border px-3 py-2 text-center text-sm font-medium transition-all duration-150",
        active
          ? "border-orange-500 bg-orange-500 text-white shadow-sm shadow-orange-500/20"
          : "border-transparent bg-secondary/70 text-muted-foreground hover:border-orange-500/20 hover:bg-orange-500/10 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function StatPill({
  icon,
  value,
  label,
  onClick,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="bg-brand-gradient flex size-10 shrink-0 items-center justify-center rounded-xl">
        {icon}
      </span>
      <span className="min-w-0 text-left">
        <span className="font-heading block text-xl font-extrabold tabular-nums">
          {value}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {label}
        </span>
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`${label}: ${value}. Xem danh sách đã gửi lời mời`}
        className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-orange-500/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4">
      {content}
    </div>
  );
}

function formatInviteTime(timestamp: number) {
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000));
  if (minutes === 0) return "Vừa xong";
  if (minutes === 1) return "1 phút trước";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "1 giờ trước";
  return `${hours} giờ trước`;
}
