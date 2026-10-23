"use client";

import { useState, type ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { CourtPicker } from "@/components/settings/court-picker";
import { MAX_PREFERRED_AREAS, PLAY_AREAS } from "@/lib/areas";
import {
  PLAY_PURPOSES,
  SKILL_LEVELS,
  type PlayPurpose,
  type UserSport,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type SportOption = { id: string; name: string; icon: string };

const chip =
  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors";
const chipOn = "border-brand bg-brand/10 text-brand";
const chipOff = "border-border hover:border-brand/50";

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item)
    ? list.filter((value) => value !== item)
    : [...list, item];
}

/** Section "Môn thể thao và trình độ" trong Cài đặt — mỗi môn một card. */
export function SportProfileEditor({
  sports,
  value,
  onChange,
}: {
  sports: SportOption[];
  value: UserSport[];
  onChange: (value: UserSport[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const available = sports.filter(
    (sport) => !value.some((entry) => entry.sportId === sport.id),
  );

  function update(sportId: string, patch: Partial<UserSport>) {
    onChange(
      value.map((entry) =>
        entry.sportId === sportId ? { ...entry, ...patch } : entry,
      ),
    );
  }

  function add(sportId: string) {
    onChange([
      ...value,
      {
        sportId,
        skillLevel: "Mới chơi",
        purposes: [],
        preferredAreas: [],
        favoriteCourts: [],
      },
    ]);
    setAdding(false);
  }

  return (
    <div className="mt-5 space-y-4">
      {value.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Chưa có môn thể thao nào. Thêm môn để người chơi khác tìm thấy bạn.
        </p>
      ) : null}

      {value.map((entry) => {
        const sport = sports.find((option) => option.id === entry.sportId);
        return (
          <div
            key={entry.sportId}
            className="rounded-2xl border border-border bg-secondary/30 p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-heading flex items-center gap-2 text-base font-bold">
                <span className="text-2xl">{sport?.icon ?? "🏅"}</span>
                {sport?.name ?? entry.sportId}
              </p>
              <button
                type="button"
                onClick={() =>
                  onChange(value.filter((item) => item.sportId !== entry.sportId))
                }
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
                Xoá môn
              </button>
            </div>

            <Field label="Trình độ">
              {SKILL_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => update(entry.sportId, { skillLevel: level })}
                  className={cn(
                    "rounded-xl border px-4 py-2 text-sm font-semibold transition-colors",
                    entry.skillLevel === level
                      ? "border-success/50 bg-success-muted text-success"
                      : "border-border hover:border-brand/50",
                  )}
                >
                  {level}
                </button>
              ))}
            </Field>

            <Field label="Mục đích chơi" hint="Chọn một hoặc nhiều">
              {PLAY_PURPOSES.map((purpose) => (
                <button
                  key={purpose}
                  type="button"
                  aria-pressed={entry.purposes.includes(purpose)}
                  onClick={() =>
                    update(entry.sportId, {
                      purposes: toggle<PlayPurpose>(entry.purposes, purpose),
                    })
                  }
                  className={cn(
                    chip,
                    entry.purposes.includes(purpose) ? chipOn : chipOff,
                  )}
                >
                  {purpose}
                </button>
              ))}
            </Field>

            <Field
              label="Khu vực thường chơi"
              hint={`${entry.preferredAreas.length}/${MAX_PREFERRED_AREAS} khu vực`}
            >
              {PLAY_AREAS.map((area) => {
                const selected = entry.preferredAreas.includes(area);
                const blocked =
                  !selected &&
                  entry.preferredAreas.length >= MAX_PREFERRED_AREAS;
                return (
                  <button
                    key={area}
                    type="button"
                    aria-pressed={selected}
                    disabled={blocked}
                    onClick={() =>
                      update(entry.sportId, {
                        preferredAreas: toggle<string>(
                          entry.preferredAreas,
                          area,
                        ),
                      })
                    }
                    className={cn(
                      chip,
                      "px-3.5 py-1.5",
                      selected ? chipOn : chipOff,
                      blocked && "opacity-40",
                    )}
                  >
                    {area}
                  </button>
                );
              })}
            </Field>

            <div className="mt-5">
              <p className="text-sm font-medium">
                Sân yêu thích{" "}
                <span className="font-normal text-muted-foreground">
                  (không bắt buộc)
                </span>
              </p>
              <div className="mt-2.5">
                <CourtPicker
                  sportId={entry.sportId}
                  value={entry.favoriteCourts}
                  onChange={(favoriteCourts) =>
                    update(entry.sportId, { favoriteCourts })
                  }
                />
              </div>
            </div>
          </div>
        );
      })}

      {available.length > 0 ? (
        adding ? (
          <div className="rounded-2xl border border-dashed border-border p-5">
            <p className="text-sm font-medium">Chọn môn thể thao</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {available.map((sport) => (
                <button
                  key={sport.id}
                  type="button"
                  onClick={() => add(sport.id)}
                  className={cn(chip, chipOff)}
                >
                  <span>{sport.icon}</span>
                  {sport.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                Huỷ
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="border-brand text-brand hover:bg-brand/10 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            <Plus className="size-4" />
            Thêm môn thể thao
          </button>
        )
      ) : null}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-5">
      <p className="text-sm font-medium">
        {label}
        {hint ? (
          <span className="font-normal text-muted-foreground"> · {hint}</span>
        ) : null}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
