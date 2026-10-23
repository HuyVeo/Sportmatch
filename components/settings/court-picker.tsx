"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search, X } from "lucide-react";
import { searchCourtsAction } from "@/app/(app)/settings/actions";
import { MAX_FAVORITE_COURTS } from "@/lib/areas";
import type { FavoriteCourt } from "@/lib/types";

/**
 * Chọn sân yêu thích từ danh sách sân có sẵn trong DB (lọc theo môn). Không
 * có ô nhập tự do — chỉ chọn được sân tìm thấy.
 */
export function CourtPicker({
  sportId,
  value,
  onChange,
}: {
  sportId: string;
  value: FavoriteCourt[];
  onChange: (courts: FavoriteCourt[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<FavoriteCourt[]>([]);
  const requestId = useRef(0);
  const full = value.length >= MAX_FAVORITE_COURTS;

  useEffect(() => {
    if (!open) return;
    const id = ++requestId.current;
    const timer = setTimeout(() => {
      setLoading(true);
      searchCourtsAction(sportId, query)
        .then((courts) => {
          if (id === requestId.current) setResults(courts);
        })
        .catch(() => {
          if (id === requestId.current) setResults([]);
        })
        .finally(() => {
          if (id === requestId.current) setLoading(false);
        });
    }, 250);
    return () => clearTimeout(timer);
  }, [open, query, sportId]);

  const options = results.filter(
    (court) => !value.some((selected) => selected.id === court.id),
  );

  return (
    <div>
      {value.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {value.map((court) => (
            <span
              key={court.id}
              className="bg-brand/10 text-brand inline-flex max-w-full items-center gap-1.5 rounded-full py-1.5 pr-1.5 pl-3.5 text-sm font-semibold"
            >
              <span className="truncate">{court.name}</span>
              <button
                type="button"
                aria-label={`Bỏ ${court.name}`}
                onClick={() =>
                  onChange(value.filter((item) => item.id !== court.id))
                }
                className="hover:bg-brand/20 rounded-full p-1 transition-colors"
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          disabled={full}
          placeholder={
            full
              ? `Đã chọn tối đa ${MAX_FAVORITE_COURTS} sân`
              : "Tìm sân..."
          }
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          className="h-11 w-full rounded-xl border border-input bg-secondary/40 pr-10 pl-10 text-sm outline-none transition-colors focus:border-brand disabled:opacity-60"
        />
        {loading ? (
          <Loader2 className="absolute top-1/2 right-4 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}

        {open && !full ? (
          <ul
            role="listbox"
            className="absolute inset-x-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-xl shadow-black/30"
          >
            {options.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-muted-foreground">
                {loading ? "Đang tìm sân..." : "Không tìm thấy sân phù hợp."}
              </li>
            ) : (
              options.map((court) => (
                <li key={court.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    // Giữ focus ở ô tìm kiếm để onBlur không đóng list trước khi chọn.
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onChange([...value, court]);
                      setQuery("");
                    }}
                    className="flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-secondary"
                  >
                    <MapPin className="text-brand mt-0.5 size-4 shrink-0" />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {court.name}
                      </span>
                      {court.area ? (
                        <span className="block truncate text-xs text-muted-foreground">
                          {court.area}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
