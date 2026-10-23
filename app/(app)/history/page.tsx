import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  CalendarDays,
  MapPin,
  Star,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { countJoined, getMatchesJoinedBy } from "@/lib/data/matches";
import { getSports } from "@/lib/data/sports";
import { getCurrentUser } from "@/lib/data/users";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Lịch sử trận đấu · SportMatch",
};

const STATUS_STYLES: Record<string, string> = {
  "Sắp diễn ra": "bg-brand/10 text-brand",
  "Đang diễn ra": "bg-success-muted text-success",
  "Đã hoàn tất": "bg-secondary text-muted-foreground",
};

export default async function HistoryPage() {
  const currentUser = await getCurrentUser();
  const [mine, sports] = await Promise.all([
    getMatchesJoinedBy(currentUser.id),
    getSports(),
  ]);

  const sportMap = new Map(sports.map((sport) => [sport.id, sport]));

  const completed = mine.filter((match) => match.status === "Đã hoàn tất");
  const ongoing = mine.filter((match) => match.status === "Đang diễn ra");

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">
        Lịch sử trận đấu
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Các trận bạn đã tham gia.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={<Trophy className="text-brand size-5" />}
          tone="brand"
          value={String(mine.length)}
          label="Tổng trận"
        />
        <StatCard
          icon={<TrendingUp className="text-success size-5" />}
          tone="success"
          value={String(completed.length)}
          label="Đã hoàn tất"
        />
        <StatCard
          icon={<TrendingUp className="text-brand size-5" />}
          tone="brand"
          value={String(ongoing.length)}
          label="Đang diễn ra"
        />
        <StatCard
          icon={<Star className="text-brand size-5" />}
          tone="brand"
          value={`${currentUser.averageStars}★`}
          label="Đánh giá TB"
        />
      </div>

      {mine.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-card px-6 py-14 text-center">
          <p className="text-sm text-muted-foreground">
            Chưa có lịch sử trận đấu.{" "}
            <Link href="/matches" className="text-brand font-bold hover:underline">
              Tìm trận ngay
            </Link>
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {mine.map((match) => (
            <li
              key={match.id}
              className="flex gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <span className="bg-brand-gradient flex size-11 shrink-0 items-center justify-center rounded-xl text-lg">
                {sportMap.get(match.sportId)?.icon ?? "🏅"}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-heading font-bold">{match.title}</p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
                      STATUS_STYLES[match.status] ?? STATUS_STYLES["Đã hoàn tất"],
                    )}
                  >
                    {match.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <CalendarDays className="size-4 shrink-0" />
                    {formatDateTime(match.dateTime)}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="size-4 shrink-0" />
                    {match.courtName}
                  </p>
                  <p className="flex items-center gap-2">
                    <Users className="size-4 shrink-0" />
                    {countJoined(match)}/{match.maxPlayers} người ·{" "}
                    {sportMap.get(match.sportId)?.name ?? match.sportId}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatCard({
  icon,
  tone,
  value,
  label,
}: {
  icon: ReactNode;
  tone: "brand" | "success";
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 text-center">
      <span
        className={cn(
          "mx-auto flex size-10 items-center justify-center rounded-xl",
          tone === "brand" ? "bg-brand/10" : "bg-success-muted",
        )}
      >
        {icon}
      </span>
      <p className="font-heading mt-4 text-2xl font-extrabold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
