"use client";

import Link from "next/link";
import {
  Fragment,
  startTransition,
  useEffect,
  useOptimistic,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { ArrowLeft, PanelRight, SendHorizontal, X } from "lucide-react";
import { markReadAction, sendMessageAction } from "@/app/(app)/chat/actions";
import { ChatAvatar } from "@/components/chat/chat-avatar";
import { dayKey, formatClock, formatDayDivider } from "@/components/chat/chat-format";
import type { ChatConversationDetail, ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

const MAX_MESSAGE_LENGTH = 2000;
/** Tin liên tiếp cùng người gửi trong khoảng này được gộp (không lặp avatar/tên). */
const GROUP_GAP_MS = 5 * 60_000;
/** Cách nhau lâu hơn mốc này thì chèn mốc giờ ở giữa, như Zalo. */
const TIME_DIVIDER_GAP_MS = 30 * 60_000;

type PendingMessage = ChatMessage & { pending?: true };

const LINK_LABEL = {
  direct: "Xem hồ sơ",
  match: "Xem trận đấu",
  club: "Xem trang CLB",
} as const;

function subtitleOf(conversation: ChatConversationDetail) {
  if (conversation.kind !== "direct") return `${conversation.memberCount} thành viên`;
  return conversation.peer?.isOnline ? "Đang hoạt động" : "Chat riêng";
}

export function ChatWindow({
  conversation,
  messages,
  viewerId,
  backHref,
  className,
}: {
  conversation: ChatConversationDetail;
  messages: ChatMessage[];
  viewerId: string;
  /** Nút quay lại danh sách (chỉ hiện trên di động). Bỏ trống khi nhúng trong trang khác. */
  backHref?: string;
  className?: string;
}) {
  const [showInfo, setShowInfo] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [optimisticMessages, addOptimistic] = useOptimistic<PendingMessage[], PendingMessage>(
    messages,
    (current, message) => [...current, message],
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Mở hội thoại có tin chưa đọc → đánh dấu đã đọc (badge header cập nhật theo).
  useEffect(() => {
    if (conversation.unreadCount > 0) void markReadAction(conversation.id);
  }, [conversation.id, conversation.unreadCount]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [conversation.id, optimisticMessages.length]);

  // Ô nhập tự giãn theo nội dung, tối đa ~6 dòng.
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 160)}px`;
  }, [draft]);

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const body = draft.trim();
    if (!body) return;

    setDraft("");
    setError(null);
    startTransition(async () => {
      addOptimistic({
        id: `pending-${Date.now()}`,
        conversationId: conversation.id,
        senderId: viewerId,
        senderName: "",
        senderAvatar: "",
        senderImage: null,
        body,
        createdAt: new Date().toISOString(),
        pending: true,
      });
      const result = await sendMessageAction(conversation.id, body);
      if (result.error) {
        setError(result.error);
        setDraft(body);
      }
    });
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter gửi, Shift+Enter xuống dòng; bỏ qua khi bộ gõ đang ghép chữ.
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  }

  const isGroup = conversation.kind !== "direct";
  const lastOwnIndex = optimisticMessages.findLastIndex((message) => message.senderId === viewerId);

  return (
    <div className={cn("relative flex h-full min-h-0 overflow-hidden", className)}>
      <section className="flex min-w-0 flex-1 flex-col" aria-label={`Hội thoại ${conversation.title}`}>
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-3 sm:px-4">
          {backHref ? (
            <Link
              href={backHref}
              aria-label="Quay lại danh sách"
              className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary md:hidden"
            >
              <ArrowLeft className="size-5" />
            </Link>
          ) : null}
          <Link href={conversation.href} className="flex min-w-0 items-center gap-3">
            <ChatAvatar
              image={conversation.image}
              emoji={conversation.avatar}
              name={conversation.title}
              kind={conversation.kind}
              online={conversation.peer?.isOnline}
              size="sm"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{conversation.title}</p>
              <p
                className={cn(
                  "truncate text-xs",
                  conversation.peer?.isOnline ? "text-emerald-500" : "text-muted-foreground",
                )}
              >
                {subtitleOf(conversation)}
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setShowInfo((value) => !value)}
            aria-pressed={showInfo}
            aria-label="Thông tin hội thoại"
            className={cn(
              "ml-auto flex size-9 items-center justify-center rounded-full transition-colors",
              showInfo ? "bg-brand/10 text-brand" : "text-muted-foreground hover:bg-secondary",
            )}
          >
            <PanelRight className="size-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-secondary/40 px-3 py-4 sm:px-6" aria-live="polite">
          {optimisticMessages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ChatAvatar
                image={conversation.image}
                emoji={conversation.avatar}
                name={conversation.title}
                kind={conversation.kind}
                size="lg"
              />
              <p className="mt-4 font-bold">{conversation.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Chưa có tin nhắn. Gửi lời chào để bắt đầu cuộc trò chuyện!
              </p>
            </div>
          ) : (
            optimisticMessages.map((message, index) => {
              const previous = optimisticMessages[index - 1];
              const next = optimisticMessages[index + 1];
              const time = Date.parse(message.createdAt);
              const newDay = !previous || dayKey(new Date(previous.createdAt)) !== dayKey(new Date(time));
              const longGap = previous && time - Date.parse(previous.createdAt) > TIME_DIVIDER_GAP_MS;
              const startsGroup =
                newDay ||
                longGap ||
                previous?.senderId !== message.senderId ||
                time - Date.parse(previous.createdAt) > GROUP_GAP_MS;
              const endsGroup =
                !next ||
                next.senderId !== message.senderId ||
                Date.parse(next.createdAt) - time > GROUP_GAP_MS ||
                dayKey(new Date(next.createdAt)) !== dayKey(new Date(time));
              const own = message.senderId === viewerId;
              const seen =
                conversation.peerLastReadAt !== null &&
                Date.parse(conversation.peerLastReadAt) >= time;

              return (
                <Fragment key={message.id}>
                  {newDay || longGap ? (
                    <div className="my-4 flex justify-center">
                      <span
                        suppressHydrationWarning
                        className="rounded-full bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm"
                      >
                        {newDay
                          ? `${formatClock(message.createdAt)} ${formatDayDivider(message.createdAt)}`
                          : formatClock(message.createdAt)}
                      </span>
                    </div>
                  ) : null}

                  <div
                    className={cn(
                      "flex items-end gap-2",
                      own ? "justify-end" : "justify-start",
                      startsGroup ? "mt-3" : "mt-0.5",
                    )}
                  >
                    {!own && isGroup ? (
                      endsGroup ? (
                        <ChatAvatar
                          image={message.senderImage}
                          emoji={message.senderAvatar}
                          name={message.senderName}
                          size="sm"
                        />
                      ) : (
                        <span className="w-8 shrink-0" />
                      )
                    ) : null}
                    <div className={cn("flex max-w-[75%] flex-col", own ? "items-end" : "items-start")}>
                      {!own && isGroup && startsGroup ? (
                        <span className="mb-1 px-1 text-[11px] font-medium text-muted-foreground">
                          {message.senderName}
                        </span>
                      ) : null}
                      <div
                        className={cn(
                          "rounded-2xl px-3.5 py-2 text-sm leading-relaxed break-words whitespace-pre-wrap shadow-sm",
                          own
                            ? "bg-brand text-white"
                            : "border border-border bg-card text-card-foreground",
                          own && endsGroup && "rounded-br-md",
                          !own && endsGroup && "rounded-bl-md",
                          message.pending && "opacity-70",
                        )}
                      >
                        {message.body}
                        {endsGroup ? (
                          <span
                            suppressHydrationWarning
                            className={cn(
                              "mt-1 block text-[10px]",
                              own ? "text-white/75" : "text-muted-foreground",
                            )}
                          >
                            {formatClock(message.createdAt)}
                          </span>
                        ) : null}
                      </div>
                      {own && index === lastOwnIndex ? (
                        <span className="mt-1 px-1 text-[10px] text-muted-foreground">
                          {message.pending
                            ? "Đang gửi"
                            : !isGroup && seen
                              ? "Đã xem"
                              : "Đã gửi"}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Fragment>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {error ? (
          <p role="alert" className="border-t border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-500">
            {error}
          </p>
        ) : null}

        <form onSubmit={submit} className="flex shrink-0 items-end gap-2 border-t border-border bg-card p-3">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            maxLength={MAX_MESSAGE_LENGTH}
            aria-label="Tin nhắn"
            placeholder={`Nhập tin nhắn tới ${conversation.title}`}
            className="focus:border-brand max-h-40 min-h-11 flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="Gửi tin nhắn"
            className="bg-brand-gradient flex size-11 shrink-0 items-center justify-center rounded-full text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <SendHorizontal className="size-5" />
          </button>
        </form>
      </section>

      {showInfo ? (
        <ChatInfoPanel conversation={conversation} onClose={() => setShowInfo(false)} />
      ) : null}
    </div>
  );
}

function ChatInfoPanel({
  conversation,
  onClose,
}: {
  conversation: ChatConversationDetail;
  onClose: () => void;
}) {
  return (
    <aside
      aria-label="Thông tin hội thoại"
      className="absolute inset-0 z-10 flex flex-col overflow-y-auto border-l border-border bg-card lg:static lg:w-80 lg:shrink-0"
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
        <p className="font-bold">Thông tin hội thoại</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
        >
          <X className="size-5" />
        </button>
      </div>
      <div className="flex flex-col items-center border-b border-border px-4 py-6 text-center">
        <ChatAvatar
          image={conversation.image}
          emoji={conversation.avatar}
          name={conversation.title}
          kind={conversation.kind}
          size="lg"
        />
        <p className="mt-3 font-bold">{conversation.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitleOf(conversation)}</p>
        <Link
          href={conversation.href}
          className="mt-4 rounded-full border border-border px-4 py-2 text-xs font-semibold transition-colors hover:border-brand hover:text-brand"
        >
          {LINK_LABEL[conversation.kind]}
        </Link>
      </div>
      {conversation.kind !== "direct" ? (
        <div className="px-4 py-4">
          <p className="text-sm font-semibold">Thành viên ({conversation.members.length})</p>
          <ul className="mt-3 space-y-1">
            {conversation.members.map((member) => (
              <li key={member.id}>
                <Link
                  href={`/profile/${member.id}`}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-secondary"
                >
                  <ChatAvatar
                    image={member.image}
                    emoji={member.avatar}
                    name={member.name}
                    online={member.isOnline}
                    size="sm"
                  />
                  <span className="truncate text-sm">{member.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
