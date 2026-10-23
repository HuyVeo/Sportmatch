import "server-only";

import { requireUserId } from "@/lib/auth/session";
import {
  PARTICIPANT_FROM_DB,
  STATUS_FROM_DB,
  VISIBILITY_FROM_DB,
  VISIBILITY_TO_DB,
  dateTimeToString,
  skillRequirementFromDb,
  skillRequirementToDb,
} from "@/lib/db/mappers";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  Match,
  MatchVisibility,
  SkillRequirement,
  ViewerRole,
} from "@/lib/types";

const matchSelect = {
  id: true,
  sportId: true,
  hostId: true,
  title: true,
  courtName: true,
  address: true,
  dateTime: true,
  maxPlayers: true,
  skillRequirement: true,
  visibility: true,
  description: true,
  status: true,
  participants: {
    select: { userId: true, status: true },
    orderBy: { joinedAt: "asc" },
  },
} as const;

type MatchRow = Prisma.MatchGetPayload<{ select: typeof matchSelect }>;

function toDomainMatch(row: MatchRow): Match {
  return {
    id: row.id,
    sportId: row.sportId,
    hostId: row.hostId,
    title: row.title,
    courtName: row.courtName,
    address: row.address,
    dateTime: dateTimeToString(row.dateTime),
    maxPlayers: row.maxPlayers,
    skillRequirement: skillRequirementFromDb(row.skillRequirement),
    visibility: VISIBILITY_FROM_DB[row.visibility],
    description: row.description,
    status: STATUS_FROM_DB[row.status],
    participants: row.participants.map((participant) => ({
      userId: participant.userId,
      status: PARTICIPANT_FROM_DB[participant.status],
    })),
  };
}

/**
 * Trận hiển thị cho một người dùng: trận công khai, trận mình tạo, và trận
 * mình được mời / đã tham gia (khớp quy tắc "Quyền hiển thị" khi tạo trận).
 */
export async function getVisibleMatches(userId: string): Promise<Match[]> {
  const rows = await prisma.match.findMany({
    where: {
      OR: [
        { visibility: "PUBLIC" },
        { hostId: userId },
        { participants: { some: { userId, status: { not: "LEFT" } } } },
      ],
    },
    select: matchSelect,
    orderBy: { dateTime: "asc" },
  });
  return rows.map(toDomainMatch);
}

export async function getMatches(): Promise<Match[]> {
  const userId = await requireUserId();
  return getVisibleMatches(userId);
}

export async function getMatchById(id: string): Promise<Match | null> {
  const row = await prisma.match.findUnique({
    where: { id },
    select: matchSelect,
  });
  return row ? toDomainMatch(row) : null;
}

/** Trận mà người dùng đã tham gia (dùng cho Lịch sử và Đánh giá). */
export async function getMatchesJoinedBy(userId: string): Promise<Match[]> {
  const rows = await prisma.match.findMany({
    where: { participants: { some: { userId, status: "JOINED" } } },
    select: matchSelect,
    orderBy: { dateTime: "desc" },
  });
  return rows.map(toDomainMatch);
}

export function countJoined(match: Match): number {
  return match.participants.filter((p) => p.status === "joined").length;
}

export function viewerRole(match: Match, userId: string): ViewerRole {
  if (match.hostId === userId) return "host";
  const status = match.participants.find((p) => p.userId === userId)?.status;
  if (status === "joined" || status === "invited" || status === "requested") {
    return status;
  }
  return "none";
}

/** Trận còn nhận người với người xem này (chưa diễn ra, và công khai hoặc có lời mời). */
export function isMatchOpenTo(match: Match, role: ViewerRole): boolean {
  if (match.status !== "Sắp diễn ra") return false;
  return match.visibility === "Công khai" || role === "invited";
}

/** Trận người dùng được xem: công khai, hoặc mình là chủ / được mời / đã xin / đã tham gia. */
export function canViewMatch(match: Match, role: ViewerRole): boolean {
  return match.visibility === "Công khai" || role !== "none";
}

