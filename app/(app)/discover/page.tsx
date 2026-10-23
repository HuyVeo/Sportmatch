import type { Metadata } from "next";
import type { DiscoverUser } from "@/components/discover/discover-board";
import { DiscoverExperience } from "@/components/discover/discover-experience";
import { calculateAge } from "@/lib/format";
import { getSports } from "@/lib/data/sports";
import { getCurrentUser, getUsers } from "@/lib/data/users";

export const metadata: Metadata = {
  title: "Khám phá · SportMatch",
};

export default async function DiscoverPage() {
  const currentUser = await getCurrentUser();
  const [users, sports] = await Promise.all([
    getUsers({ lat: currentUser.lat, lng: currentUser.lng }),
    getSports(),
  ]);

  const sportMap = new Map(sports.map((sport) => [sport.id, sport]));

  const candidates: DiscoverUser[] = users
    .filter((user) => user.id !== currentUser.id)
    .map((user) => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      avatarUrl: user.avatarUrl,
      coverImageUrl: user.coverImageUrl,
      bio: user.bio,
      area: user.area,
      distanceKm: user.distanceKm,
      isOnline: user.isOnline,
      gender: user.gender,
      age: calculateAge(user.birthday),
      trustScore: user.trustScore,
      averageStars: user.averageStars,
      matchCount: user.matchCount,
      availability: user.availability,
      sports: user.sports.map((sport) => ({
        id: sport.sportId,
        name: sportMap.get(sport.sportId)?.name ?? sport.sportId,
        icon: sportMap.get(sport.sportId)?.icon ?? "🏅",
        skillLevel: sport.skillLevel,
      })),
    }));

  return (
    <DiscoverExperience
      users={candidates}
      sports={sports}
      myAvailability={currentUser.availability}
    />
  );
}
