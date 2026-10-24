"use client";

import { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  cancelJoinRequestAction,
  completeMatchAction,
  leaveMatchAction,
  requestToJoinAction,
  respondToInviteAction,
  reviewJoinRequestAction,
  type MatchActionState,
} from "@/app/(app)/matches/actions";
import type { ViewerRole } from "@/lib/types";
import { cn } from "@/lib/utils";

const variants = {
  success: "bg-success-muted text-success hover:opacity-90",
  brand: "bg-brand-gradient text-white shadow-brand/25 shadow-lg hover:opacity-90",
  outline: "border border-border text-muted-foreground hover:text-foreground",
  danger: "border border-destructive/40 text-destructive hover:bg-destructive/10",
  muted: "bg-secondary text-muted-foreground",
} as const;

type Variant = keyof typeof variants;
type Size = "sm" | "md";

const sizes: Record<Size, string> = {
  sm: "px-4 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
};

function buttonClass(variant: Variant, size: Size, className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    sizes[size],
    className,
  );
}

/** Nút gọi một server action, tự hiện trạng thái chờ và lỗi nghiệp vụ. */
export function ActionButton({
  action,
  variant,
  size = "md",
  className,
  children,
}: {
  action: () => Promise<MatchActionState>;
  variant: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await action();
            setError(result.error);
          })
        }
        className={buttonClass(variant, size, className)}
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : null}
        {children}
      </button>
      {error ? (
        <span role="alert" className="text-destructive text-xs">
          {error}
        </span>
      ) : null}
    </span>
  );
}

function StaticLabel({
  variant,
  size,
  children,
}: {
  variant: Variant;
  size: Size;
  children: ReactNode;
}) {
  return <span className={buttonClass(variant, size)}>{children}</span>;
}

/** Nút góc dưới phải của thẻ trận, đổi theo vai trò người xem. */
export function MatchCardAction({
  matchId,
  role,
  isFull,
  isOpen,
}: {
  matchId: string;
  role: ViewerRole;
  isFull: boolean;
  /** Trận còn nhận người: sắp diễn ra và công khai (hoặc mình được mời). */
  isOpen: boolean;
}) {
  const detailHref = `/matches/${matchId}`;

  if (role === "host") {
    return (
      <Link href={detailHref} className={buttonClass("success", "sm")}>
        Mời chơi
      </Link>
    );
  }
  if (role === "joined") {
    return (
      <Link href={detailHref} className={buttonClass("outline", "sm")}>
        Đã tham gia
      </Link>
    );
  }
  if (role === "requested") {
    return (
      <StaticLabel variant="muted" size="sm">
        Đã gửi yêu cầu
      </StaticLabel>
    );
  }
  if (role === "invited" && !isFull && isOpen) {
    return (
      <ActionButton
        variant="success"
        size="sm"
        action={() => respondToInviteAction(matchId, true)}
      >
        Nhận lời
      </ActionButton>
    );
  }
  if (isFull && role !== "invited") {
    return (
      <StaticLabel variant="muted" size="sm">
        Đã đủ
      </StaticLabel>
    );
  }
  // Người được mời vào trận đã đủ / đã đóng vẫn cần vào chi tiết để từ chối.
  if (!isOpen || role === "invited") {
    return (
      <Link href={detailHref} className={buttonClass("outline", "sm")}>
        Xem trận
      </Link>
    );
  }
  return (
    <ActionButton
      variant="success"
      size="sm"
      action={() => requestToJoinAction(matchId)}
    >
      Xin tham gia
    </ActionButton>
  );
}

/** Khối hành động chính ở trang chi tiết trận. */
export function MatchDetailActions({
  matchId,
  role,
  isFull,
  isOpen,
  isUpcoming,
  isCompleted,
}: {
  matchId: string;
  role: ViewerRole;
  isFull: boolean;
  isOpen: boolean;
  /** Rời trận chỉ cần trận chưa diễn ra, bất kể quyền hiển thị. */
  isUpcoming: boolean;
  isCompleted?: boolean;
}) {
  const chat = (
    <Link href={`/chat?match=${matchId}`} className={buttonClass("outline", "md")}>
      Chat nhóm trận
    </Link>
  );

  if (isCompleted) {
    if (role === "host" || role === "joined") {
      return (
        <div className="flex flex-wrap items-center gap-3">
          {chat}
          <Link
            href="/ratings"
            className={buttonClass("brand", "md")}
          >
            ⭐ Đánh giá đồng đội
          </Link>
          <span className="bg-success-muted text-success rounded-full px-4 py-2 text-sm font-semibold">
            Đã hoàn tất
          </span>
        </div>
      );
    }
    return (
      <div className="flex flex-wrap items-center gap-3">
        <StaticLabel variant="muted" size="md">
          Trận đấu đã hoàn tất
        </StaticLabel>
      </div>
    );
  }

  if (role === "host") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {chat}
        <ActionButton
          variant="success"
          action={() => completeMatchAction(matchId)}
        >
          Hoàn thành trận đấu
        </ActionButton>
      </div>
    );
  }

  if (role === "joined") {
    return (
      <div className="flex flex-wrap items-start gap-3">
        {chat}
        {isUpcoming ? (
          <ActionButton variant="danger" action={() => leaveMatchAction(matchId)}>
            Rời trận
          </ActionButton>
        ) : null}
      </div>
    );
  }

  if (!isOpen) {
    return (
      <p className="text-sm text-muted-foreground">
        Trận không còn nhận người tham gia.
      </p>
    );
  }

  if (role === "requested") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <StaticLabel variant="muted" size="md">
          Đang chờ chủ trận duyệt
        </StaticLabel>
        <ActionButton
          variant="outline"
          action={() => cancelJoinRequestAction(matchId)}
        >
          Rút yêu cầu
        </ActionButton>
      </div>
    );
  }

  if (role === "invited") {
    return (
      <div className="flex flex-wrap items-start gap-3">
        <ActionButton
          variant="brand"
          action={() => respondToInviteAction(matchId, true)}
        >
          Nhận lời mời
        </ActionButton>
        <ActionButton
          variant="outline"
          action={() => respondToInviteAction(matchId, false)}
        >
          Từ chối
        </ActionButton>
      </div>
    );
  }

  if (isFull) {
    return (
      <StaticLabel variant="muted" size="md">
        Trận đã đủ người
      </StaticLabel>
    );
  }

  return (
    <ActionButton variant="brand" action={() => requestToJoinAction(matchId)}>
      Xin tham gia
    </ActionButton>
  );
}

/** Nút Chấp nhận / Từ chối của chủ trận cho một yêu cầu tham gia. */
export function ReviewRequestActions({
  matchId,
  requesterId,
  canApprove,
}: {
  matchId: string;
  requesterId: string;
  canApprove: boolean;
}) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      {canApprove ? (
        <ActionButton
          variant="success"
          size="sm"
          action={() => reviewJoinRequestAction(matchId, requesterId, true)}
        >
          Chấp nhận
        </ActionButton>
      ) : null}
      <ActionButton
        variant="outline"
        size="sm"
        action={() => reviewJoinRequestAction(matchId, requesterId, false)}
      >
        Từ chối
      </ActionButton>
    </div>
  );
}
