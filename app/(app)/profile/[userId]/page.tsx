import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Crown,
  MapPin,
  Shield,
  SquarePen,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { AvailabilityCard } from "@/components/profile/availability-card";
import { CommunityVoteButton } from "@/components/profile/vote-button";
import { DirectMessageButton } from "@/components/profile/direct-message-button";
import { ProfileHeader } from "@/components/profile/profile-header";
import { SportProfileCard } from "@/components/profile/sport-profile-card";
import { UserReviewsCard } from "@/components/profile/user-reviews-card";
import { calculateScore, getRankTier } from "@/lib/ranking";
import { getSports } from "@/lib/data/sports";
import { hasVotedUser } from "@/app/(app)/profile/actions";
import {
  getCurrentUser,
  getMatchCompletionRate,
  getUserById,
  getUserRecentReviews,
  getUsers,
} from "@/lib/data/users";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/profile/[userId]">): Promise<Metadata> {
  const { userId } = await params;
  const user = await getUserById(userId);
  return {
    title: user ? `${user.name} · SportMatch` : "Hồ sơ · SportMatch",
  };
}

export default async function ProfilePage({
  params,
}: PageProps<"/profile/[userId]">) {
  const { userId } = await params;
  const [user, users, sports, currentUser, recentReviews] = await Promise.all([
    getUserById(userId),
    getUsers(),
    getSports(),
    getCurrentUser(),
    getUserRecentReviews(userId),
  ]);

  if (!user) notFound();

  const [completionRate, initialVoted] = await Promise.all([
    getMatchCompletionRate(user.id),
    hasVotedUser(user.id),
  ]);

  const sportMap = new Map(sports.map((sport) => [sport.id, sport]));
  const score = calculateScore({
    averageStars: user.averageStars,
    matchCount: user.matchCount,
    trustScore: user.trustScore,
    communityVotes: user.communityVotes,
  });
  const tier = getRankTier(score.total);

  const leaderboard = users
    .map((candidate) => ({
      id: candidate.id,
      total: calculateScore({
        averageStars: candidate.averageStars,
        matchCount: candidate.matchCount,
        trustScore: candidate.trustScore,
        communityVotes: candidate.communityVotes,
      }).total,
    }))
    .sort((a, b) => b.total - a.total);
  const rank = leaderboard.findIndex((entry) => entry.id === user.id) + 1;

  const breakdown = [
    {
      icon: Star,
      label: "Điểm đánh giá",
      value: score.rating,
      detail: "Sao TB × 30",
      bar: "bg-brand",
    },
    {
      icon: Trophy,
      label: "Điểm trận đấu",
      value: score.matches,
      detail: "Số trận × 1.5",
      bar: "bg-brand",
    },
    {
      icon: Shield,
      label: "Điểm uy tín",
      value: score.trust,
      detail: "Uy tín × 0.4",
      bar: "bg-teal-400",
    },
    {
      icon: Users,
      label: "Điểm cộng đồng",
      value: score.community,
      detail: "Votes × 2",
      bar: "bg-purple-400",
    },
  ];

  const trustDetails = [
    {
      label: "Độ tin cậy",
      value: user.trustScore,
      hint: "Tăng khi hoàn tất trận & nhận 4–5★; giảm khi bỏ trận",
    },
    {
      label: "Hoàn thành trận",
      value: completionRate,
      hint: `${completionRate}% trận hoàn thành thực tế (không bỏ dở giữa chừng)`,
    },
    {
      label: "Đánh giá cộng đồng",
      value: Math.min(100, user.communityVotes * 10),
      hint: `${user.communityVotes} lượt bình chọn tín nhiệm từ cộng đồng người chơi`,
    },
  ];

  const isOwnProfile = user.id === currentUser.id;

  return (
    <div className="mx-auto w-full max-w-5xl px-3.5 py-4 sm:px-6 sm:py-8">
      <ProfileHeader
        name={user.name}
        avatarEmoji={user.avatar}
        avatarUrl={user.avatarUrl}
        coverImageUrl={user.coverImageUrl}
        isOnline={user.isOnline}
        isOwnProfile={isOwnProfile}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                {user.name}
              </h1>
              <div className="flex items-center gap-2">
                <CommunityVoteButton
                  targetUserId={user.id}
                  initialVoted={initialVoted}
                  initialCount={user.communityVotes}
                  isOwnProfile={isOwnProfile}
                />
                {isOwnProfile ? (
                  <Link
                    href="/settings"
                    className="bg-brand-gradient inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90 sm:px-5 sm:py-2.5 sm:text-sm"
                  >
                    <SquarePen className="size-3.5 sm:size-4" />
                    Sửa hồ sơ
                  </Link>
                ) : (
                  <div className="shrink-0">
                    <DirectMessageButton peerId={user.id} />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground sm:mt-2">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4 shrink-0" />
                {user.area}
              </span>
              {user.isOnline ? (
                <span className="text-success flex items-center gap-1.5 font-semibold">
                  <span className="size-2 rounded-full bg-current" />
                  Online
                </span>
              ) : null}
            </div>

            {/* Social proof nhanh theo Section 4 tinhnangmoi.md */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:mt-2.5 sm:text-sm">
              <span className="inline-flex items-center gap-1 font-bold text-amber-500">
                <Star className="size-3.5 fill-current sm:size-4" />
                <span>{user.averageStars > 0 ? user.averageStars.toFixed(1) : "0.0"}/5</span>
                <span className="font-normal text-muted-foreground">
                  · {user.ratingCount} đánh giá
                </span>
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <span>🏸</span>
                <span className="font-medium text-foreground">{user.matchCount}</span> trận đã chơi
              </span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-sm text-foreground/80 sm:mt-4">
          {user.bio || "Người chơi chưa cập nhật giới thiệu cá nhân."}
        </p>

        <div className="mt-3.5 flex flex-wrap gap-2 sm:mt-4">
          {user.sports.map((entry) => {
            const sport = sportMap.get(entry.sportId);
            return (
              <div
                key={entry.sportId}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/80 px-3 py-1 text-xs font-medium sm:text-sm"
              >
                <span>{sport?.icon ?? "🏅"}</span>
                <span className="font-semibold text-foreground">
                  {sport?.name ?? entry.sportId}
                </span>
                <span className="rounded-full bg-teal-500/15 px-2 py-0.5 text-[11px] font-bold text-teal-600 dark:text-teal-400">
                  {entry.skillLevel}
                </span>
              </div>
            );
          })}
        </div>
      </ProfileHeader>

      {/* Mobile: 1 cột theo thứ tự ưu tiên ghép trận (order-*); desktop: giữ
          lưới 2 cột, cột phải mở đầu bằng Môn thể thao, cột trái bằng Lịch rảnh. */}
      <div className="mt-4 flex flex-col gap-4 sm:mt-6 sm:gap-6 lg:grid lg:grid-cols-[320px_1fr] lg:items-start">
        <div className="contents lg:block lg:space-y-6">
          <div className="order-2">
            <AvailabilityCard
              slots={user.availabilitySlots}
              isOwnProfile={isOwnProfile}
            />
          </div>

          <section className="order-3 rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-lg font-bold">Thống kê</h2>
            <dl className="mt-4">
              <StatRow
                icon={<Crown className="text-brand size-4" />}
                label="Điểm xếp hạng"
                value={String(Math.round(score.total))}
              />
              <StatRow
                icon={<Trophy className="text-brand size-4" />}
                label="Tổng trận"
                value={String(user.matchCount)}
              />
              <StatRow
                icon={<Shield className="text-brand size-4" />}
                label="Điểm uy tín"
                value={`${user.trustScore}%`}
              />
              <StatRow
                icon={<Users className="text-brand size-4" />}
                label="Số đánh giá"
                value={String(user.ratingCount)}
              />
            </dl>

            <div className="mt-6 border-t border-border pt-6 text-center">
              <p className="font-heading text-4xl font-extrabold">
                {user.averageStars.toFixed(1)}
              </p>
              <div className="mt-2 flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "size-4",
                      star <= Math.round(user.averageStars)
                        ? "fill-brand text-brand"
                        : "text-muted-foreground/40",
                    )}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                điểm đánh giá trung bình
              </p>
            </div>
          </section>
        </div>

        <div className="contents lg:block lg:space-y-6">
          <div className="order-1">
            <SportProfileCard
              sports={user.sports}
              sportMap={sportMap}
              isOwnProfile={isOwnProfile}
            />
          </div>

          <div className="order-4">
            <UserReviewsCard
              reviews={recentReviews}
              averageStars={user.averageStars}
              ratingCount={user.ratingCount}
              matchCount={user.matchCount}
              userName={user.name}
              isOwnProfile={isOwnProfile}
            />
          </div>

          <section className="order-5 rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-heading flex items-center gap-2 text-lg font-bold">
                  <Crown className="text-brand size-5" />
                  Xếp hạng
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Hạng tổng thể:{" "}
                  <span className="font-semibold text-foreground">#{rank}</span>
                </p>
              </div>
              <span className="bg-secondary flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                <Crown className="size-3" />
                {tier.name}
              </span>
            </div>

            <div className="mt-6 text-center">
              <p className="font-heading text-brand text-5xl font-extrabold">
                {Math.round(score.total)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                điểm xếp hạng tổng
              </p>
            </div>

            <div className="mt-6 rounded-2xl bg-secondary/40 p-5">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Cách tính điểm xếp hạng
              </p>
              <ul className="mt-4 space-y-4">
                {breakdown.map((item) => (
                  <li key={item.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium">
                        <item.icon className="size-4 text-muted-foreground" />
                        {item.label}
                      </span>
                      <span className="text-brand font-bold">
                        +{Math.round(item.value)}
                      </span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
                      <div
                        className={cn("h-full rounded-full", item.bar)}
                        style={{
                          width: `${
                            score.total > 0
                              ? Math.round((item.value / score.total) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {item.detail}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm font-bold">Tổng điểm</span>
                <span className="text-brand font-bold">
                  {Math.round(score.total)}
                </span>
              </div>
            </div>

            <Link
              href="/ranking"
              className="border-brand text-brand hover:bg-brand/10 mt-5 flex items-center justify-center rounded-full border py-3 text-sm font-semibold transition-colors"
            >
              Xem bảng xếp hạng
            </Link>
          </section>

          <section className="order-6 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold">Chi tiết uy tín</h2>
              <span className="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-xs font-semibold text-teal-600 dark:text-teal-400">
                Hệ thống đánh giá thực tế
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Điểm số tự động điều chỉnh dựa trên lịch sử thi đấu và tương tác cộng đồng.
            </p>
            <ul className="mt-5 space-y-5">
              {trustDetails.map((item) => (
                <li key={item.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="font-bold text-foreground">{item.value}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="bg-brand-gradient h-full rounded-full"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">{item.hint}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3.5 last:border-0">
      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
