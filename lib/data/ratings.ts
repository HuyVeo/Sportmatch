import "server-only";

import { getSports } from "@/lib/data/sports";
import { prisma } from "@/lib/prisma";

export type UserReview = {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  reviewerAvatarUrl: string | null;
  matchId: string;
  matchTitle: string;
  stars: number;
  comment: string;
  createdAt: string;
};

export type RateablePeer = {
  id: string;
  name: string;
  avatar: string;
  avatarUrl: string | null;
  area: string;
  isHost: boolean;
  existingRating: {
    stars: number;
    comment: string;
  } | null;
};

export type RateableMatch = {
  id: string;
  title: string;
  sportName: string;
  sportIcon: string;
  courtName: string;
  dateTime: string;
  peers: RateablePeer[];
};

/**
 * Lấy các nhận xét & đánh giá gần đây từ đồng đội gửi cho người dùng này.
 * Phục vụ hiển thị social proof trên trang Profile theo mục 4 của tính năng mới.
 */
export async function getUserRecentReviews(
  userId: string,
  limit = 10,
): Promise<UserReview[]> {
  const rows = await prisma.rating.findMany({
    where: { toUserId: userId },
    include: {
      fromUser: {
        select: {
          id: true,
          name: true,
          avatar: true,
          image: true,
        },
      },
      match: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return rows.map((r) => ({
    id: r.id,
    reviewerId: r.fromUser.id,
    reviewerName: r.fromUser.name,
    reviewerAvatar: r.fromUser.avatar,
    reviewerAvatarUrl: r.fromUser.image,
    matchId: r.match.id,
    matchTitle: r.match.title,
    stars: r.stars,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
  }));
}

/**
 * Lấy danh sách các trận đã hoàn tất mà người dùng đã tham gia (hoặc làm chủ trận),
 * kèm danh sách các đồng đội trong trận và trạng thái đánh giá hiện tại.
 */
export async function getRateableMatches(
  userId: string,
): Promise<RateableMatch[]> {
  const completedMatches = await prisma.match.findMany({
    where: {
      status: "COMPLETED",
      OR: [
        { hostId: userId },
        {
          participants: {
            some: {
              userId,
              status: "JOINED",
            },
          },
        },
      ],
    },
    include: {
      host: { select: { id: true, name: true, avatar: true, image: true, area: true } },
      participants: {
        where: { status: "JOINED" },
        include: {
          user: { select: { id: true, name: true, avatar: true, image: true, area: true } },
        },
      },
      ratings: {
        where: { fromUserId: userId },
      },
    },
    orderBy: { dateTime: "desc" },
  });

  const sports = await getSports();
  const sportMap = new Map(sports.map((s) => [s.id, s]));

  return completedMatches
    .map((match) => {
      const sport = sportMap.get(match.sportId);

      // Thu thập tất cả đồng đội (chủ trận + người tham gia khác), trừ user đang xem
      const peersMap = new Map<
        string,
        {
          id: string;
          name: string;
          avatar: string;
          avatarUrl: string | null;
          area: string;
          isHost: boolean;
        }
      >();

      if (match.hostId !== userId) {
        peersMap.set(match.hostId, {
          id: match.host.id,
          name: match.host.name,
          avatar: match.host.avatar,
          avatarUrl: match.host.image,
          area: match.host.area,
          isHost: true,
        });
      }

      for (const p of match.participants) {
        if (p.userId !== userId && !peersMap.has(p.userId)) {
          peersMap.set(p.userId, {
            id: p.user.id,
            name: p.user.name,
            avatar: p.user.avatar,
            avatarUrl: p.user.image,
            area: p.user.area,
            isHost: p.userId === match.hostId,
          });
        }
      }

      const ratingsByToUser = new Map(
        match.ratings.map((r) => [
          r.toUserId,
          { stars: r.stars, comment: r.comment },
        ]),
      );

      const peers = Array.from(peersMap.values()).map((peer) => ({
        ...peer,
        existingRating: ratingsByToUser.get(peer.id) ?? null,
      }));

      return {
        id: match.id,
        title: match.title,
        sportName: sport?.name ?? match.sportId,
        sportIcon: sport?.icon ?? "🏅",
        courtName: match.courtName,
        dateTime: match.dateTime.toISOString(),
        peers,
      };
    })
    .filter((match) => match.peers.length > 0);
}
