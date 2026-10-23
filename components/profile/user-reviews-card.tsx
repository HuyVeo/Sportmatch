import Link from "next/link";
import { MessageSquareQuote, Star, Trophy, Users } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { UserReview } from "@/lib/data/users";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function UserReviewsCard({
  reviews,
  averageStars,
  ratingCount,
  matchCount,
  userName,
  isOwnProfile,
}: {
  reviews: UserReview[];
  averageStars: number;
  ratingCount: number;
  matchCount: number;
  userName: string;
  isOwnProfile?: boolean;
}) {
  // Ưu tiên hiển thị các đánh giá có nhận xét chi tiết lên trước
  const sortedReviews = [...reviews].sort((a, b) => {
    if (a.comment && !b.comment) return -1;
    if (!a.comment && b.comment) return 1;
    return 0;
  });

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2 className="font-heading flex items-center gap-2 text-lg font-bold">
            <MessageSquareQuote className="text-brand size-5" />
            Đánh giá từ đồng đội
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Phản hồi thực tế từ những trận đấu đã cùng tham gia.
          </p>
        </div>

        {isOwnProfile ? (
          <Link
            href="/ratings"
            className="bg-brand/10 text-brand hover:bg-brand/20 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors"
          >
            <Star className="size-3.5 fill-current" />
            Đánh giá sau trận
          </Link>
        ) : null}
      </div>

      {/* Thanh Social Proof tóm tắt theo bảng mục 4 trong tinhnangmoi.md */}
      <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-secondary/40 p-3 text-center sm:gap-4 sm:p-4">
        <div>
          <p className="text-[11px] font-medium text-muted-foreground">
            Điểm đánh giá
          </p>
          <p className="mt-1 flex items-center justify-center gap-1 text-sm font-extrabold text-amber-500 sm:text-base">
            <Star className="size-4 fill-current" />
            {averageStars > 0 ? averageStars.toFixed(1) : "0.0"}/5
          </p>
        </div>
        <div className="border-x border-border/60">
          <p className="text-[11px] font-medium text-muted-foreground">
            Lượt đánh giá
          </p>
          <p className="mt-1 flex items-center justify-center gap-1 text-sm font-extrabold text-foreground sm:text-base">
            <Users className="size-4 text-muted-foreground" />
            {ratingCount} đánh giá
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium text-muted-foreground">
            Trận đã chơi
          </p>
          <p className="mt-1 flex items-center justify-center gap-1 text-sm font-extrabold text-foreground sm:text-base">
            <Trophy className="size-4 text-brand" />
            {matchCount} trận
          </p>
        </div>
      </div>

      {/* Danh sách nhận xét gần đây */}
      <div className="mt-5">
        {sortedReviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-8 text-center">
            <span className="text-3xl">💬</span>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {isOwnProfile
                ? "Bạn chưa có nhận xét nào từ đồng đội"
                : `${userName} chưa có nhận xét nào từ đồng đội`}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
              Sau mỗi trận hoàn thành, người tham gia sẽ gửi đánh giá và nhận xét tại đây để làm bằng chứng tin cậy.
            </p>
          </div>
        ) : (
          <ul className="space-y-3.5">
            {sortedReviews.map((review) => (
              <li
                key={review.id}
                className="rounded-xl border border-border/70 bg-card/60 p-4 transition-all hover:border-brand/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <UserAvatar
                      emoji={review.reviewerAvatar}
                      src={review.reviewerAvatarUrl}
                      name={review.reviewerName}
                      className="bg-brand size-8 text-xs"
                    />
                    <div>
                      <Link
                        href={`/profile/${review.reviewerId}`}
                        className="text-xs font-semibold hover:underline"
                      >
                        {review.reviewerName}
                      </Link>
                      <p className="text-[11px] text-muted-foreground">
                        Trận &ldquo;{review.matchTitle}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "size-3",
                            star <= review.stars
                              ? "fill-current text-amber-500"
                              : "text-muted-foreground/30",
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      · {formatRelativeTime(review.createdAt)}
                    </span>
                  </div>
                </div>

                {review.comment ? (
                  <div className="mt-3 rounded-lg border-l-2 border-brand/70 bg-secondary/30 px-3 py-2 text-xs italic text-foreground">
                    &ldquo;{review.comment}&rdquo;
                    <span className="ml-1.5 not-italic text-muted-foreground">
                      – {review.reviewerName}
                    </span>
                  </div>
                ) : (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Đã chấm {review.stars}★ cho trận đấu.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
