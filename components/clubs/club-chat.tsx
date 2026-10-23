"use client";

import Link from "next/link";
import { ExternalLink, LockKeyhole, MessageCircle } from "lucide-react";
import { openDirectChatAction } from "@/app/(app)/chat/actions";
import { ChatWindow } from "@/components/chat/chat-window";
import type { ClubViewerAccess } from "@/lib/clubs/viewer-access";
import type { ChatConversationDetail, ChatMessage } from "@/lib/types";

export type ClubChatData = {
  conversation: ChatConversationDetail;
  messages: ChatMessage[];
};

/**
 * Tab "Trò chuyện" của CLB. Chủ CLB + thành viên đã duyệt thấy nhóm chat nội bộ
 * (cùng hội thoại với mục Tin nhắn); người chưa vào CLB được mời nhắn riêng chủ CLB.
 */
export function ClubChat({
  clubId,
  viewerAccess,
  chat,
}: {
  clubId: string;
  viewerAccess?: ClubViewerAccess;
  chat?: ClubChatData | null;
}) {
  if (!viewerAccess?.isPersisted) {
    return <Notice>Chat chỉ khả dụng với CLB đã được lưu trong hệ thống.</Notice>;
  }
  if (!viewerAccess.isAuthenticated || !viewerAccess.userId) {
    return <Notice>Đăng nhập để tham gia cuộc trò chuyện.</Notice>;
  }

  if (chat) {
    return (
      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <LockKeyhole className="size-4 text-emerald-600" />
            Nhóm chat nội bộ — chỉ chủ CLB và thành viên đã được duyệt
          </p>
          <Link
            href={`/chat?club=${clubId}`}
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700"
          >
            Mở trong Tin nhắn
            <ExternalLink className="size-3.5" />
          </Link>
        </div>
        <ChatWindow
          conversation={chat.conversation}
          messages={chat.messages}
          viewerId={viewerAccess.userId}
          className="h-[min(70vh,600px)] rounded-xl border border-border bg-card"
        />
      </section>
    );
  }

  const ownerId = viewerAccess.ownerId;
  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-6 text-center">
      <MessageCircle className="mx-auto size-8 text-orange-500" />
      <h2 className="mt-3 font-bold text-slate-900">Hỏi đáp với chủ CLB</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">
        {viewerAccess.membershipStatus === "PENDING"
          ? "Yêu cầu của bạn đang chờ chủ CLB duyệt. Khi được duyệt, bạn sẽ tự động vào nhóm chat của CLB."
          : "Nhắn riêng cho chủ CLB để hỏi thêm trước khi gia nhập. Thành viên được duyệt sẽ tự động vào nhóm chat của CLB."}
      </p>
      {ownerId && ownerId !== viewerAccess.userId ? (
        <form action={openDirectChatAction.bind(null, ownerId)} className="mt-4">
          <button
            type="submit"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            <MessageCircle className="size-4" />
            Nhắn tin cho chủ CLB
          </button>
        </form>
      ) : null}
    </section>
  );
}

function Notice({ children }: { children: string }) {
  return (
    <p className="mt-5 rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
      {children}
    </p>
  );
}
