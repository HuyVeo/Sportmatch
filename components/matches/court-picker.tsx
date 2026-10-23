"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Loader2, MapPin, PencilLine } from "lucide-react";
import type { CourtResult } from "@/app/(app)/courts/actions";
import { distanceKm, roundKm, type LatLng } from "@/lib/geo";
import { cn } from "@/lib/utils";

/** Số sân hiện tối đa trong danh sách — gõ tìm kiếm để thu hẹp phần còn lại. */
const MAX_OPTIONS = 50;

const MANUAL_OPTION = "manual";

function formatDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${roundKm(km)} km`;
}

/** So khớp không phân biệt hoa thường và dấu tiếng Việt ("tay ho" ↔ "Tây Hồ"). */
function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export function CourtPicker({
  disabled,
  courts,
  loading,
  error,
  reference,
  isFull,
  selectedCourt,
  manual,
  onSelectCourt,
  onSelectManual,
}: {
  disabled: boolean;
  courts: CourtResult[];
  loading: boolean;
  error: string | null;
  reference: LatLng;
  isFull: (court: CourtResult) => boolean;
  selectedCourt: CourtResult | null;
  manual: boolean;
  onSelectCourt: (court: CourtResult) => void;
  onSelectManual: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const sorted = useMemo(
    () =>
      courts
        .map((court) => ({ court, distance: distanceKm(reference, court) }))
        .sort((a, b) => a.distance - b.distance),
    [courts, reference],
  );

  const matches = useMemo(() => {
    const term = normalize(query.trim());
    if (!term) return sorted;
    return sorted.filter(({ court }) =>
      normalize(`${court.name} ${court.address}`).includes(term),
    );
  }, [sorted, query]);

  const shown = matches.slice(0, MAX_OPTIONS);
  const noneAvailable =
    !loading && sorted.every(({ court }) => isFull(court));

  // Phím mũi tên đi qua các sân chọn được + dòng "Sân khác" ở cuối.
  const optionIds = [
    ...shown.filter(({ court }) => !isFull(court)).map(({ court }) => court.id),
    MANUAL_OPTION,
  ];
  const activeId = optionIds[Math.min(activeIndex, optionIds.length - 1)];

  // Bấm ra ngoài thì đóng danh sách.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Giữ dòng đang chọn bằng bàn phím luôn nằm trong vùng nhìn thấy.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`[data-option="${CSS.escape(activeId)}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeId]);

  function openList() {
    if (disabled) return;
    setOpen(true);
    setQuery("");
    setActiveIndex(0);
  }

  function choose(id: string) {
    if (id === MANUAL_OPTION) {
      onSelectManual();
    } else {
      const court = courts.find((item) => item.id === id);
      if (!court || isFull(court)) return;
      onSelectCourt(court);
    }
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (event.key === "ArrowDown" || event.key === "Enter") {
        event.preventDefault();
        openList();
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, optionIds.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(activeId);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  const displayValue = open
    ? query
    : manual
      ? "Sân khác – tự nhập tên sân"
      : (selectedCourt?.name ?? "");

  return (
    <div ref={rootRef} className="relative mt-2">
      <MapPin className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        id="courtName"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open ? `${listId}-${activeId}` : undefined}
        autoComplete="off"
        disabled={disabled}
        value={displayValue}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
          if (!open) setOpen(true);
        }}
        onFocus={openList}
        onClick={() => !open && openList()}
        // Tab sang ô khác thì đóng danh sách; bấm chọn trong danh sách không
        // làm mất focus nhờ preventDefault ở pointerdown của từng dòng.
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        placeholder={
          disabled
            ? "Chọn môn thể thao trước để xem sân"
            : "Tìm theo tên sân hoặc địa chỉ..."
        }
        className="h-12 w-full rounded-xl border border-input bg-secondary/40 pr-11 pl-11 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand disabled:cursor-not-allowed disabled:opacity-60"
      />
      {loading ? (
        <Loader2 className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      ) : (
        <ChevronDown
          className={cn(
            "pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      )}

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          // Bấm vào danh sách (kể cả thanh cuộn) không làm input mất focus.
          onPointerDown={(event) => event.preventDefault()}
          className="absolute z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-border bg-card p-1.5 shadow-xl"
        >
          {loading && courts.length === 0 ? (
            <li className="px-3 py-3 text-sm text-muted-foreground">
              Đang tìm sân...
            </li>
          ) : shown.length === 0 ? (
            <li className="px-3 py-3 text-sm text-muted-foreground">
              {query.trim()
                ? "Không tìm thấy sân phù hợp."
                : "Chưa có sân nào của môn này quanh bạn."}
            </li>
          ) : (
            shown.map(({ court, distance }) => {
              const full = isFull(court);
              const selected = selectedCourt?.id === court.id;
              return (
                <li
                  key={court.id}
                  id={`${listId}-${court.id}`}
                  data-option={court.id}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={full}
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => choose(court.id)}
                  className={cn(
                    "flex items-start gap-3 rounded-lg px-3 py-2.5",
                    full
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:bg-secondary/60",
                    !full && activeId === court.id && "bg-secondary/60",
                    selected && "text-brand",
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {court.name}
                    </span>
                    {court.address && (
                      <span className="block truncate text-xs text-muted-foreground">
                        {court.address}
                      </span>
                    )}
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-xs text-muted-foreground">
                      {formatDistance(distance)}
                    </span>
                    {full && (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
                        Đã đủ
                      </span>
                    )}
                  </span>
                </li>
              );
            })
          )}

          {matches.length > shown.length && (
            <li className="px-3 py-2 text-xs text-muted-foreground">
              Còn {matches.length - shown.length} sân xa hơn — gõ tên để tìm.
            </li>
          )}

          <li
            id={`${listId}-${MANUAL_OPTION}`}
            data-option={MANUAL_OPTION}
            role="option"
            aria-selected={manual}
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => choose(MANUAL_OPTION)}
            className={cn(
              "mt-1 flex cursor-pointer items-center gap-3 rounded-lg border-t border-border px-3 py-2.5 hover:bg-secondary/60",
              activeId === MANUAL_OPTION && "bg-secondary/60",
              noneAvailable && "border border-brand/50 bg-brand/5",
            )}
          >
            <PencilLine className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">
                Sân khác – tự nhập tên sân
              </span>
              {noneAvailable && (
                <span className="block text-xs text-brand">
                  Không còn sân phù hợp
                </span>
              )}
            </span>
          </li>
        </ul>
      )}

      {error && (
        <p className="mt-2 text-xs text-muted-foreground">{error}</p>
      )}
    </div>
  );
}
