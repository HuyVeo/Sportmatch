"use client";

import { useTransition } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { openDirectChatAction } from "@/app/(app)/chat/actions";

export function DirectMessageButton({ peerId }: { peerId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={() => {
        startTransition(async () => {
          await openDirectChatAction(peerId);
        });
      }}
    >
      <button
        type="submit"
        disabled={pending}
        className="bg-brand-gradient hover:opacity-90 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow transition-opacity disabled:opacity-50"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <MessageCircle className="size-4" />
        )}
        Nhắn tin
      </button>
    </form>
  );
}
