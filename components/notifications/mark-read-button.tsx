"use client";

import { useTransition } from "react";
import { CheckCheck, Loader2 } from "lucide-react";
import { markAllNotificationsReadAction } from "@/app/(app)/notifications/actions";
import { useToast } from "@/components/ui/toast";

export function MarkAllReadButton() {
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  function handleClick() {
    startTransition(async () => {
      await markAllNotificationsReadAction();
      toast.success("Đã đánh dấu tất cả thông báo là đã đọc.");
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <CheckCheck className="size-3.5" />
      )}
      Đánh dấu đã đọc tất cả
    </button>
  );
}
