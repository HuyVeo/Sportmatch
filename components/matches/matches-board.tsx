"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Globe,
  Lock,
  MapPin,
  Plus,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import { MatchCardAction } from "@/components/matches/match-actions";
import { UserAvatar } from "@/components/ui/user-avatar";
import { formatDateTime } from "@/lib/format";
import { SKILL_LEVELS, type ViewerRole } from "@/lib/types";
import { cn } from "@/lib/utils";

export type MatchCardData = {
  id: string;
  title: string;
  sportId: string;
  sportName: string;
  sportIcon: string;
  courtName: string;
  address: string;
  dateTime: string;
  visibility: string;
  skillRequirement: string;
  joined: number;
  maxPlayers: number;
  participantAvatars: { emoji: string; src: string | null; name: string }[];
  role: ViewerRole;
  isOpen: boolean;
};

const tabs = [
  { id: "public", label: "Công khai", icon: Globe },
  { id: "mine", label: "Trận của tôi", icon: Users },
  { id: "invites", label: "Lời mời", icon: UserPlus },
  { id: "joined", label: "Đã tham gia", icon: Lock },
] as const;

type TabId = (typeof tabs)[number]["id"];
type SlotFilter = "all" | "open" | "full";

export function MatchesBoard({
  matches,
  sports,
}: {
  matches: MatchCardData[];
  sports: { id: string; name: string }[];
}) {
  const [tab, setTab] = useState<TabId>("public");
  const [query, setQuery] = useState("");
  const [sportId, setSportId] = useState("all");
  const [level, setLevel] = useState("all");
  const [slots, setSlots] = useState<SlotFilter>("all");

  const visible = useMemo(() => {
    return matches.filter((match) => {
      if (tab === "public" && match.visibility !== "Công khai") return false;
      if (tab === "mine" && match.role !== "host") return false;
      if (tab === "invites" && match.role !== "invited") return false;
      if (tab === "joined" && match.role !== "joined") return false;

      if (sportId !== "all" && match.sportId !== sportId) return false;
      if (level !== "all" && match.skillRequirement !== level) return false;

      const isFull = match.joined >= match.maxPlayers;
      if (slots === "open" && isFull) return false;
      if (slots === "full" && !isFull) return false;

      if (query.trim()) {
        const haystack =
          `${match.title} ${match.courtName} ${match.address}`.toLowerCase();
        if (!haystack.includes(query.trim().toLowerCase())) return false;
      }

      return true;
    });
  }, [matches, tab, sportId, level, slots, query]);

  const openCount = visible.filter(
    (match) => match.joined < match.maxPlayers,
  ).length;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Trận đấu</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="text-brand font-semibold">{openCount}</span> trận
            còn chỗ trong tab hiện tại
          </p>
        </div>
        <Link
          href="/matches/create"
          className="bg-brand-gradient shadow-brand/30 inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-semibold text-white shadow-xl transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" />
          Tạo trận
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-2">
        <div className="flex flex-wrap gap-1">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
                tab === item.id
                  ? "bg-brand-gradient text-white"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm trận, sân hoặc khu vực..."
            className="h-11 w-full rounded-xl border border-input bg-secondary/40 pr-4 pl-11 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand"
          />
        </div>

        <select
          value={sportId}
          onChange={(event) => setSportId(event.target.value)}
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
          value={level}
          onChange={(event) => setLevel(event.target.value)}
          className="h-11 rounded-xl border border-input bg-secondary/40 px-4 text-sm outline-none focus:border-brand"
        >
          <option value="all">Tất cả trình độ</option>
          {SKILL_LEVELS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          {(
            [
              { id: "all", label: "Tất cả" },
              { id: "open", label: "Còn chỗ" },
              { id: "full", label: "Đã đủ" },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSlots(option.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                slots === option.id
                  ? "bg-brand text-white"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-border bg-card px-6 py-16 text-center">
          <p className="font-heading text-lg font-bold">
            Chưa có trận nào ở tab này
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Thử đổi bộ lọc hoặc tạo một trận mới.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((match) => {
            const remaining = match.maxPlayers - match.joined;
            return (
              <article
                key={match.id}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="bg-brand/5 flex items-start gap-3 p-4">
                  <span className="bg-brand-gradient flex size-11 shrink-0 items-center justify-center rounded-xl text-lg">
                    {match.sportIcon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/matches/${match.id}`}
                      className="font-heading block leading-snug font-bold hover:underline"
                    >
                      {match.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {match.sportName}
                    </p>
                  </div>
                  {remaining > 0 && (
                    <span className="bg-success-muted text-success shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold">
                      Còn chỗ
                    </span>
                  )}
                </div>

                <div className="space-y-2 p-4 pt-3">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="size-4 shrink-0" />
                    {formatDateTime(match.dateTime)}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-4 shrink-0" />
                    {match.courtName}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="size-4 shrink-0" />
                    {match.visibility}
                  </p>

                  <div className="pt-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="size-4" />
                        {match.joined}/{match.maxPlayers} người
                      </span>
                      {remaining > 0 && (
                        <span className="text-brand font-semibold">
                          Còn {remaining} chỗ
                        </span>
                      )}
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="bg-brand-gradient h-full rounded-full"
                        style={{
                          width: `${(match.joined / match.maxPlayers) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <div className="flex -space-x-2">
                      {match.participantAvatars.map((avatar, index) => (
                        <UserAvatar
                          key={`${match.id}-${index}`}
                          emoji={avatar.emoji}
                          src={avatar.src}
                          name={avatar.name}
                          className="bg-brand border-card size-8 border-2 text-sm"
                        />
                      ))}
                    </div>
                    <MatchCardAction
                      matchId={match.id}
                      role={match.role}
                      isFull={remaining <= 0}
                      isOpen={match.isOpen}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
