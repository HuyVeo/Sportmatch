import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { CLUB_SPORTS, type ClubLevel, type ClubSport } from "@/lib/clubs/mock-data";

export type SportFilter = "Tất cả" | ClubSport;
export type FilterValue = {
  sport: SportFilter;
  location: string;
  level: "Tất cả" | ClubLevel;
  time: "Tất cả" | "Sáng" | "Chiều" | "Tối" | "Cuối tuần";
  recruitment: "Tất cả" | "Đang tuyển" | "Đã đủ thành viên";
  fee: "Tất cả" | "Miễn phí" | "Dưới 50.000đ" | "50.000–100.000đ" | "Trên 100.000đ";
};

const filterSelects = [
  { key: "level", label: "Trình độ", options: ["Tất cả", "Người mới", "Cơ bản", "Trung bình", "Nâng cao"] },
  { key: "time", label: "Thời gian", options: ["Tất cả", "Sáng", "Chiều", "Tối", "Cuối tuần"] },
  { key: "recruitment", label: "Tình trạng CLB", options: ["Tất cả", "Đang tuyển", "Đã đủ thành viên"] },
  { key: "fee", label: "Mức phí", options: ["Tất cả", "Miễn phí", "Dưới 50.000đ", "50.000–100.000đ", "Trên 100.000đ"] },
] as const;

export function SidebarFilter({
  value,
  onChange,
  onReset,
}: {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  onReset: () => void;
}) {
  const update = <Key extends keyof FilterValue>(key: Key, nextValue: FilterValue[Key]) => {
    onChange({ ...value, [key]: nextValue });
  };

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-900">
          <SlidersHorizontal className="size-4 text-orange-500" />
          <h2 className="text-sm font-bold">Bộ lọc CLB</h2>
        </div>
        <button type="button" onClick={onReset} className="text-xs font-semibold text-orange-600 hover:text-orange-700">
          Xóa bộ lọc
        </button>
      </div>

      <div className="mt-5">
        <label htmlFor="club-sport-filter" className="mb-2 block text-xs font-semibold text-slate-600">Bộ môn</label>
        <select id="club-sport-filter" value={value.sport} onChange={(event) => update("sport", event.target.value as SportFilter)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100">
          <option value="Tất cả">Tất cả bộ môn</option>
          {CLUB_SPORTS.map((sport) => <option key={sport} value={sport}>{sport}</option>)}
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor="club-location-filter" className="mb-2 block text-xs font-semibold text-slate-600">Khu vực</label>
        <input id="club-location-filter" type="search" value={value.location} onChange={(event) => update("location", event.target.value)} placeholder="Tên quận, huyện hoặc thành phố" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
      </div>

      <div className="mt-4 space-y-4">
        {filterSelects.map(({ key, label, options }) => (
          <div key={key}>
            <label htmlFor={`club-${key}-filter`} className="mb-2 block text-xs font-semibold text-slate-600">{label}</label>
            <select id={`club-${key}-filter`} value={value[key]} onChange={(event) => update(key, event.target.value as FilterValue[typeof key])} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100">
              {options.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
        ))}
      </div>

      <button type="button" onClick={onReset} className="mt-5 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
        <RotateCcw className="size-4" />
        Đặt lại bộ lọc
      </button>
    </aside>
  );
}
