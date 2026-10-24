"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/session";
import { markNotificationsRead } from "@/lib/data/notifications";
import { prisma } from "@/lib/prisma";

export async function markAllNotificationsReadAction(): Promise<{ ok: boolean }> {
  const userId = await requireUserId();
  await markNotificationsRead(userId);
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function markSingleNotificationReadAction(notificationId: string): Promise<{ ok: boolean }> {
  const userId = await requireUserId();
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { readAt: new Date() },
  });
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
  return { ok: true };
}
