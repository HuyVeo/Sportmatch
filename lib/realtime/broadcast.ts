import "server-only";

import { createHmac } from "node:crypto";
import { prisma } from "@/lib/prisma";

/**
 * Realtime qua Supabase Broadcast: server chỉ phát tín hiệu "có thay đổi" lên
 * kênh riêng của từng người dùng — KHÔNG gửi nội dung tin nhắn. Trình duyệt nhận
 * tín hiệu rồi tải lại dữ liệu từ server SportMatch (nơi đã kiểm tra quyền).
 *
 * Tên kênh băm từ userId bằng secret key nên người ngoài không đoán được.
 */

export type RealtimeEvent = "chat";

const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

/** Tên kênh realtime của 1 người dùng — `null` khi chưa cấu hình Supabase. */
export function userRealtimeTopic(userId: string): string | null {
  if (!SECRET_KEY) return null;
  const digest = createHmac("sha256", SECRET_KEY).update(`user:${userId}`).digest("hex");
  return `user:${digest.slice(0, 32)}`;
}

/** Phát tín hiệu tới các người dùng. Lỗi chỉ ghi log — không làm hỏng thao tác chính. */
export async function notifyUsers(userIds: string[], event: RealtimeEvent) {
  if (!SECRET_KEY || !SUPABASE_URL || userIds.length === 0) return;

  const messages = [...new Set(userIds)].map((userId) => ({
    topic: userRealtimeTopic(userId),
    event,
    payload: {},
    private: false,
  }));

  try {
    const response = await fetch(`${SUPABASE_URL}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: { apikey: SECRET_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    if (!response.ok) {
      console.error("Supabase broadcast thất bại:", response.status, await response.text());
    }
  } catch (error) {
    console.error("Supabase broadcast lỗi kết nối:", error);
  }
}

/** Báo cho mọi thành viên của hội thoại (kể cả người gửi — để các tab khác cập nhật). */
export async function notifyConversationMembers(conversationId: string) {
  const members = await prisma.conversationMember.findMany({
    where: { conversationId },
    select: { userId: true },
  });
  await notifyUsers(
    members.map((member) => member.userId),
    "chat",
  );
}
