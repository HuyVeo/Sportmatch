"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { requireUserId } from "@/lib/auth/session";
import {
  ChatActionError,
  getOrCreateDirectConversation,
  markConversationRead,
  sendMessage,
} from "@/lib/data/chat";
import { notifyConversationMembers } from "@/lib/realtime/broadcast";

export type ChatActionState = { error: string | null };

export async function sendMessageAction(
  conversationId: string,
  body: string,
): Promise<ChatActionState> {
  const userId = await requireUserId();
  try {
    await sendMessage({ conversationId, senderId: userId, body });
  } catch (error) {
    if (error instanceof ChatActionError) return { error: error.message };
    throw error;
  }
  // Báo realtime cho các thành viên sau khi đã trả kết quả cho người gửi.
  after(() => notifyConversationMembers(conversationId));
  refresh();
  return { error: null };
}

export async function markReadAction(conversationId: string) {
  const userId = await requireUserId();
  await markConversationRead(conversationId, userId);
  refresh();
}

/** Nút "Nhắn tin" trên thẻ người chơi / "Hỏi đáp" với chủ CLB → mở chat riêng. */
export async function openDirectChatAction(peerId: string) {
  const userId = await requireUserId();
  const conversationId = await getOrCreateDirectConversation(userId, peerId);
  redirect(`/chat?c=${conversationId}`);
}