export type NewMatchInput = {
  sportId: string;
  title: string;
  courtName: string;
  address: string;
  dateTime: string;
  maxPlayers: number;
  skillRequirement: SkillRequirement;
  visibility: MatchVisibility;
  description: string;
  invitedUserIds: string[];
  /** Sân chọn từ danh sách; null = "Sân khác – tự nhập tên sân". */
  courtId: string | null;
};

/**
 * Trận chưa có thời lượng → coi mỗi trận chiếm sân 2 giờ: hai trận cùng sân,
 * cùng môn cách nhau dưới 2 giờ là trùng giờ.
 */
const COURT_BUSY_WINDOW_MS = 2 * 60 * 60 * 1000;

/** Sân (trong `courtIds`) đã có trận chưa kết thúc cùng môn, trùng giờ `dateTime`. */
export async function getBusyCourtIds(
  sportId: string,
  dateTime: Date,
  courtIds?: string[],
): Promise<string[]> {
  const rows = await prisma.match.findMany({
    where: {
      sportId,
      courtId: courtIds ? { in: courtIds } : { not: null },
      status: { not: "COMPLETED" },
      dateTime: {
        gt: new Date(dateTime.getTime() - COURT_BUSY_WINDOW_MS),
        lt: new Date(dateTime.getTime() + COURT_BUSY_WINDOW_MS),
      },
    },
    select: { courtId: true },
    distinct: ["courtId"],
  });
  return rows.flatMap((row) => (row.courtId ? [row.courtId] : []));
}

export async function createMatch(input: NewMatchInput): Promise<Match> {
  const hostId = await requireUserId();

  const sport = await prisma.sport.findUnique({
    where: { id: input.sportId },
    select: { isActive: true, minPlayers: true, maxPlayers: true },
  });
  if (!sport?.isActive) {
    throw new MatchActionError("Môn thể thao không hợp lệ.");
  }
  if (
    !Number.isInteger(input.maxPlayers) ||
    input.maxPlayers < sport.minPlayers ||
    input.maxPlayers > sport.maxPlayers
  ) {
    throw new MatchActionError(
      `Số người cần phải từ ${sport.minPlayers} đến ${sport.maxPlayers}.`,
    );
  }

  const dateTime = new Date(input.dateTime);
  if (Number.isNaN(dateTime.getTime())) {
    throw new MatchActionError("Ngày giờ không hợp lệ.");
  }

  if (input.courtId) {
    const court = await prisma.court.findUnique({
      where: { id: input.courtId },
      select: {
        source: true,
        isOpen: true,
        sports: { where: { sportId: input.sportId }, select: { sportId: true } },
      },
    });
    if (!court || court.sports.length === 0) {
      throw new MatchActionError("Sân không hợp lệ với môn đã chọn.");
    }
    // Chỉ sân SportMatch mới có trạng thái mở cửa; sân OSM coi như luôn mở.
    const closed = court.source === "SPORTMATCH" && !court.isOpen;
    const busy =
      closed ||
      (await getBusyCourtIds(input.sportId, dateTime, [input.courtId]))
        .length > 0;
    if (busy) {
      throw new MatchActionError(
        "Sân đã đủ vào giờ này, vui lòng chọn sân khác.",
      );
    }
  }

  const match = await prisma.match.create({
    data: {
      sportId: input.sportId,
      hostId,
      courtId: input.courtId,
      title: input.title,
      courtName: input.courtName,
      address: input.address,
      dateTime,
      maxPlayers: input.maxPlayers,
      skillRequirement: skillRequirementToDb(input.skillRequirement),
      visibility: VISIBILITY_TO_DB[input.visibility],
      description: input.description,
      participants: {
        create: [
          { userId: hostId, status: "JOINED" },
          ...input.invitedUserIds
            .filter((userId) => userId !== hostId)
            .map((userId) => ({ userId, status: "INVITED" as const })),
        ],
      },
      conversation: { create: { members: { create: { userId: hostId } } } },
    },
    select: matchSelect,
  });

  if (input.invitedUserIds.length > 0) {
    await prisma.notification.createMany({
      data: input.invitedUserIds
        .filter((userId) => userId !== hostId)
        .map((userId) => ({
          userId,
          type: "INVITE" as const,
          title: "Bạn có lời mời trận đấu mới",
          body: `${input.title} · ${input.courtName}`,
          payload: { matchId: match.id },
        })),
    });
  }

  return toDomainMatch(match);
}

