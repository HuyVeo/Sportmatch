"use client";

import { useState, useTransition } from "react";
import { ThumbsUp } from "lucide-react";
import { toggleCommunityVoteAction } from "@/app/(app)/profile/actions";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function CommunityVoteButton({
  targetUserId,
  initialVoted,
  initialCount,
  isOwnProfile,
}: {
  targetUserId: string;
  initialVoted: boolean;
  initialCount: number;
  isOwnProfile: boolean;
}) {
  const [voted, setVoted] = useState(initialVoted);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  if (isOwnProfile) {
    return (
      <span
        title="Tổng số lượt bình chọn tín nhiệm từ cộng đồng người chơi"
        className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400"
      >
        <ThumbsUp className="size-3.5 fill-current" />
        <span>{count} tín nhiệm</span>
      </span>
    );
  }

  function handleToggle() {
    startTransition(async () => {
      // Optimistic update
      const prevVoted = voted;
      const prevCount = count;
      const nextVoted = !voted;
      const nextCount = nextVoted ? count + 1 : Math.max(0, count - 1);

      setVoted(nextVoted);
      setCount(nextCount);

      const res = await toggleCommunityVoteAction(targetUserId);
      if (!res.ok) {
        setVoted(prevVoted);
        setCount(prevCount);
        toast.error(res.error ?? "Không thể thực hiện bình chọn.");
      } else {
        if (res.voted) {
          toast.success("Đã gửi 1 lượt bình chọn tín nhiệm thành công! 🌟");
        } else {
          toast.success("Đã hủy lượt bình chọn tín nhiệm.");
        }
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      title={voted ? "Bấm để hủy bình chọn" : "Bình chọn người chơi uy tín"}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 sm:px-4 sm:py-2 sm:text-sm",
        voted
          ? "border border-amber-500/40 bg-amber-500/15 text-amber-600 shadow-sm shadow-amber-500/10 hover:bg-amber-500/25 dark:text-amber-400"
          : "border border-border bg-secondary text-muted-foreground hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-500",
      )}
    >
      <ThumbsUp
        className={cn(
          "size-3.5 transition-transform sm:size-4",
          voted && "fill-current scale-110",
        )}
      />
      <span>{voted ? "Đã tín nhiệm" : "Tín nhiệm"}</span>
      <span
        className={cn(
          "rounded-full px-1.5 py-0.2 text-[11px] font-bold",
          voted
            ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
            : "bg-muted text-foreground/80",
        )}
      >
        {count}
      </span>
    </button>
  );
}
