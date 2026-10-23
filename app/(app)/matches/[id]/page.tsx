import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Crown,
  Globe,
  MapPin,
  Target,
  UserPlus,
  Users,
} from "lucide-react";
import {
  MatchDetailActions,
  ReviewRequestActions,
} from "@/components/matches/match-actions";
import {
  canViewMatch,
  countJoined,
  getMatchById,
  isMatchOpenTo,
  viewerRole,
} from "@/lib/data/matches";
import { UserAvatar } from "@/components/ui/user-avatar";
import { getSports } from "@/lib/data/sports";
import { getCurrentUser, getUsers } from "@/lib/data/users";
import { formatDateTime } from "@/lib/format";
import type { User } from "@/lib/types";

export async function generateMetadata({
  params,
}: PageProps<"/matches/[id]">): Promise<Metadata> {
  const { id } = await params;
  const [match, currentUser] = await Promise.all([
    getMatchById(id),
    getCurrentUser(),
  ]);
  // Metadata được resolve độc lập với notFound() của trang, nên phải tự kiểm
  // quyền — nếu không, <title> sẽ lộ tên trận riêng tư.
  const visible = match && canViewMatch(match, viewerRole(match, currentUser.id));
  return {
    title: visible ? `${match.title} · SportMatch` : "Trận đấu · SportMatch",
  };
}

export default async function MatchDetailPage({
  params,
}: PageProps<"/matches/[id]">) {
  const { id } = await params;
  const [match, currentUser] = await Promise.all([
    getMatchById(id),
    getCurrentUser(),
  ]);

  if (!match) notFound();
  const role = viewerRole(match, currentUser.id);
  if (!canViewMatch(match, role)) notFound();

  const [users, sports] = await Promise.all([getUsers(), getSports()]);
  const userMap = new Map(users.map((user) => [user.id, user]));
  const sport = sports.find((item) => item.id === match.sportId);

  const byStatus = (status: "joined" | "requested" | "invited") =>
    match.participants
      .filter((participant) => participant.status === status)
      .map((participant) => userMap.get(participant.userId))
      .filter((user): user is User => Boolean(user));

  const joined = byStatus("joined");
  const requests = byStatus("requested");
  const invited = byStatus("invited");

  const joinedCount = countJoined(match);
  const remaining = match.maxPlayers - joinedCount;
  const isFull = remaining <= 0;
  const isOpen = isMatchOpenTo(match, role);
  const isHost = role === "host";
  const host = userMap.get(match.hostId);

  const details = [
    { icon: CalendarDays, label: "Thời gian", value: formatDateTime(match.dateTime) },
    { icon: MapPin, label: "Sân", value: match.courtName },
    { icon: MapPin, label: "Địa chỉ", value: match.address || "Chưa cập nhật" },
    { icon: Globe, label: "Quyền hiển thị", value: match.visibility },
    { icon: Target, label: "Trình độ yêu cầu", value: match.skillRequirement },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <Link
        href="/matches"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Trận đấu
      </Link>

      <section className="from-brand/20 mt-6 rounded-3xl bg-gradient-to-br via-card to-card p-8">
        <div className="flex flex-wrap items-start gap-5">
          <span className="bg-brand-gradient flex size-16 shrink-0 items-center justify-center rounded-2xl text-3xl">
            {sport?.icon ?? "🏅"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                {match.status}
              </span>
              {isFull ? (
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                  Đã đủ
                </span>
              ) : (
                <span className="bg-success-muted text-success rounded-full px-3 py-1 text-xs font-semibold">
                  Còn chỗ
                </span>
              )}
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
              {match.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {sport?.name ?? match.sportId}
              {host ? (
                <>
                  {" · Chủ trận "}
                  <Link
                    href={`/profile/${host.id}`}
                    className="font-semibold text-foreground hover:underline"
                  >
                    {host.name}
                  </Link>
                </>
              ) : null}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <MatchDetailActions
            matchId={match.id}
            role={role}
            isFull={isFull}
            isOpen={isOpen}
            isUpcoming={match.status === "Sắp diễn ra"}
          />
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-lg font-bold">Thông tin trận</h2>
            <dl className="mt-4">
              {details.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 border-b border-border py-3.5 last:border-0"
                >
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <item.icon className="text-brand size-4" />
                    {item.label}
                  </dt>
                  <dd className="text-right text-sm font-semibold">{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-lg font-bold">Mô tả</h2>
            <p className="mt-3 text-sm whitespace-pre-line text-muted-foreground">
              {match.description || "Chủ trận chưa thêm mô tả."}
            </p>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between text-sm">
              <h2 className="font-heading flex items-center gap-2 text-lg font-bold">
                <Users className="text-brand size-5" />
                Người tham gia
              </h2>
              <span className="text-muted-foreground">
                {joinedCount}/{match.maxPlayers} người
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="bg-brand-gradient h-full rounded-full"
                style={{
                  width: `${Math.min(100, (joinedCount / match.maxPlayers) * 100)}%`,
                }}
              />
            </div>
            {remaining > 0 ? (
              <p className="text-brand mt-2 text-right text-sm font-semibold">
                Còn {remaining} chỗ
              </p>
            ) : null}

            <ul className="mt-4 space-y-3">
              {joined.map((user) => (
                <PlayerRow key={user.id} user={user}>
                  {user.id === match.hostId ? (
                    <span className="bg-brand/15 text-brand flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold">
                      <Crown className="size-3" />
                      Chủ trận
                    </span>
                  ) : null}
                </PlayerRow>
              ))}
            </ul>
          </section>

          {isHost && requests.length > 0 ? (
            <section className="rounded-2xl border border-brand/40 bg-card p-6">
              <h2 className="font-heading flex items-center gap-2 text-lg font-bold">
                <UserPlus className="text-brand size-5" />
                Yêu cầu tham gia ({requests.length})
              </h2>
              <ul className="mt-4 space-y-3">
                {requests.map((user) => (
                  <PlayerRow key={user.id} user={user}>
                    <ReviewRequestActions
                      matchId={match.id}
                      requesterId={user.id}
                      canApprove={isOpen && !isFull}
                    />
                  </PlayerRow>
                ))}
              </ul>
            </section>
          ) : null}

          {isHost && invited.length > 0 ? (
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-heading text-lg font-bold">
                Đã mời ({invited.length})
              </h2>
              <ul className="mt-4 space-y-3">
                {invited.map((user) => (
                  <PlayerRow key={user.id} user={user}>
                    <span className="text-xs text-muted-foreground">Chờ phản hồi</span>
                  </PlayerRow>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PlayerRow({
  user,
  children,
}: {
  user: User;
  children?: ReactNode;
}) {
  return (
    <li className="flex items-center gap-3">
      <UserAvatar
        emoji={user.avatar}
        src={user.avatarUrl}
        name={user.name}
        className="bg-brand size-10 text-lg"
      />
      <div className="min-w-0 flex-1">
        <Link
          href={`/profile/${user.id}`}
          className="block truncate text-sm font-semibold hover:underline"
        >
          {user.name}
        </Link>
        <p className="truncate text-xs text-muted-foreground">{user.area}</p>
      </div>
      {children}
    </li>
  );
}
