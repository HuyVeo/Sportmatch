import type { Metadata } from "next";
import {
  CreateMatchForm,
  type InvitableUser,
} from "@/components/matches/create-match-form";
import { getSports } from "@/lib/data/sports";
import { getCurrentUser, getUsers } from "@/lib/data/users";

export const metadata: Metadata = {
  title: "Tạo trận đấu · SportMatch",
};

const DEFAULT_CENTER = { lat: 21.0285, lng: 105.8542 };

export default async function CreateMatchPage() {
  const [sports, users, currentUser] = await Promise.all([
    getSports(),
    getUsers(),
    getCurrentUser(),
  ]);

  const invitable: InvitableUser[] = users
    .filter((user) => user.id !== currentUser.id)
    .map((user) => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      avatarUrl: user.avatarUrl,
      area: user.area,
      sportIds: user.sports.map((sport) => sport.sportId),
      skillLabel: user.sports.map((sport) => sport.skillLevel).join(" · "),
    }));

  // Như trang Sân bãi: hồ sơ chưa có toạ độ → tạm dùng trung tâm Hà Nội,
  // trình duyệt sẽ tự định vị lại sau khi trang hiện ra.
  const hasCoords = currentUser.lat !== 0 || currentUser.lng !== 0;
  const origin = hasCoords
    ? { lat: currentUser.lat, lng: currentUser.lng }
    : DEFAULT_CENTER;

  return <CreateMatchForm sports={sports} users={invitable} origin={origin} />;
}
