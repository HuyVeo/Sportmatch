import "server-only";

import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  ChatConversation,
  ChatConversationDetail,
  ChatMember,
  ChatMessage,
  ConversationKind,
} from "@/lib/types";

type Tx = Prisma.TransactionClient;

export const MAX_MESSAGE_LENGTH = 2000;

/** Lỗi nghiệp vụ hiển thị được cho người dùng (khác lỗi hệ thống). */
export class ChatActionError extends Error {}

const memberUserSelect = {
  id: true,
  name: true,
  avatar: true,
  image: true,
  isOnline: true,
} as const;

const conversationSelect = {
  id: true,
  type: true,
  lastMessageAt: true,
  match: { select: { id: true, title: true, sport: { select: { icon: true } } } },
  club: { select: { id: true, name: true, logo: true } },
  members: {
    select: { userId: true, lastReadAt: true, user: { select: memberUserSelect } },
  },
  messages: {
    orderBy: { createdAt: "desc" },
    take: 1,
    select: {
      body: true,
      senderId: true,
      createdAt: true,
      sender: { select: { name: true } },
    },
  },
} satisfies Prisma.ChatConversationSelect;

type ConversationRow = Prisma.ChatConversationGetPayload<{
  select: typeof conversationSelect;
}>;

const KIND: Record<ConversationRow["type"], ConversationKind> = {
  DIRECT: "direct",
  MATCH: "match",
  CLUB: "club",
};

function toMember(user: ConversationRow["members"][number]["user"]): ChatMember {
  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    image: user.image,
    isOnline: user.isOnline,
  };
}

function toConversation(
  row: ConversationRow,
  viewerId: string,
  unreadCount: number,
): ChatConversation {
  const kind = KIND[row.type];
  const peerRow =
    kind === "direct" ? row.members.find((member) => member.userId !== viewerId) : undefined;
  const peer = peerRow ? toMember(peerRow.user) : null;
  const last = row.messages[0];

  const target =
    kind === "direct"
      ? {
          title: peer?.name ?? "Người chơi",
          avatar: peer?.avatar ?? "🧑",
          image: peer?.image ?? null,
          href: peer ? `/profile/${peer.id}` : "/chat",
        }
      : kind === "match"
        ? {
            title: row.match?.title ?? "Trận đấu",
            avatar: row.match?.sport.icon ?? "🏸",
            image: null,
            href: row.match ? `/matches/${row.match.id}` : "/matches",
          }
        : {
            title: row.club?.name ?? "Câu lạc bộ",
            avatar: row.club?.logo ?? "🏸",
            image: null,
            href: row.club ? `/clubs/${row.club.id}` : "/clubs",
          };

  return {
    id: row.id,
    kind,
    ...target,
    memberCount: row.members.length,
    peer,
    lastMessage: last
      ? {
          body: last.body,
          senderId: last.senderId,
          senderName: last.sender.name,
          createdAt: last.createdAt.toISOString(),
        }
      : null,
    lastMessageAt: row.lastMessageAt.toISOString(),
    unreadCount,
  };
}

/** Số tin chưa đọc theo từng hội thoại của người dùng (chỉ trả hội thoại > 0). */
async function unreadByConversation(userId: string): Promise<Map<string, number>> {
  const rows = await prisma.$queryRaw<{ conversationId: string; count: number }[]>`
    SELECT m."conversationId", COUNT(*)::int AS "count"
    FROM "ChatMessage" m
    JOIN "ConversationMember" cm
      ON cm."conversationId" = m."conversationId" AND cm."userId" = ${userId}
    WHERE m."senderId" <> ${userId}
      AND (cm."lastReadAt" IS NULL OR m."createdAt" > cm."lastReadAt")
    GROUP BY m."conversationId"
  `;
  return new Map(rows.map((row) => [row.conversationId, row.count]));
}

export async function getConversations(userId: string): Promise<ChatConversation[]> {
  const [rows, unread] = await Promise.all([
    prisma.chatConversation.findMany({
      where: { members: { some: { userId } } },
      select: conversationSelect,
      orderBy: { lastMessageAt: "desc" },
    }),
    unreadByConversation(userId),
  ]);

  return rows.map((row) => toConversation(row, userId, unread.get(row.id) ?? 0));
}

/** Chi tiết 1 hội thoại — `null` nếu không tồn tại hoặc người dùng không phải thành viên. */
export async function getConversation(
  conversationId: string,
  userId: string,
): Promise<ChatConversationDetail | null> {
  const row = await prisma.chatConversation.findFirst({
    where: { id: conversationId, members: { some: { userId } } },
    select: conversationSelect,
  });
  if (!row) return null;

  const unread = await unreadByConversation(userId);
  const conversation = toConversation(row, userId, unread.get(row.id) ?? 0);
  const peerLastReadAt =
    conversation.peer &&
    row.members.find((member) => member.userId === conversation.peer?.id)?.lastReadAt;

  return {
    ...conversation,
    members: row.members.map((member) => toMember(member.user)),
    peerLastReadAt: peerLastReadAt ? peerLastReadAt.toISOString() : null,
  };
}

