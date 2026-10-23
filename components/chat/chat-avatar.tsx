import Image from "next/image";
import { Trophy, Users } from "lucide-react";
import { displayEmoji } from "@/lib/avatar";
import type { ConversationKind } from "@/lib/types";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "size-8 text-base",
  md: "size-12 text-2xl",
  lg: "size-20 text-4xl",
} as const;

/**
 * Avatar tròn: ảnh đã upload nếu có, ngược lại emoji (avatar người chơi, icon môn
 * của trận, logo CLB). Nhóm trận / CLB có huy hiệu nhỏ góc dưới để phân biệt.
 */
export function ChatAvatar({
  image,
  emoji,
  name,
  kind = "direct",
  online = false,
  size = "md",
}: {
  image: string | null;
  emoji: string;
  name: string;
  kind?: ConversationKind;
  online?: boolean;
  size?: keyof typeof SIZES;
}) {
  const KindIcon = kind === "club" ? Users : kind === "match" ? Trophy : null;

  return (
    <span className={cn("relative inline-flex shrink-0", SIZES[size])}>
      <span
        className={cn(
          "flex size-full items-center justify-center overflow-hidden rounded-full",
          kind === "direct" ? "bg-brand/15" : "bg-secondary",
        )}
      >
        {image ? (
          <Image src={image} alt={name} width={80} height={80} unoptimized className="size-full object-cover" />
        ) : (
          <span aria-hidden className="leading-none">
            {kind === "direct" ? displayEmoji(emoji) : emoji}
          </span>
        )}
      </span>
      {KindIcon && size !== "sm" ? (
        <span className="bg-brand absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full border-2 border-card text-white">
          <KindIcon className="size-2.5" />
        </span>
      ) : null}
      {online && kind === "direct" ? (
        <span className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-card bg-emerald-500" />
      ) : null}
    </span>
  );
}
