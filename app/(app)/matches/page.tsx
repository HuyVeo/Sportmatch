import type { Metadata } from "next";
import {
  MatchesBoard,
  type MatchCardData,
} from "@/components/matches/matches-board";
import {
  countJoined,
  getMatches,
  isMatchOpenTo,
  viewerRole,
} from "@/lib/data/matches";
import { getSports } from "@/lib/data/sports";
import { getCurrentUser, getUsers } from "@/lib/data/users";

export const metadata: Metadata = {
  title: "Trận đấu · SportMatch",
};

export default async function MatchesPage() {
  const [matches, sports, users, currentUser] = await Promise.all([
    getMatches(),
    getSports(),
    getUsers(),
    getCurrentUser(),
  ]);

  const sportMap = new Map(sports.map((sport) => [sport.id, sport]));
  const userMap = new Map(users.map((user) => [user.id, user]));

  const cards: MatchCardData[] = matches.map((match) => {
    const sport = sportMap.get(match.sportId);
    const role = viewerRole(match, currentUser.id);

    return {
      id: match.id,
      title: match.title,
      sportId: match.sportId,
      sportName: sport?.name ?? match.sportId,
      sportIcon: sport?.icon ?? "🏅",
      courtName: match.courtName,
      address: match.address,
      dateTime: match.dateTime,
      visibility: match.visibility,
      skillRequirement: match.skillRequirement,
      joined: countJoined(match),
      maxPlayers: match.maxPlayers,
      participantAvatars: match.participants
        .filter((participant) => participant.status === "joined")
        .map((participant) => {
          const user = userMap.get(participant.userId);
          return {
            emoji: user?.avatar ?? "🙂",
            src: user?.avatarUrl ?? null,
            name: user?.name ?? "Người chơi",
          };
        }),
      role,
      isOpen: isMatchOpenTo(match, role),
    };
  });

  return (
    <MatchesBoard
      matches={cards}
      sports={sports.map((sport) => ({ id: sport.id, name: sport.name }))}
    />
  );
}
