import type { Metadata } from "next";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { getSports } from "@/lib/data/sports";
import { getCurrentUser } from "@/lib/data/users";

export const metadata: Metadata = {
  title: "Cài đặt tài khoản · SportMatch",
};

export default async function SettingsPage() {
  const [currentUser, sports] = await Promise.all([
    getCurrentUser(),
    getSports(),
  ]);

  return (
    <SettingsPanel
      user={{
        name: currentUser.name,
        avatar: currentUser.avatar,
        avatarUrl: currentUser.avatarUrl,
        area: currentUser.area,
        gender: currentUser.gender,
        birthday: currentUser.birthday,
        bio: currentUser.bio,
        sports: currentUser.sports,
        availabilitySlots: currentUser.availabilitySlots,
      }}
      sports={sports}
    />
  );
}
