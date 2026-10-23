import type { ReactNode } from "react";
import Link from "next/link";
import { MapPin, SquarePen, Star, Target, Trophy } from "lucide-react";
import type { Sport, UserSport } from "@/lib/types";

/**
 * Card "Môn thể thao" trên trang hồ sơ: mỗi môn một khối gồm trình độ, mục
 * đích chơi, khu vực thường chơi và sân yêu thích.
 */
export function SportProfileCard({
  sports,
  sportMap,
  isOwnProfile,
}: {
  sports: UserSport[];
  sportMap: Map<string, Sport>;
  isOwnProfile: boolean;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading flex items-center gap-2 text-lg font-bold">
          <Trophy className="text-brand size-5" />
          Môn thể thao
        </h2>
        {isOwnProfile ? (
          <Link
            href="/settings#sports"
            className="text-brand hover:bg-brand/10 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors"
          >
            <SquarePen className="size-4" />
            Chỉnh sửa
          </Link>
        ) : null}
      </div>

      {sports.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Chưa chọn môn thể thao nào.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {sports.map((entry) => {
            const sport = sportMap.get(entry.sportId);
            return (
              <article
                key={entry.sportId}
                className="rounded-2xl border border-border bg-secondary/30 p-5"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-3xl">{sport?.icon ?? "🏅"}</span>
                  <h3 className="font-heading text-lg font-bold">
                    {sport?.name ?? entry.sportId}
                  </h3>
                  <span className="rounded-full bg-teal-400/15 px-3 py-1 text-xs font-semibold text-teal-400">
                    {entry.skillLevel}
                  </span>
                </div>

                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Detail icon={<Target className="size-3.5" />} label="Mục đích chơi">
                    {entry.purposes.map((purpose) => (
                      <span
                        key={purpose}
                        className="bg-brand/15 text-brand rounded-full px-3 py-1 text-sm font-semibold"
                      >
                        {purpose}
                      </span>
                    ))}
                  </Detail>

                  <Detail icon={<MapPin className="size-3.5" />} label="Khu vực thường chơi">
                    {entry.preferredAreas.map((area) => (
                      <span
                        key={area}
                        className="rounded-full border border-border bg-secondary px-3 py-1 text-sm font-medium"
                      >
                        {area}
                      </span>
                    ))}
                  </Detail>

                  <Detail
                    icon={<Star className="size-3.5" />}
                    label="Sân yêu thích"
                    className="sm:col-span-2"
                  >
                    {entry.favoriteCourts.map((court) => (
                      <span
                        key={court.id}
                        title={court.area || undefined}
                        className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-sm font-medium"
                      >
                        <MapPin className="text-brand size-3.5 shrink-0" />
                        <span className="truncate">{court.name}</span>
                      </span>
                    ))}
                  </Detail>
                </dl>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Detail({
  icon,
  label,
  className,
  children,
}: {
  icon: ReactNode;
  label: string;
  className?: string;
  children: ReactNode[];
}) {
  return (
    <div className={className}>
      <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {icon}
        {label}
      </dt>
      <dd className="mt-2 flex flex-wrap gap-2">
        {children.length > 0 ? (
          children
        ) : (
          <span className="text-sm text-muted-foreground">Chưa cập nhật</span>
        )}
      </dd>
    </div>
  );
}
