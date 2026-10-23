"use client";

import { Plus, Trash2 } from "lucide-react";
import { minutesToTime, timeToMinutes, DAY_END_MINUTE } from "@/lib/availability";
import { WEEKDAYS, WEEKDAY_SHORT, type Weekday } from "@/lib/types";
import { cn } from "@/lib/utils";

export type SlotRow = { key: string; day: Weekday; start: string; end: string };

let keySeed = 0;
export function newSlotKey() {
  keySeed += 1;
  return `slot-${keySeed}`;
}

const timeInput =
  "h-11 w-full min-w-0 rounded-xl border bg-secondary/40 px-2.5 text-sm sm:px-3 tabular-nums outline-none transition-colors focus:border-brand dark:[color-scheme:dark] max-sm:[&::-webkit-calendar-picker-indicator]:hidden";

/** Khung mặc định khi thêm: ngay sau khung cuối của ngày, dài 2 giờ. */
function nextSlot(day: Weekday, rows: SlotRow[]): SlotRow {
  const last = rows.filter((row) => row.day === day).at(-1);
  const lastEnd = last ? timeToMinutes(last.end) : null;
  const start = lastEnd ?? 18 * 60;
  const end = Math.min(start + (last ? 120 : 180), DAY_END_MINUTE);
  return {
    key: newSlotKey(),
    day,
    start: minutesToTime(Math.min(start, DAY_END_MINUTE)),
    end: minutesToTime(end),
  };
}

/**
 * Section "Lịch rảnh" trong Cài đặt: chọn ngày, mỗi ngày nhiều khung giờ.
 * `errors` cùng thứ tự với `value` (tính bằng `validateSlotDrafts`).
 */
export function AvailabilityEditor({
  value,
  errors,
  onChange,
}: {
  value: SlotRow[];
  errors: (string | null)[];
  onChange: (value: SlotRow[]) => void;
}) {
  const activeDays = WEEKDAYS.filter((day) =>
    value.some((row) => row.day === day),
  );

  function toggleDay(day: Weekday) {
    onChange(
      activeDays.includes(day)
        ? value.filter((row) => row.day !== day)
        : [...value, nextSlot(day, value)],
    );
  }

  function updateRow(key: string, patch: Partial<SlotRow>) {
    onChange(value.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  return (
    <div className="mt-5">
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {WEEKDAYS.map((day) => {
          const active = activeDays.includes(day);
          return (
            <button
              key={day}
              type="button"
              aria-pressed={active}
              aria-label={day}
              onClick={() => toggleDay(day)}
              className={cn(
                "rounded-xl border py-2.5 text-sm font-bold transition-colors",
                active
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border text-muted-foreground hover:border-brand/50 hover:text-foreground",
              )}
            >
              {WEEKDAY_SHORT[day]}
            </button>
          );
        })}
      </div>
      <p className="mt-2.5 text-xs text-muted-foreground">
        Bấm vào ngày để thêm hoặc bỏ. Một ngày có thể có nhiều khung giờ.
      </p>

      {activeDays.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">
          Chưa có lịch rảnh. Chọn ngày ở trên để thêm khung giờ.
        </p>
      ) : (
        <div className="mt-5 divide-y divide-border sm:space-y-3 sm:divide-y-0">
          {activeDays.map((day) => (
            // Mobile bỏ khung/padding để 2 ô giờ đủ rộng; từ sm trở lên mới đóng khung.
            <div
              key={day}
              className="py-4 first:pt-0 sm:rounded-2xl sm:border sm:border-border sm:p-4 sm:first:pt-4"
            >
              <p className="text-sm font-bold">{day}</p>
              <div className="mt-3 space-y-3">
                {value.map((row, index) =>
                  row.day === day ? (
                    <div key={row.key}>
                      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-center gap-1.5 sm:gap-2">
                        <input
                          type="time"
                          step={900}
                          aria-label={`${day} — giờ bắt đầu`}
                          aria-invalid={Boolean(errors[index])}
                          value={row.start}
                          onChange={(event) =>
                            updateRow(row.key, { start: event.target.value })
                          }
                          className={cn(
                            timeInput,
                            errors[index] ? "border-destructive" : "border-input",
                          )}
                        />
                        <span className="shrink-0 text-muted-foreground">→</span>
                        <input
                          type="time"
                          step={900}
                          aria-label={`${day} — giờ kết thúc`}
                          aria-invalid={Boolean(errors[index])}
                          value={row.end}
                          onChange={(event) =>
                            updateRow(row.key, { end: event.target.value })
                          }
                          className={cn(
                            timeInput,
                            errors[index] ? "border-destructive" : "border-input",
                          )}
                        />
                        <button
                          type="button"
                          aria-label="Xoá khung giờ"
                          onClick={() =>
                            onChange(value.filter((item) => item.key !== row.key))
                          }
                          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive sm:p-2.5"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      {errors[index] ? (
                        <p
                          role="alert"
                          data-slot-error
                          className="text-destructive mt-1.5 text-xs font-medium"
                        >
                          {errors[index]}
                        </p>
                      ) : null}
                    </div>
                  ) : null,
                )}
              </div>
              <button
                type="button"
                onClick={() => onChange([...value, nextSlot(day, value)])}
                className="text-brand hover:bg-brand/10 mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors"
              >
                <Plus className="size-4" />
                Thêm khung giờ
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
