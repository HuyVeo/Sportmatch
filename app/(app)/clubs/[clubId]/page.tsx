import { auth } from "@/auth";
import { ClubProfilePage } from "@/components/clubs/club-profile-page";
import { ClubDetailRoute } from "@/components/clubs/club-detail-route";
import type { Club } from "@/lib/clubs/mock-data";
import { findGroupConversationId, getConversation, getMessages } from "@/lib/data/chat";
import { prisma } from "@/lib/prisma";
import type { ClubViewerAccess } from "@/lib/clubs/viewer-access";

export default async function ClubDetailPage({ params }: { params: Promise<{ clubId: string }> }) {
  const { clubId } = await params;
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    include: {
      owner: { select: { name: true } },
      memberships: {
        where: { status: "APPROVED" },
        include: { user: { select: { name: true } } },
        orderBy: { requestedAt: "asc" },
      },
    },
  });

  if (!club) {
    return <ClubDetailRoute clubId={clubId} viewerAccess={{
      isPersisted: false,
      isAuthenticated: Boolean(userId),
      userId,
      displayName: session?.user?.name ?? "Khách chơi",
      ownerId: null,
      isOwner: false,
      membershipStatus: null,
      pendingRequests: [],
    }} />;
  }

  const isOwner = club.ownerId === userId;
  const [membership, pendingRequests] = await Promise.all([
    userId && !isOwner
      ? prisma.clubMembership.findUnique({
          where: { clubId_userId: { clubId, userId } },
          select: { status: true },
        })
      : Promise.resolve(null),
    isOwner
      ? prisma.clubMembership.findMany({
          where: { clubId, status: "PENDING" },
          include: { user: { select: { name: true, avatar: true, image: true, area: true } } },
          orderBy: { requestedAt: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const mappedClub: Club = {
    id: club.id,
    name: club.name,
    sportType: club.sportType as Club["sportType"],
    area: club.area,
    logo: club.logo,
    rating: club.rating,
    memberCount: club.memberCount,
    capacity: club.capacity,
    recruitmentCount: Math.max(0, club.capacity - club.memberCount),
    positions: [],
    level: club.level as Club["level"],
    schedule: club.schedule,
    time: club.time,
    fee: club.fee,
    activityCount: 0,
    activityRate: 0,
    responseRate: 0,
    foundedMonths: 0,
    description: club.description,
    status: "Đang hoạt động",
    nextActivity: { title: "Chưa có hoạt động", kind: "Tập luyện", date: "Chưa lên lịch", time: club.time, venue: club.area, joined: 0, capacity: club.capacity },
    members: [club.owner?.name, ...club.memberships.map((member) => member.user.name)].filter((name): name is string => Boolean(name)),
    achievements: { events: 0, wins: 0, draws: 0, losses: 0 },
  };
  const viewerAccess: ClubViewerAccess = {
    isPersisted: true,
    isAuthenticated: Boolean(userId),
    userId,
    displayName: session?.user?.name ?? "Khách chơi",
    ownerId: club.ownerId,
    isOwner,
    membershipStatus: isOwner ? "APPROVED" : membership?.status ?? null,
    pendingRequests: pendingRequests.map((request) => ({
      userId: request.userId,
      name: request.user.name,
      avatar: request.user.avatar,
      avatarUrl: request.user.image,
      area: request.user.area,
    })),
  };

  // Chủ CLB + thành viên đã duyệt: nạp sẵn nhóm chat nội bộ cho tab "Trò chuyện".
  const conversationId =
    userId && viewerAccess.membershipStatus === "APPROVED"
      ? await findGroupConversationId({ clubId }, userId)
      : null;
  const [conversation, messages] = conversationId && userId
    ? await Promise.all([getConversation(conversationId, userId), getMessages(conversationId, userId)])
    : [null, []];
  const chat = conversation ? { conversation, messages } : null;

  return <ClubProfilePage club={mappedClub} viewerAccess={viewerAccess} chat={chat} />;
}
