"use client";

import { useSyncExternalStore } from "react";
import { ClubProfilePage } from "@/components/clubs/club-profile-page";
import { getCreatedClubs, getServerCreatedClubs, subscribeCreatedClubs } from "@/lib/clubs/demo-storage";
import { mockClubs } from "@/lib/clubs/mock-data";

export function ClubDetailRoute({ clubId, viewerAccess }: { clubId: string; viewerAccess?: import("@/lib/clubs/viewer-access").ClubViewerAccess }) {
  const createdClubs = useSyncExternalStore(subscribeCreatedClubs, getCreatedClubs, getServerCreatedClubs);
  const club = [...mockClubs, ...createdClubs].find((item) => item.id === clubId) ?? null;

  if (!club) {
    return <main className="mx-auto max-w-3xl px-4 py-16 text-center"><h1 className="text-xl font-bold">Không tìm thấy câu lạc bộ</h1><p className="mt-2 text-sm text-slate-600">CLB có thể đã bị xóa hoặc đường dẫn không chính xác.</p></main>;
  }

  return <ClubProfilePage club={club} viewerAccess={viewerAccess} />;
}
