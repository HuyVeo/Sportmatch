import Link from "next/link";
import { CalendarDays, SquarePen } from "lucide-react";
import { formatSlot, groupSlotsByDay } from "@/lib/availability";
import { WEEKDAYS, WEEKDAY_SHORT, type AvailabilitySlot } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Card "Lịch rảnh": 7 ô ngày (ngày có lịch tô cam) + danh sách khung giờ. */
export function AvailabilityCard({
  slots,
  isOwnProfile,
}: {
  slots: AvailabilitySlot[];
  isOwnProfile: boolean;
}) {
  const groups = groupSlotsByDay(slots);

  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading flex items-center gap-2 text-base font-bold sm:text-lg">
          <CalendarDays className="text-brand size-5" />
          Lịch rảnh
        </h2>
        {isOwnProfile ? (
          <Link
            href="/settings#availability"
            aria-label="Chỉnh sửa lịch rảnh"
            className="text-brand hover:bg-brand/10 rounded-full p-2 transition-colors"
          >
            <SquarePen className="size-4" />
          </Link>
        ) : null}
      </div>

      <ul className="mt-4 grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((day) => {
          const active = groups.some((group) => group.day === day);
          return (
            <li
              key={day}
              title={day}
              className={cn(
                "rounded-lg py-2 text-center text-xs font-bold",
                active
                  ? "bg-brand/15 text-brand ring-brand/40 ring-1"
                  : "bg-secondary/50 text-muted-foreground/60",
              )}
            >
              {WEEKDAY_SHORT[day]}
            </li>
          );
        })}
      </ul>

      {groups.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Chưa chọn lịch rảnh.</p>
      ) : (
        <dl className="mt-4 divide-y divide-border">
          {groups.map((group) => (
            <div key={group.day} className="flex items-start gap-4 py-2.5">
              <dt className="text-brand w-8 shrink-0 text-sm font-bold">
                {WEEKDAY_SHORT[group.day]}
              </dt>
              <dd className="space-y-1 text-sm font-medium tabular-nums">
                {group.slots.map((slot) => (
                  <p key={`${slot.startMinute}-${slot.endMinute}`}>
                    {formatSlot(slot)}
                  </p>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
