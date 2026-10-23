"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Activity, Filter, Plus, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { ClubCard } from "@/components/clubs/club-card";
import { SidebarFilter, type FilterValue, type SportFilter } from "@/components/clubs/sidebar-filter";
import { DEMO_PREFERENCES, mockClubs, type Club } from "@/lib/clubs/mock-data";
import { getCreatedClubs, getPendingClubRequests, getServerCreatedClubs, getServerPendingClubRequests, subscribeClubRequests, subscribeCreatedClubs } from "@/lib/clubs/demo-storage";

const defaultFilters: FilterValue = {
  sport: "Tất cả",
  location: "",
  level: "Tất cả",
  time: "Tất cả",
  recruitment: "Tất cả",
  fee: "Tất cả",
};

const quickSports = [
  { name: "Bóng đá", icon: "⚽" },
  { name: "Bóng rổ", icon: "🏀" },
  { name: "Cầu lông", icon: "🏸" },
  { name: "Bóng bàn", icon: "🏓" },
  { name: "Tennis", icon: "🎾" },
  { name: "Pickleball", icon: "🏓" },
  { name: "Võ thuật", icon: "🥋" },
] as const;

function normalize(value: string) {
  return value.toLocaleLowerCase("vi").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
}

function matchScore(club: Club) {
  let score = 40;
  if (club.sportType === DEMO_PREFERENCES.sport) score += 25;
  if (normalize(club.area).includes(normalize(DEMO_PREFERENCES.area))) score += 20;
  if (club.level === DEMO_PREFERENCES.level) score += 10;
  if (club.schedule.some((day) => DEMO_PREFERENCES.availableDays.includes(day))) score += 5;
  return Math.min(score, 99);
}

function matchesTime(club: Club, selected: FilterValue["time"]) {
  if (selected === "Tất cả") return true;
  if (selected === "Cuối tuần") return club.schedule.some((day) => day === "T7" || day === "CN");
  const startHour = Number(club.time.slice(0, 2));
  if (selected === "Sáng") return startHour >= 5 && startHour < 12;
  if (selected === "Chiều") return startHour >= 12 && startHour < 18;
  return startHour >= 18;
}

function matchesFee(fee: number, selected: FilterValue["fee"]) {
  if (selected === "Tất cả") return true;
  if (selected === "Miễn phí") return fee === 0;
  if (selected === "Dưới 50.000đ") return fee > 0 && fee < 50000;
  if (selected === "50.000–100.000đ") return fee >= 50000 && fee <= 100000;
  return fee > 100000;
}

