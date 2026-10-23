"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Crown,
  Info,
  Medal,
  Search,
  Shield,
  Star,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { RANK_TIERS } from "@/lib/ranking";
import { cn } from "@/lib/utils";

export type RankedPlayer = {
  id: string;
  name: string;
  avatar: string;
  avatarUrl: string | null;
  isPro: boolean;
  sportIcons: string[];
  sportIds: string[];
  skillLabel: string;
  tier: string;
  averageStars: number;
  ratingCount: number;
  matchCount: number;
  trustScore: number;
  score: number;
};

const CRITERIA = [
  { id: "total", label: "Tổng thể", icon: Crown },
  { id: "rating", label: "Đánh giá", icon: Star },
  { id: "matches", label: "Trận đấu", icon: Trophy },
  { id: "trust", label: "Uy tín", icon: Shield },
];

const PAGE_SIZES = [15, 30, 50];

const TIER_STYLES: Record<string, string> = {
  "Huyền thoại": "bg-yellow-500/15 text-yellow-500",
  "Tinh anh": "bg-purple-500/15 text-purple-400",
  "Chuyên nghiệp": "bg-brand/15 text-brand",
  "Trung cấp": "bg-success-muted text-success",
  "Tân binh": "bg-secondary text-muted-foreground",
};

const FORMULA = [
  { icon: Star, label: "Đánh giá", detail: "Sao TB x 30" },
  { icon: Trophy, label: "Trận đấu", detail: "Số trận x 1.5" },
  { icon: Shield, label: "Uy tín", detail: "Uy tín x 0.4" },
  { icon: Users, label: "Cộng đồng", detail: "Votes x 2" },
];

function TierBadge({ tier }: { tier: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        TIER_STYLES[tier] ?? TIER_STYLES["Tân binh"],
      )}
    >
      <Crown className="size-3" />
      {tier}
    </span>
  );
}

