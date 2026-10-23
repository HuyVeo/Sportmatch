"use client";

import { useState } from "react";
import { displayEmoji } from "@/lib/avatar";
import { cn } from "@/lib/utils";

/**
 * Avatar tròn của người chơi: ảnh đã upload nếu có (và tải được), ngược lại
 * emoji avatar hệ thống. Kích thước, nền và cỡ chữ emoji do `className` quyết
 * định, ví dụ `size-10 bg-secondary text-lg`.
 */
export function UserAvatar({
  emoji,
  src,
  name,
  className,
}: {
  emoji: string;
  src?: string | null;
  name: string;
  className?: string;
}) {
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);
  const showImage = src && src !== brokenSrc;

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full leading-none select-none",
        className,
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- ảnh người dùng qua /api/media, không cần tối ưu
        <img
          src={src}
          alt={name}
          className="size-full object-cover"
          onError={() => setBrokenSrc(src)}
        />
      ) : (
        <span aria-hidden>{displayEmoji(emoji)}</span>
      )}
    </span>
  );
}
