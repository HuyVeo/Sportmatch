"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { CLUB_SPORTS, type ClubSport } from "@/lib/clubs/mock-data";

export function CreateClubPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function createClub(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const sportType = String(formData.get("sportType") ?? "Cầu lông") as ClubSport;
    const area = String(formData.get("area") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const capacity = Math.max(2, Number(formData.get("capacity") ?? 20));
    const fee = Math.max(0, Number(formData.get("fee") ?? 0));
    const schedule = formData.getAll("schedule").map(String);

    if (!name || !area || !description) {
      setError("Vui lòng điền đầy đủ tên CLB, khu vực và giới thiệu.");
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, sportType, area, description, capacity, fee, schedule }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Không thể tạo câu lạc bộ.");
        setIsSaving(false);
        return;
      }

      router.push(`/clubs/${result.id}`);
      router.refresh();
    } catch {
      setError("Không thể lưu CLB trên trình duyệt này. Hãy thử lại.");
      setIsSaving(false);
    }
  }

  const backHref = "/clubs";

  return <main className="min-h-screen bg-slate-50 px-4 py-7 text-slate-900 md:px-6"><div className="mx-auto max-w-3xl"><Link href={backHref} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-orange-600"><ArrowLeft className="size-4" /> Quay lại danh sách</Link><div className="mt-5 rounded-xl border border-slate-200 bg-white p-5 md:p-7"><p className="text-sm font-semibold text-orange-600">Cộng đồng SportMatch</p><h1 className="mt-1 text-2xl font-bold">Tạo câu lạc bộ</h1><p className="mt-2 text-sm text-slate-600">Bắt đầu xây dựng đội nhóm, tuyển thành viên và lên lịch hoạt động.</p>
    <form onSubmit={createClub} className="mt-6 space-y-5"><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold">Tên CLB<input name="name" required maxLength={80} className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-200 px-3 font-normal outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" placeholder="VD: Cầu Lông Sunrise" /></label><label className="block text-sm font-semibold">Môn thể thao<select name="sportType" className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 font-normal outline-none focus:border-orange-400">{CLUB_SPORTS.map((sport) => <option key={sport}>{sport}</option>)}</select></label></div>
      <label className="block text-sm font-semibold">Khu vực<input name="area" required className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-200 px-3 font-normal outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" placeholder="Quận/Huyện, Tỉnh/Thành phố" /></label>
      <label className="block text-sm font-semibold">Giới thiệu<textarea name="description" required rows={4} maxLength={500} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" placeholder="Mục tiêu, cách sinh hoạt và điều CLB đang tìm kiếm..." /></label>
      <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold">Sức chứa tối đa<input name="capacity" type="number" min={2} max={200} defaultValue={20} className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-200 px-3 font-normal" /></label><label className="block text-sm font-semibold">Phí mỗi buổi (đ)<input name="fee" type="number" min={0} step={5000} defaultValue={0} className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-200 px-3 font-normal" /></label></div>
      <fieldset><legend className="text-sm font-semibold">Lịch sinh hoạt</legend><div className="mt-2 flex flex-wrap gap-2">{["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => <label key={day} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"><input type="checkbox" name="schedule" value={day} className="accent-orange-500" />{day}</label>)}</div></fieldset>
      {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
      <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4"><Link href={backHref} className="inline-flex min-h-11 items-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600">Hủy</Link><button type="submit" disabled={isSaving} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-70"><Plus className="size-4" />{isSaving ? "Đang tạo..." : "Tạo CLB"}</button></div>
    </form></div></div></main>;
}
