"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function hasVotedUser(targetUserId: string): Promise<boolean> {
  const currentUserId = await requireUserId();
  if (currentUserId === targetUserId) return false;

  const notifications = await prisma.notification.findMany({
    where: {
      userId: targetUserId,
      type: "SYSTEM",
    },
    select: { payload: true },
  });

  return notifications.some((n) => {
    const p = n.payload as Record<string, unknown> | null;
    return p?.kind === "COMMUNITY_VOTE" && p?.fromUserId === currentUserId;
  });
}

export async function toggleCommunityVoteAction(targetUserId: string): Promise<{
  ok: boolean;
  voted?: boolean;
  votes?: number;
  error?: string;
}> {
  const currentUserId = await requireUserId();

  if (currentUserId === targetUserId) {
    return { ok: false, error: "Bạn không thể tự bình chọn cho chính mình." };
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, name: true, communityVotes: true },
  });

  if (!targetUser) {
    return { ok: false, error: "Không tìm thấy người dùng này." };
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { name: true },
  });

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: targetUserId,
        type: "SYSTEM",
      },
      select: { id: true, payload: true },
    });

    const existingVote = notifications.find((n) => {
      const p = n.payload as Record<string, unknown> | null;
      return p?.kind === "COMMUNITY_VOTE" && p?.fromUserId === currentUserId;
    });

    if (existingVote) {
      // Bỏ bình chọn
      await prisma.notification.delete({ where: { id: existingVote.id } });
      const newVotes = Math.max(0, targetUser.communityVotes - 1);
      await prisma.user.update({
        where: { id: targetUserId },
        data: { communityVotes: newVotes },
      });

      revalidatePath(`/profile/${targetUserId}`);
      revalidatePath("/ranking");
      return { ok: true, voted: false, votes: newVotes };
    } else {
      // Thêm bình chọn tín nhiệm
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          type: "SYSTEM",
          title: "Bình chọn tín nhiệm mới! 🌟",
          body: `${currentUser?.name ?? "Một đồng đội"} vừa bình chọn tín nhiệm cho bạn trong cộng đồng SportMatch!`,
          payload: { kind: "COMMUNITY_VOTE", fromUserId: currentUserId },
        },
      });

      const newVotes = targetUser.communityVotes + 1;
      await prisma.user.update({
        where: { id: targetUserId },
        data: { communityVotes: newVotes },
      });

      revalidatePath(`/profile/${targetUserId}`);
      revalidatePath("/ranking");
      return { ok: true, voted: true, votes: newVotes };
    }
  } catch (error) {
    console.error("toggleCommunityVoteAction error:", error);
    return { ok: false, error: "Có lỗi xảy ra khi thực hiện bình chọn." };
  }
}