export function RankingBoard({
  players,
  sports,
  currentUserId,
}: {
  players: RankedPlayer[];
  sports: { id: string; name: string }[];
  currentUserId: string;
}) {
  const [criteria, setCriteria] = useState("total");
  const [query, setQuery] = useState("");
  const [sportId, setSportId] = useState("all");
  const [pageSize, setPageSize] = useState(15);
  const [page, setPage] = useState(1);

  const ranked = useMemo(() => {
    const filtered = players.filter(
      (player) => sportId === "all" || player.sportIds.includes(sportId),
    );

    return [...filtered].sort((a, b) => {
      if (criteria === "rating") return b.averageStars - a.averageStars;
      if (criteria === "matches") return b.matchCount - a.matchCount;
      if (criteria === "trust") return b.trustScore - a.trustScore;
      return b.score - a.score;
    });
  }, [players, sportId, criteria]);

  const totalPages = Math.max(1, Math.ceil(ranked.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageRows = ranked
    .map((player, index) => ({ player, rank: index + 1 }))
    .slice(pageStart, pageStart + pageSize);

  const searched = query.trim()
    ? pageRows.filter((row) =>
        row.player.name.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : pageRows;

  const podium = ranked.slice(0, 3);
  const myRank = ranked.findIndex((player) => player.id === currentUserId) + 1;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="text-center">
        <span className="bg-brand/10 text-brand inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold">
          <Trophy className="size-4" />
          Bảng xếp hạng
        </span>
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
          Top Người Chơi SportMatch
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Điểm được tính từ đánh giá, số trận, uy tín và đóng góp cộng đồng.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap justify-center gap-2">
          {CRITERIA.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setCriteria(item.id);
                setPage(1);
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
                criteria === item.id
                  ? "bg-brand-gradient text-white"
                  : "border border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <div className="relative min-w-64 flex-1 sm:max-w-80">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm người chơi trong trang hiện tại..."
              className="h-11 w-full rounded-xl border border-input bg-secondary/40 pr-4 pl-11 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand"
            />
          </div>

          <select
            value={sportId}
            onChange={(event) => {
              setSportId(event.target.value);
              setPage(1);
            }}
            aria-label="Lọc theo môn"
            className="h-11 rounded-xl border border-input bg-secondary/40 px-4 text-sm outline-none focus:border-brand"
          >
            <option value="all">Tất cả môn</option>
            {sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>

          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
            aria-label="Số dòng mỗi trang"
            className="h-11 rounded-xl border border-input bg-secondary/40 px-4 text-sm outline-none focus:border-brand"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}/trang
              </option>
            ))}
          </select>
        </div>
      </div>

      {podium.length === 3 ? (
        <div className="mt-12 grid grid-cols-3 items-end gap-3 sm:gap-6">
          <PodiumSlot player={podium[1]} place={2} />
          <PodiumSlot player={podium[0]} place={1} />
          <PodiumSlot player={podium[2]} place={3} />
        </div>
      ) : null}

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 p-6">
            <div>
              <h2 className="font-heading text-xl font-bold">Bảng xếp hạng</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Trang {safePage}/{totalPages} · {searched.length} kết quả
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PagerButton
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
                label="Trang trước"
              >
                <ChevronLeft className="size-4" />
              </PagerButton>
              <span className="text-sm font-semibold">{safePage}</span>
              <PagerButton
                disabled={safePage >= totalPages}
                onClick={() => setPage(safePage + 1)}
                label="Trang sau"
              >
                <ChevronRight className="size-4" />
              </PagerButton>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-y border-border text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="px-6 py-3 font-medium">Hạng</th>
                  <th className="px-3 py-3 font-medium">Người chơi</th>
                  <th className="px-3 py-3 font-medium">Cấp bậc</th>
                  <th className="px-3 py-3 text-center font-medium">Đánh giá</th>
                  <th className="px-3 py-3 text-center font-medium">Trận</th>
                  <th className="px-6 py-3 text-right font-medium">Điểm</th>
                </tr>
              </thead>
              <tbody>
                {searched.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-14 text-center text-sm text-muted-foreground"
                    >
                      Không tìm thấy người chơi phù hợp.
                    </td>
                  </tr>
                ) : (
                  searched.map(({ player, rank }) => (
                    <tr
                      key={player.id}
                      className={cn(
                        "border-b border-border last:border-0",
                        player.id === currentUserId && "bg-brand/5",
                      )}
                    >
                      <td className="px-6 py-4 font-semibold text-muted-foreground">
                        #{rank}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            emoji={player.avatar}
                            src={player.avatarUrl}
                            name={player.name}
                            className="bg-secondary size-10 text-lg"
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/profile/${player.id}`}
                              className="block truncate font-semibold hover:underline"
                            >
                              {player.name}
                            </Link>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-sm">
                                {player.sportIcons.join(" ")}
                              </span>
                              {player.skillLabel ? (
                                <span className="bg-secondary rounded-full px-2 py-0.5 text-xs text-muted-foreground">
                                  {player.skillLabel}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <TierBadge tier={player.tier} />
                      </td>
                      <td className="px-3 py-4 text-center">
                        <p className="flex items-center justify-center gap-1 font-bold">
                          <Star className="fill-brand text-brand size-3.5" />
                          {player.averageStars}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {player.ratingCount} lượt
                        </p>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <p className="flex items-center justify-center gap-1 font-bold">
                          <Trophy className="size-3.5 text-muted-foreground" />
                          {player.matchCount}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          trận
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-brand flex items-center justify-end gap-1 font-bold">
                          {Math.round(player.score)}
                          <Info className="size-3 opacity-60" />
                        </p>
                        <p className="text-success mt-0.5 text-xs">
                          {player.trustScore}% uy tín
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-6">
            <p className="text-sm text-muted-foreground">
              Hiển thị {pageRows.length} người chơi
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
                className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-brand disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
                Trước
              </button>
              <span className="text-sm font-semibold">
                Trang {safePage}/{totalPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage(safePage + 1)}
                className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-brand disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sau
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Zap className="text-brand size-4" />
              Thứ hạng của bạn
            </p>
            <p className="font-heading text-brand mt-3 text-4xl font-extrabold">
              #{myRank > 0 ? myRank : "--"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              trên {ranked.length} người chơi
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Info className="size-4 text-muted-foreground" />
              Công thức điểm
            </p>
            <ul className="mt-4 space-y-3">
              {FORMULA.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl bg-secondary/40 px-4 py-3"
                >
                  <item.icon className="text-brand size-4 shrink-0" />
                  <span>
                    <span className="block text-sm font-semibold">
                      {item.label}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {item.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Crown className="size-4 text-muted-foreground" />
              Cấp bậc
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[...RANK_TIERS].reverse().map((tier) => (
                <span
                  key={tier.name}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold",
                    TIER_STYLES[tier.name] ?? TIER_STYLES["Tân binh"],
                  )}
                >
                  {tier.name} ≥ {tier.minScore}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PagerButton({
  disabled,
  onClick,
  label,
  children,
}: {
  disabled: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-full border border-border transition-colors hover:border-brand disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

const PODIUM_STYLES = {
  1: {
    box: "bg-brand-gradient h-32 text-white",
    ring: "ring-yellow-400",
    icon: Crown,
    iconWrap: "bg-yellow-400 text-yellow-950",
  },
  2: {
    box: "bg-secondary h-24 text-foreground",
    ring: "ring-zinc-400",
    icon: Medal,
    iconWrap: "bg-zinc-300 text-zinc-900",
  },
  3: {
    box: "bg-brand/25 h-20 text-foreground",
    ring: "ring-brand/70",
    icon: Award,
    iconWrap: "bg-brand text-white",
  },
} as const;

function PodiumSlot({
  player,
  place,
}: {
  player: RankedPlayer;
  place: 1 | 2 | 3;
}) {
  const style = PODIUM_STYLES[place];
  const Icon = style.icon;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <UserAvatar
          emoji={player.avatar}
          src={player.avatarUrl}
          name={player.name}
          className={cn(
            "bg-brand-gradient size-16 text-3xl ring-4 sm:size-20",
            style.ring,
          )}
        />
        <span
          className={cn(
            "absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full",
            style.iconWrap,
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>

      <Link
        href={`/profile/${player.id}`}
        className="mt-3 max-w-full truncate text-center text-sm font-bold hover:underline"
      >
        {player.name}
      </Link>
      <span className="mt-2">
        <TierBadge tier={player.tier} />
      </span>
      <p className="mt-2 text-sm font-bold">{Math.round(player.score)} điểm</p>
      <p className="mt-1 text-sm">{player.sportIcons.join(" ")}</p>

      <div
        className={cn(
          "font-heading mt-3 flex w-full items-center justify-center rounded-xl text-2xl font-extrabold",
          style.box,
        )}
      >
        #{place}
      </div>
    </div>
  );
}