// ---------------------------------------------------------------- tham gia trận

/** Lỗi nghiệp vụ có message tiếng Việt, hiển thị thẳng cho người dùng. */
export class MatchActionError extends Error {}

type Tx = Prisma.TransactionClient;

/**
 * Khoá dòng Match trong transaction để hai thao tác đồng thời (vd hai lần
 * duyệt cùng lúc) không vượt quá số chỗ.
 */
async function lockMatch(tx: Tx, matchId: string) {
  await tx.$queryRaw`SELECT id FROM "Match" WHERE id = ${matchId} FOR UPDATE`;

  const match = await tx.match.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      title: true,
      hostId: true,
      maxPlayers: true,
      visibility: true,
      status: true,
      participants: { select: { userId: true, status: true } },
    },
  });

  if (!match) throw new MatchActionError("Trận đấu không tồn tại.");
  if (match.status !== "UPCOMING") {
    throw new MatchActionError("Trận đã bắt đầu hoặc đã kết thúc.");
  }
  return match;
}

type LockedMatch = Awaited<ReturnType<typeof lockMatch>>;

function statusOf(match: LockedMatch, userId: string) {
  return match.participants.find((p) => p.userId === userId)?.status ?? null;
}

function assertHasSlot(match: LockedMatch) {
  const joined = match.participants.filter((p) => p.status === "JOINED").length;
  if (joined >= match.maxPlayers) {
    throw new MatchActionError("Trận đã đủ người.");
  }
}

async function userName(tx: Tx, userId: string) {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  return user?.name ?? "Một người chơi";
}

async function setJoined(tx: Tx, matchId: string, userId: string) {
  await tx.matchParticipant.update({
    where: { matchId_userId: { matchId, userId } },
    data: { status: "JOINED", joinedAt: new Date() },
  });

  const conversation = await tx.chatConversation.upsert({
    where: { matchId },
    create: { matchId },
    update: {},
    select: { id: true },
  });
  await tx.conversationMember.upsert({
    where: {
      conversationId_userId: { conversationId: conversation.id, userId },
    },
    create: { conversationId: conversation.id, userId },
    update: {},
  });
}

async function notify(
  tx: Tx,
  input: { userId: string; type: "INVITE" | "JOIN"; title: string; body: string; matchId: string },
) {
  await tx.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      payload: { matchId: input.matchId },
    },
  });
}

/**
 * Người chơi bấm "Xin tham gia". Trận công khai → tạo yêu cầu chờ chủ trận
 * duyệt; nếu người này đang có lời mời thì coi như nhận lời luôn.
 */
export async function requestToJoin(matchId: string): Promise<void> {
  const userId = await requireUserId();

  await prisma.$transaction(async (tx) => {
    const match = await lockMatch(tx, matchId);
    const status = statusOf(match, userId);

    if (match.hostId === userId) {
      throw new MatchActionError("Bạn là chủ trận này.");
    }
    if (status === "JOINED") {
      throw new MatchActionError("Bạn đã tham gia trận này.");
    }
    if (status === "REQUESTED") {
      throw new MatchActionError("Bạn đã gửi yêu cầu, hãy chờ chủ trận duyệt.");
    }
    if (status === "INVITED") {
      await acceptInvite(tx, match, userId);
      return;
    }
    if (match.visibility !== "PUBLIC") {
      throw new MatchActionError("Trận này chỉ dành cho người được mời.");
    }
    assertHasSlot(match);

    await tx.matchParticipant.upsert({
      where: { matchId_userId: { matchId, userId } },
      create: { matchId, userId, status: "REQUESTED" },
      update: { status: "REQUESTED", joinedAt: new Date() },
    });
    await notify(tx, {
      userId: match.hostId,
      type: "JOIN",
      title: `${await userName(tx, userId)} muốn tham gia trận của bạn`,
      body: match.title,
      matchId,
    });
  });
}

