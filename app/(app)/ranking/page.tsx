import type { Metadata } from "next";
import {
  RankingBoard,
  type RankedPlayer,
} from "@/components/ranking/ranking-board";
import { calculateScore, getRankTier } from "@/lib/ranking";
import { getSports } from "@/lib/data/sports";
import { getCurrentUser, getUsers } from "@/lib/data/users";

export const metadata: Metadata = {
  title: "Xếp hạng · SportMatch",
};

export default async function RankingPage() {
  const [users, sports, currentUser] = await Promise.all([
    getUsers(),
    getSports(),
    getCurrentUser(),
  ]);

  const sportMap = new Map(sports.map((sport) => [sport.id, sport]));

  const players: RankedPlayer[] = users.map((user) => {
    const score = calculateScore({
      averageStars: user.averageStars,
      matchCount: user.matchCount,
      trustScore: user.trustScore,
      communityVotes: user.communityVotes,
    });

    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      avatarUrl: user.avatarUrl,
      isPro: user.isPro,
      sportIcons: user.sports.map(
        (sport) => sportMap.get(sport.sportId)?.icon ?? "🏅",
      ),
      sportIds: user.sports.map((sport) => sport.sportId),
      skillLabel: user.sports[0]?.skillLevel ?? "",
      tier: getRankTier(score.total).name,
      averageStars: user.averageStars,
      ratingCount: user.ratingCount,
      matchCount: user.matchCount,
      trustScore: user.trustScore,
      score: score.total,
    };
  });

  return (
    <RankingBoard
      players={players}
      sports={sports.map((sport) => ({ id: sport.id, name: sport.name }))}
      currentUserId={currentUser.id}
    />
  );
}
