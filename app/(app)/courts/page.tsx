import type { Metadata } from "next";
import { CourtsBoard } from "@/components/courts/courts-board";
import { getSports } from "@/lib/data/sports";
import { getCurrentUser } from "@/lib/data/users";

export const metadata: Metadata = {
  title: "Sân bãi · SportMatch",
};

// Hồ sơ chưa có toạ độ → tạm dùng trung tâm Hà Nội tới khi định vị xong.
const DEFAULT_CENTER = { lat: 21.0285, lng: 105.8542 };

export default async function CourtsPage() {
  const [sports, currentUser] = await Promise.all([
    getSports(),
    getCurrentUser(),
  ]);

  // Việc tìm sân (OpenStreetMap có thể mất vài giây) do trình duyệt tự làm sau
  // khi trang hiện ra: quanh khu vực trong hồ sơ trước, rồi quanh vị trí thật.
  const hasCoords = currentUser.lat !== 0 || currentUser.lng !== 0;
  const origin = hasCoords
    ? { lat: currentUser.lat, lng: currentUser.lng }
    : DEFAULT_CENTER;
  const defaultSportId =
    currentUser.sports.find((entry) =>
      sports.some((sport) => sport.id === entry.sportId),
    )?.sportId ?? "all";

  return (
    <CourtsBoard
      sports={sports}
      origin={origin}
      defaultSportId={defaultSportId}
    />
  );
}