async function assertMember(conversationId: string, userId: string) {
  const member = await prisma.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
    select: { userId: true },
  });
  if (!member) throw new ChatActionError("Bạn không ở trong hội thoại này.");
}

export async function getMessages(
  conversationId: string,
  userId: string,
): Promise<ChatMessage[]> {
  await assertMember(conversationId, userId);

  // Lấy 200 tin mới nhất rồi đảo lại theo thứ tự thời gian.
  const rows = await prisma.chatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      conversationId: true,
      senderId: true,
      body: true,
      createdAt: true,
      sender: { select: { name: true, avatar: true, image: true } },
    },
  });

  return rows.reverse().map((row) => ({
    id: row.id,
    conversationId: row.conversationId,
    senderId: row.senderId,
    senderName: row.sender.name,
    senderAvatar: row.sender.avatar,
    senderImage: row.sender.image,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
  }));
}

/** Số hội thoại đang có tin chưa đọc — badge trên icon chat ở header. */
export async function countUnreadMessages(userId: string): Promise<number> {
  return (await unreadByConversation(userId)).size;
}

export async function sendMessage(input: {
  conversationId: string;
  senderId: string;
  body: string;
}): Promise<void> {
  const body = input.body.trim();
  if (!body) throw new ChatActionError("Tin nhắn trống.");
  if (body.length > MAX_MESSAGE_LENGTH) {
    throw new ChatActionError(`Tin nhắn tối đa ${MAX_MESSAGE_LENGTH} ký tự.`);
  }
  await assertMember(input.conversationId, input.senderId);

  const now = new Date();
  await prisma.$transaction([
    prisma.chatMessage.create({
      data: { conversationId: input.conversationId, senderId: input.senderId, body, createdAt: now },
    }),
    prisma.chatConversation.update({
      where: { id: input.conversationId },
      data: { lastMessageAt: now },
    }),
    // Người gửi coi như đã đọc tới tin của chính mình.
    prisma.conversationMember.update({
      where: {
        conversationId_userId: { conversationId: input.conversationId, userId: input.senderId },
      },
      data: { lastReadAt: now },
    }),
  ]);
}

export async function markConversationRead(conversationId: string, userId: string) {
  await prisma.conversationMember.updateMany({
    where: { conversationId, userId },
    data: { lastReadAt: new Date() },
  });
}

/** Mở (hoặc tạo lần đầu) chat riêng giữa 2 người chơi. Trả về id hội thoại. */
export async function getOrCreateDirectConversation(
  userId: string,
  peerId: string,
): Promise<string> {
  if (userId === peerId) throw new ChatActionError("Không thể nhắn tin với chính mình.");

  const peer = await prisma.user.findUnique({ where: { id: peerId }, select: { id: true } });
  if (!peer) throw new ChatActionError("Không tìm thấy người chơi.");

  const directKey = [userId, peerId].sort().join(":");
  const conversation = await prisma.chatConversation.upsert({
    where: { directKey },
    create: {
      type: "DIRECT",
      directKey,
      members: { create: [{ userId }, { userId: peerId }] },
    },
    update: {},
    select: { id: true },
  });
  return conversation.id;
}

// ---------------------------------------------------------------- nhóm chat CLB
// Gọi trong transaction của luồng CLB để thành viên luôn khớp với ClubMembership.

/** Tạo nhóm chat cho CLB mới, chủ CLB là thành viên đầu tiên. */
export async function createClubConversation(tx: Tx, clubId: string, ownerId: string) {
  await tx.chatConversation.create({
    data: { type: "CLUB", clubId, members: { create: { userId: ownerId } } },
  });
}

/** Thêm người vào nhóm chat CLB (khi được duyệt). Tạo nhóm nếu CLB chưa có. */
export async function addClubConversationMember(tx: Tx, clubId: string, userId: string) {
  const conversation = await tx.chatConversation.upsert({
    where: { clubId },
    create: { type: "CLUB", clubId },
    update: {},
    select: { id: true },
  });
  await tx.conversationMember.upsert({
    where: { conversationId_userId: { conversationId: conversation.id, userId } },
    create: { conversationId: conversation.id, userId },
    update: {},
  });
}

/** Đưa người ra khỏi nhóm chat CLB (bị từ chối / rời CLB). */
export async function removeClubConversationMember(tx: Tx, clubId: string, userId: string) {
  await tx.conversationMember.deleteMany({
    where: { userId, conversation: { clubId } },
  });
}

/** Id nhóm chat của 1 trận / 1 CLB nếu người dùng đang ở trong nhóm. */
export async function findGroupConversationId(
  target: { matchId: string } | { clubId: string },
  userId: string,
): Promise<string | null> {
  const conversation = await prisma.chatConversation.findFirst({
    where: { ...target, members: { some: { userId } } },
    select: { id: true },
  });
  return conversation?.id ?? null;
}
