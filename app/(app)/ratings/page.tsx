import type { Metadata } from "next";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { RefreshButton } from "@/components/ratings/refresh-button";
import { getMatchesJoinedBy } from "@/lib/data/matches";
import { getCurrentUser } from "@/lib/data/users";

export const metadata: Metadata = {
  title: "Đánh giá & nhận xét · SportMatch",
};

export default async function RatingsPage() {
  const currentUser = await getCurrentUser();
  const joined = await getMatchesJoinedBy(currentUser.id);
  const rateable = joined.filter((match) => match.status === "Đã hoàn tất");

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Đánh giá &amp; nhận xét
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Đánh giá đồng đội sau mỗi trận để xây dựng uy tín cộng đồng.
          </p>
        </div>
        <RefreshButton />
      </div>

      {rateable.length === 0 ? (
        <div className="mt-28 text-center">
          <p className="text-6xl">⭐</p>
          <p className="font-heading mt-6 text-xl font-bold">
            Chưa có trận nào!
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Tham gia trận đấu và được phê duyệt để bắt đầu đánh giá đồng đội.
          </p>
          <Link
            href="/matches"
            className="bg-brand-gradient shadow-brand/30 mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white shadow-xl transition-opacity hover:opacity-90"
          >
            <Trophy className="size-4" />
            Tìm trận đấu
          </Link>
        </div>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">
          {rateable.length} trận đang chờ bạn đánh giá.
        </p>
      )}
    </div>
  );
}