async function acceptInvite(tx: Tx, match: LockedMatch, userId: string) {
  assertHasSlot(match);
  await setJoined(tx, match.id, userId);
  await notify(tx, {
    userId: match.hostId,
    type: "JOIN",
    title: `${await userName(tx, userId)} đã nhận lời mời`,
    body: match.title,
    matchId: match.id,
  });
}

/** Người được mời nhận hoặc từ chối lời mời. */
export async function respondToInvite(
  matchId: string,
  accept: boolean,
): Promise<void> {
  const userId = await requireUserId();

  await prisma.$transaction(async (tx) => {
    const match = await lockMatch(tx, matchId);
    if (statusOf(match, userId) !== "INVITED") {
      throw new MatchActionError("Lời mời không còn hiệu lực.");
    }

    if (accept) {
      await acceptInvite(tx, match, userId);
      return;
    }

    await tx.matchParticipant.delete({
      where: { matchId_userId: { matchId, userId } },
    });
    await notify(tx, {
      userId: match.hostId,
      type: "JOIN",
      title: `${await userName(tx, userId)} đã từ chối lời mời`,
      body: match.title,
      matchId,
    });
  });
}

/** Người chơi rút lại yêu cầu tham gia đang chờ duyệt. */
export async function cancelJoinRequest(matchId: string): Promise<void> {
  const userId = await requireUserId();

  await prisma.$transaction(async (tx) => {
    const match = await lockMatch(tx, matchId);
    if (statusOf(match, userId) !== "REQUESTED") {
      throw new MatchActionError("Không có yêu cầu nào đang chờ duyệt.");
    }
    await tx.matchParticipant.delete({
      where: { matchId_userId: { matchId, userId } },
    });
  });
}

/** Thành viên (không phải chủ trận) rời trận. */
export async function leaveMatch(matchId: string): Promise<void> {
  const userId = await requireUserId();

  await prisma.$transaction(async (tx) => {
    const match = await lockMatch(tx, matchId);
    if (match.hostId === userId) {
      throw new MatchActionError("Chủ trận không thể rời trận.");
    }
    if (statusOf(match, userId) !== "JOINED") {
      throw new MatchActionError("Bạn chưa tham gia trận này.");
    }

    await tx.matchParticipant.update({
      where: { matchId_userId: { matchId, userId } },
      data: { status: "LEFT" },
    });
    await tx.conversationMember.deleteMany({
      where: { userId, conversation: { matchId } },
    });
    await notify(tx, {
      userId: match.hostId,
      type: "JOIN",
      title: `${await userName(tx, userId)} đã rời trận`,
      body: match.title,
      matchId,
    });
  });
}

/** Chủ trận chấp nhận hoặc từ chối một yêu cầu tham gia. */
export async function reviewJoinRequest(
  matchId: string,
  requesterId: string,
  approve: boolean,
): Promise<void> {
  const userId = await requireUserId();

  await prisma.$transaction(async (tx) => {
    const match = await lockMatch(tx, matchId);
    if (match.hostId !== userId) {
      throw new MatchActionError("Chỉ chủ trận mới duyệt được yêu cầu.");
    }
    if (statusOf(match, requesterId) !== "REQUESTED") {
      throw new MatchActionError("Yêu cầu không còn hiệu lực.");
    }

    if (approve) {
      assertHasSlot(match);
      await setJoined(tx, matchId, requesterId);
    } else {
      await tx.matchParticipant.delete({
        where: { matchId_userId: { matchId, userId: requesterId } },
      });
    }

    await notify(tx, {
      userId: requesterId,
      type: "JOIN",
      title: approve
        ? "Yêu cầu tham gia đã được chấp nhận"
        : "Yêu cầu tham gia bị từ chối",
      body: match.title,
      matchId,
    });
  });
}
