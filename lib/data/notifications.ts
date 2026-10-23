import "server-only";

import { prisma } from "@/lib/prisma";
import type { Notification } from "@/lib/types";

const TYPE_FROM_DB = {
  INVITE: "invite",
  JOIN: "join",
  RATING: "rating",
  SYSTEM: "system",
} as const;

function matchIdFromPayload(payload: unknown): string | null {
  if (payload && typeof payload === "object" && "matchId" in payload) {
    const { matchId } = payload as { matchId: unknown };
    return typeof matchId === "string" ? matchId : null;
  }
  return null;
}

export async function getNotifications(
  userId: string,
): Promise<Notification[]> {
  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    type: TYPE_FROM_DB[row.type],
    title: row.title,
    body: row.body,
    matchId: matchIdFromPayload(row.payload),
    readAt: row.readAt ? row.readAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function countUnreadNotifications(
  userId: string,
): Promise<number> {
  return prisma.notification.count({ where: { userId, readAt: null } });
}

export async function markNotificationsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
