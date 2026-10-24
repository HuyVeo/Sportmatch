"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const ratingSchema = z.object({
  matchId: z.string().min(1),
  toUserId: z.string().min(1),
  stars: z.number().int().min(1).max(5),
  comment: z.string().max(500).default(""),
});

export async function submitRatingAction(input: {
  matchId: string;
  toUserId: string;
  stars: number;
  comment: string;
}): Promise<{ ok: boolean; error?: string }> {
  const currentUserId = await requireUserId();
  const parsed = ratingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dữ liệu đánh giá không hợp lệ." };
  }

  const { matchId, toUserId, stars, comment } = parsed.data;

  if (currentUserId === toUserId) {
    return { ok: false, error: "Bạn không thể tự đánh giá chính mình." };
  }

  // Kiểm tra trận đấu có hợp lệ và đã hoàn tất chưa
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      participants: {
        where: {
          status: "JOINED",
          userId: { in: [currentUserId, toUserId] },
        },
      },
    },
  });

  if (!match) {
    return { ok: false, error: "Trận đấu không tồn tại." };
  }

  if (match.status !== "COMPLETED") {
    return { ok: false, error: "Trận đấu chưa hoàn tất nên chưa thể đánh giá." };
  }

  // Cả người đánh giá và người được đánh giá phải cùng tham gia trận đấu (hoặc là chủ trận)
  const isCurrentUserInMatch =
    match.hostId === currentUserId ||
    match.participants.some((p) => p.userId === currentUserId);
  const isTargetUserInMatch =
    match.hostId === toUserId ||
    match.participants.some((p) => p.userId === toUserId);

  if (!isCurrentUserInMatch || !isTargetUserInMatch) {
    return { ok: false, error: "Người chơi này không cùng tham gia trận đấu với bạn." };
  }

  try {
    await prisma.rating.upsert({
      where: {
        fromUserId_toUserId_matchId: {
          fromUserId: currentUserId,
          toUserId,
          matchId,
        },
      },
      create: {
        fromUserId: currentUserId,
        toUserId,
        matchId,
        stars,
        comment: comment.trim(),
      },
      update: {
        stars,
        comment: comment.trim(),
      },
    });

    // Cập nhật điểm uy tín theo chất lượng đánh giá từ đồng đội
    const targetUser = await prisma.user.findUnique({
      where: { id: toUserId },
      select: { trustScore: true },
    });
    if (targetUser) {
      const delta = stars >= 5 ? 2 : stars >= 4 ? 1 : stars <= 2 ? -3 : 0;
      if (delta !== 0) {
        const newScore = Math.max(0, Math.min(100, targetUser.trustScore + delta));
        await prisma.user.update({
          where: { id: toUserId },
          data: { trustScore: newScore },
        });
      }
    }

    // Tạo thông báo cho người được đánh giá
    const reviewer = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { name: true },
    });

    await prisma.notification.create({
      data: {
        userId: toUserId,
        type: "RATING",
        title: "Đánh giá mới từ đồng đội ⭐",
        body: `${reviewer?.name ?? "Một đồng đội"} đã chấm ${stars}★ cho bạn trong trận "${match.title}".`,
        payload: { matchId },
      },
    });

    revalidatePath("/ratings");
    revalidatePath("/history");
    revalidatePath(`/profile/${toUserId}`);
    return { ok: true };
  } catch (error) {
    console.error("submitRatingAction error:", error);
    return { ok: false, error: "Lỗi hệ thống khi lưu đánh giá. Vui lòng thử lại." };
  }
}
