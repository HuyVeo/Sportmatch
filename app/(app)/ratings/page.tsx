import type { Metadata } from "next";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { RateableMatchItem } from "@/components/ratings/rateable-match-item";
import { RefreshButton } from "@/components/ratings/refresh-button";
import { getRateableMatches } from "@/lib/data/ratings";
import { getCurrentUser } from "@/lib/data/users";

export const metadata: Metadata = {
  title: "Đánh giá & nhận xét · SportMatch",
};

export default async function RatingsPage() {
  const currentUser = await getCurrentUser();
  const rateableMatches = await getRateableMatches(currentUser.id);

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

      {rateableMatches.length === 0 ? (
        <div className="mt-24 text-center">
          <p className="text-6xl">⭐</p>
          <p className="font-heading mt-6 text-xl font-bold">
            Chưa có trận nào cần đánh giá!
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Tham gia các trận đấu và hoàn tất trận để bắt đầu đánh giá đồng đội.
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
        <div className="mt-8 space-y-6">
          <p className="text-sm text-muted-foreground">
            Có <strong>{rateableMatches.length}</strong> trận đấu đã hoàn tất sẵn sàng để bạn chấm sao và nhận xét.
          </p>
          <div className="space-y-4">
            {rateableMatches.map((item) => (
              <RateableMatchItem key={item.id} match={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
