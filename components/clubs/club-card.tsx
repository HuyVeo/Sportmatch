import Link from "next/link";
import { Activity, CalendarDays, MapPin, Star, Users } from "lucide-react";
import type { Club } from "@/lib/clubs/mock-data";

export function ClubCard({
  club,
  href,
  matchScore,
  isPending,
  onJoin,
}: {
  club: Club;
  href: string;
  matchScore: number;
  isPending: boolean;
  onJoin: (club: Club) => void;
}) {
  const isRecruiting = club.recruitmentCount > 0;

  return (
    <article className="flex min-h-full flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-200 hover:shadow-[0_8px_24px_rgba(15,23,42,0.07)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-2xl" aria-hidden="true">
            {club.logo}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-bold text-slate-900">{club.name}</h3>
            <p className="mt-0.5 text-xs font-medium text-slate-500">{club.sportType}</p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isRecruiting ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
          }`}
        >
          {isRecruiting ? "Đang tuyển" : "Đã đủ thành viên"}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">{club.description}</p>

      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs text-slate-600">
        <span className="flex min-w-0 items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0 text-orange-500" />
          <span className="truncate">{club.area}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
          <span>{club.rating.toFixed(1)}</span>
          <span className="text-slate-400">·</span>
          <Users className="size-3.5 shrink-0 text-slate-400" />
          <span>{club.memberCount}/{club.capacity}</span>
        </span>
        <span className="flex min-w-0 items-center gap-1.5">
          <CalendarDays className="size-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{club.schedule.join(" · ")}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Activity className="size-3.5 shrink-0 text-emerald-600" />
          <span>{club.activityRate}% hoạt động</span>
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <span className="text-slate-500">{isRecruiting ? `Còn ${club.recruitmentCount} vị trí` : "Không nhận thêm thành viên"}</span>
        <span className="font-semibold text-slate-700">{club.fee === 0 ? "Miễn phí" : `${club.fee.toLocaleString("vi-VN")}đ/buổi`}</span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="rounded-md bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700">{matchScore}% phù hợp</span>
        <span className="text-xs text-slate-500">Hoạt động: {club.status.toLocaleLowerCase("vi")}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href={href}
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-orange-500 px-3 text-sm font-semibold text-white transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
        >
          Xem CLB
        </Link>
        {isRecruiting && (
          <button
            type="button"
            onClick={() => onJoin(club)}
            disabled={isPending}
            className="min-h-10 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 disabled:cursor-default disabled:border-emerald-200 disabled:bg-emerald-50 disabled:text-emerald-700"
          >
            {isPending ? "Đang chờ duyệt" : "Tham gia"}
          </button>
        )}
      </div>
    </article>
  );
}
