"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";
import { ChatAvatar } from "@/components/chat/chat-avatar";
import { formatListTime } from "@/components/chat/chat-format";
import type { ChatConversation, ConversationKind } from "@/lib/types";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<ConversationKind, string | null> = {
  direct: null,
  match: "Trận",
  club: "CLB",
};

type Filter = "all" | "unread";

/** Không phân biệt dấu khi tìm: "tay ho" khớp "Tây Hồ". */
function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export function ConversationList({
  conversations,
  activeId,
  viewerId,
}: {
  conversations: ChatConversation[];
  activeId: string | null;
  viewerId: string;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const keyword = normalize(query.trim());
  const visible = conversations.filter(
    (conversation) =>
      (filter === "all" || conversation.unreadCount > 0) &&
      (!keyword || normalize(conversation.title).includes(keyword)),
  );
  const unreadTotal = conversations.filter((conversation) => conversation.unreadCount > 0).length;

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-border p-4">
        <h1 className="text-xl font-extrabold tracking-tight">Tin nhắn</h1>
        <label className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm kiếm"
            aria-label="Tìm hội thoại"
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </label>
        <div className="flex gap-1" role="tablist" aria-label="Lọc hội thoại">
          {(
            [
              ["all", "Tất cả"],
              ["unread", unreadTotal > 0 ? `Chưa đọc (${unreadTotal})` : "Chưa đọc"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={filter === value}
              onClick={() => setFilter(value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                filter === value
                  ? "bg-brand/10 text-brand"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto">
        {visible.length === 0 ? (
          <li className="px-6 py-10 text-center text-sm text-muted-foreground">
            {keyword ? "Không tìm thấy hội thoại phù hợp." : "Không có hội thoại chưa đọc."}
          </li>
        ) : (
          visible.map((conversation) => {
            const unread = conversation.unreadCount > 0;
            const last = conversation.lastMessage;
            // "Bạn: ..." cho tin của mình; trong nhóm thêm tên người gửi như Zalo.
            const sender = !last
              ? ""
              : last.senderId === viewerId
                ? "Bạn: "
                : conversation.kind === "direct"
                  ? ""
                  : `${last.senderName.split(" ").at(-1)}: `;
            const preview = last
              ? sender + last.body
              : conversation.kind === "direct"
                ? "Bắt đầu trò chuyện"
                : `${conversation.memberCount} thành viên · Chưa có tin nhắn`;
            const label = KIND_LABEL[conversation.kind];

            return (
              <li key={conversation.id}>
                <Link
                  href={`/chat?c=${conversation.id}`}
                  scroll={false}
                  aria-current={conversation.id === activeId ? "true" : undefined}
                  className={cn(
                    "flex items-center gap-3 border-l-2 px-4 py-3 transition-colors",
                    conversation.id === activeId
                      ? "border-brand bg-brand/5"
                      : "border-transparent hover:bg-secondary/60",
                  )}
                >
                  <ChatAvatar
                    image={conversation.image}
                    emoji={conversation.avatar}
                    name={conversation.title}
                    kind={conversation.kind}
                    online={conversation.peer?.isOnline}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={cn("truncate text-sm", unread ? "font-bold" : "font-semibold")}>
                        {conversation.title}
                      </p>
                      {label ? (
                        <span className="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          {label}
                        </span>
                      ) : null}
                      <span
                        suppressHydrationWarning
                        className={cn(
                          "ml-auto shrink-0 text-[11px]",
                          unread ? "text-brand font-semibold" : "text-muted-foreground",
                        )}
                      >
                        {formatListTime(last?.createdAt ?? conversation.lastMessageAt)}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <p
                        className={cn(
                          "truncate text-[13px]",
                          unread ? "font-semibold text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {preview}
                      </p>
                      {unread ? (
                        <span className="bg-brand ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white">
                          {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
