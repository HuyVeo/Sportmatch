import { ExploreClubsPage } from "@/components/clubs/explore-clubs-page";
import { getDatabaseClubs } from "@/lib/clubs/database";

export default async function ExploreClubsRoutePage() {
  const persistentClubs = await getDatabaseClubs();
  return <ExploreClubsPage persistentClubs={persistentClubs} />;
}
