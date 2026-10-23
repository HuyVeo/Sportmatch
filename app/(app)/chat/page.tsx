import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { ChatWindow } from "@/components/chat/chat-window";
import { ConversationList } from "@/components/chat/conversation-list";
import {
  findGroupConversationId,
  getConversation,
  getConversations,
  getMessages,
} from "@/lib/data/chat";
import { getCurrentUser } from "@/lib/data/users";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tin nhắn · SportMatch",
};

export default async function ChatPage({
  searchParams,
}: {
  // ?c=<hội thoại>, hoặc ?match=<trận> / ?club=<CLB> để mở thẳng nhóm chat từ trang trận / CLB.
  searchParams: Promise<{ c?: string; match?: string; club?: string }>;
}) {
  const [params, currentUser] = await Promise.all([searchParams, getCurrentUser()]);
  const conversations = await getConversations(currentUser.id);

  // Trạng thái rỗng giữ đúng ảnh gốc.
  if (conversations.length === 0) {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight">Tin nhắn</h1>
        <p className="mt-2 text-sm text-muted-foreground">Realtime · cập nhật tự động</p>

        <div className="mt-8 rounded-2xl border border-border bg-card px-6 py-14 text-center">
          <MessageCircle className="mx-auto size-10 text-muted-foreground/40" />
          <p className="mt-6 text-sm text-muted-foreground">
            Chưa có hội thoại. Vào trận đấu để chat với chủ trận hoặc team!
          </p>
          <Link
            href="/matches"
            className="bg-brand-gradient shadow-brand/30 mt-6 inline-flex rounded-full px-7 py-3 text-sm font-semibold text-white shadow-xl transition-opacity hover:opacity-90"
          >
            Xem trận đấu
          </Link>
        </div>
      </div>
    );
  }

  const requestedId =
    params.c ??
    (params.match
      ? await findGroupConversationId({ matchId: params.match }, currentUser.id)
      : params.club
        ? await findGroupConversationId({ clubId: params.club }, currentUser.id)
        : null);
  const active = requestedId ? await getConversation(requestedId, currentUser.id) : null;
  const messages = active ? await getMessages(active.id, currentUser.id) : [];

  return (
    // Chiều cao = màn hình trừ header 64px; trên di động chỉ hiện 1 cột (danh sách ↔ khung chat).
    <div className="mx-auto flex h-[calc(100dvh-4rem)] w-full max-w-[1600px] overflow-hidden border-x border-border bg-card">
      <aside
        className={cn(
          "w-full shrink-0 border-r border-border md:block md:w-80 lg:w-96",
          active ? "hidden" : "block",
        )}
      >
        <ConversationList
          conversations={conversations}
          activeId={active?.id ?? null}
          viewerId={currentUser.id}
        />
      </aside>

      <main className={cn("min-w-0 flex-1", active ? "block" : "hidden md:block")}>
        {active ? (
          <ChatWindow
            key={active.id}
            conversation={active}
            messages={messages}
            viewerId={currentUser.id}
            backHref="/chat"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <MessageCircle className="size-12 text-muted-foreground/40" />
            <p className="mt-4 font-bold">Chào mừng đến với Tin nhắn SportMatch</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Chọn một hội thoại bên trái để bắt đầu trò chuyện với người chơi, nhóm trận hoặc
              câu lạc bộ của bạn.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