export function ExploreClubsPage({ persistentClubs = [] }: { persistentClubs?: Club[] }) {
  const [filters, setFilters] = useState(defaultFilters);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("match");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [joinTarget, setJoinTarget] = useState<Club | null>(null);
  const [joinMessage, setJoinMessage] = useState("");
  const createdClubs = useSyncExternalStore(subscribeCreatedClubs, getCreatedClubs, getServerCreatedClubs);
  const pendingClubIds = useSyncExternalStore(subscribeClubRequests, getPendingClubRequests, getServerPendingClubRequests);
  const clubs = useMemo(() => [...persistentClubs, ...createdClubs, ...mockClubs], [createdClubs, persistentClubs]);
  const persistentClubIds = useMemo(() => new Set(persistentClubs.map((club) => club.id)), [persistentClubs]);

  const filteredClubs = useMemo(() => {
    const normalizedQuery = normalize(query.trim());
    const normalizedArea = normalize(filters.location.trim());
    const result = clubs.filter((club) => {
      const matchesSport = filters.sport === "Tất cả" || club.sportType === filters.sport;
      const matchesArea = !normalizedArea || normalize(club.area).includes(normalizedArea);
      const matchesQuery = !normalizedQuery || normalize(`${club.name} ${club.sportType} ${club.area}`).includes(normalizedQuery);
      const matchesLevel = filters.level === "Tất cả" || club.level === filters.level;
      const matchesRecruitment = filters.recruitment === "Tất cả" ||
        (filters.recruitment === "Đang tuyển" ? club.recruitmentCount > 0 : club.recruitmentCount === 0);
      return matchesSport && matchesArea && matchesQuery && matchesLevel && matchesRecruitment && matchesTime(club, filters.time) && matchesFee(club.fee, filters.fee);
    });

    return result.sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "activity") return b.activityRate - a.activityRate;
      if (sortBy === "newest") return a.foundedMonths - b.foundedMonths;
      return matchScore(b) - matchScore(a);
    });
  }, [clubs, filters, query, sortBy]);

  const recommended = [...clubs].sort((a, b) => matchScore(b) - matchScore(a)).slice(0, 3);
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => key === "location" ? value !== "" : value !== "Tất cả").length;
  const hrefFor = (clubId: string) => `/clubs/${clubId}`;

  function resetFilters() {
    setFilters(defaultFilters);
    setQuery("");
    setSortBy("match");
  }

  async function submitJoinRequest() {
    if (!joinTarget) return;

    if (!persistentClubIds.has(joinTarget.id)) {
      setJoinMessage("CLB dữ liệu mẫu chỉ để xem thử; yêu cầu tham gia chưa được gửi.");
      setJoinTarget(null);
      return;
    }

    const response = await fetch(`/api/clubs/${joinTarget.id}/membership`, { method: "POST" });
    const result = await response.json();
    setJoinMessage(response.ok
      ? `Đã gửi yêu cầu tham gia ${joinTarget.name}. Chủ CLB sẽ xét duyệt trước khi bạn vào kênh nội bộ.`
      : result.error ?? "Không thể gửi yêu cầu tham gia.");
    setJoinTarget(null);
  }

  const filterPanel = <SidebarFilter value={filters} onChange={setFilters} onReset={resetFilters} />;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-7 text-slate-900 md:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-orange-600">SportMatch · Cộng đồng</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">Câu lạc bộ</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">Khám phá những câu lạc bộ thể thao phù hợp với bạn.</p>
          </div>
          <Link href="/clubs/create" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600">
            <Plus className="size-4" /> Tạo CLB
          </Link>
        </header>

        <section className="mb-5 rounded-xl border border-slate-200 bg-white p-4 md:p-5" aria-label="Tìm kiếm câu lạc bộ">
          <label htmlFor="club-search" className="mb-2 block text-sm font-semibold text-slate-800">Tìm câu lạc bộ, môn thể thao hoặc khu vực</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <input id="club-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="VD: Cầu lông, Pickleball, Cầu Giấy..." className="min-h-12 w-full rounded-lg border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100" />
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Lọc nhanh theo môn thể thao">
            <button type="button" onClick={() => setFilters({ ...filters, sport: "Tất cả" })} className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold ${filters.sport === "Tất cả" ? "border-orange-200 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>Tất cả</button>
            {quickSports.map(({ name, icon }) => (
              <button key={name} type="button" onClick={() => setFilters({ ...filters, sport: name as SportFilter })} aria-pressed={filters.sport === name} className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold ${filters.sport === name ? "border-orange-200 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                <span aria-hidden="true">{icon}</span>{name}
              </button>
            ))}
          </div>
        </section>

        {joinMessage && <div role="status" className="mb-5 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><span>{joinMessage}</span><button type="button" onClick={() => setJoinMessage("")} className="ml-3 font-semibold">Đóng</button></div>}

        <section className="mb-5 rounded-xl border border-orange-100 bg-white p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2"><Sparkles className="size-5 text-orange-500" /><div><h2 className="font-bold">CLB phù hợp với bạn</h2><p className="text-xs text-slate-500">Dựa trên môn, khu vực, trình độ và lịch chơi mẫu.</p></div></div>
            <div className="flex flex-wrap gap-2">
              {recommended.map((club) => <Link key={club.id} href={hrefFor(club.id)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-orange-300 hover:text-orange-700">{club.logo} {club.name} <span className="ml-1 text-orange-600">{matchScore(club)}%</span></Link>)}
            </div>
          </div>
        </section>

        <div className="mb-4 flex items-center justify-between lg:hidden">
          <button type="button" onClick={() => setMobileFiltersOpen((open) => !open)} aria-expanded={mobileFiltersOpen} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
            <Filter className="size-4" /> Bộ lọc{activeFilterCount ? ` (${activeFilterCount})` : ""}
          </button>
          <span className="text-sm text-slate-500">{filteredClubs.length} CLB</span>
        </div>
        {mobileFiltersOpen && <div className="mb-4 lg:hidden">{filterPanel}</div>}

        <div className="grid items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="sticky top-4 hidden lg:block">{filterPanel}</div>
          <section aria-labelledby="club-results-title" className="min-w-0">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div><h2 id="club-results-title" className="text-lg font-bold">Khám phá CLB</h2><p className="mt-1 text-sm text-slate-500">{filteredClubs.length} câu lạc bộ phù hợp</p></div>
              <label className="flex items-center gap-2 text-sm text-slate-600">Sắp xếp
                <select aria-label="Sắp xếp câu lạc bộ" value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-orange-400">
                  <option value="match">Phù hợp</option><option value="rating">Đánh giá cao</option><option value="activity">Hoạt động tích cực</option><option value="newest">Mới thành lập</option>
                </select>
              </label>
            </div>

            {filteredClubs.length ? <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {filteredClubs.map((club) => <ClubCard key={club.id} club={club} href={hrefFor(club.id)} matchScore={matchScore(club)} isPending={pendingClubIds.includes(club.id)} onJoin={setJoinTarget} />)}
            </div> : <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 text-center"><Activity className="mb-3 size-7 text-slate-400" /><p className="font-semibold text-slate-700">Chưa tìm thấy câu lạc bộ phù hợp.</p><p className="mt-1 text-sm text-slate-500">Thử thay đổi bộ lọc hoặc khu vực.</p><button type="button" onClick={resetFilters} className="mt-4 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600">Xóa bộ lọc</button></div>}
          </section>
        </div>
      </div>

      {joinTarget && <JoinRequestDialog club={joinTarget} onClose={() => setJoinTarget(null)} onSubmit={submitJoinRequest} />}
    </main>
  );
}

function JoinRequestDialog({ club, onClose, onSubmit }: { club: Club; onClose: () => void; onSubmit: () => void }) {
  const [days, setDays] = useState<string[]>([]);
  const toggleDay = (day: string) => setDays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day]);

  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="join-dialog-title" className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6">
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-orange-600">Yêu cầu tham gia · {club.name}</p><h2 id="join-dialog-title" className="mt-1 text-xl font-bold">Giới thiệu về bạn</h2></div><button type="button" onClick={onClose} aria-label="Đóng" className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100">✕</button></div>
      <form className="mt-5 space-y-4" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
        <label className="block text-sm font-semibold text-slate-700">Trình độ<select required className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal"><option>Người mới</option><option>Cơ bản</option><option>Trung bình</option><option>Nâng cao</option></select></label>
        <label className="block text-sm font-semibold text-slate-700">Vị trí phù hợp<input className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" placeholder={club.positions[0] ?? "Không áp dụng"} /></label>
        <fieldset><legend className="text-sm font-semibold text-slate-700">Lịch có thể tham gia</legend><div className="mt-2 flex flex-wrap gap-2">{["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => <label key={day} className={`cursor-pointer rounded-lg border px-3 py-2 text-xs font-semibold ${days.includes(day) ? "border-orange-300 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-600"}`}><input type="checkbox" checked={days.includes(day)} onChange={() => toggleDay(day)} className="sr-only" />{day}</label>)}</div></fieldset>
        <label className="block text-sm font-semibold text-slate-700">Giới thiệu<textarea rows={3} className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 font-normal" placeholder="Chia sẻ ngắn về kinh nghiệm và mong muốn của bạn" /></label>
        <button type="submit" className="min-h-11 w-full rounded-lg bg-orange-500 px-4 text-sm font-bold text-white hover:bg-orange-600">Gửi yêu cầu tham gia</button>
      </form>
    </section>
  </div>;
}
