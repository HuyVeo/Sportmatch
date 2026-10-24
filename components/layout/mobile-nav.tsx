"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Compass,
  Plus,
  Users,
} from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

export function MobileNav({
  userId,
  avatar,
  avatarUrl,
  displayName,
}: {
  userId: string;
  avatar: string;
  avatarUrl: string | null;
  displayName: string;
}) {
  const pathname = usePathname();

  const isDiscover = pathname.startsWith("/discover");
  const isClubs = pathname.startsWith("/clubs");
  const isCreate = pathname === "/matches/create";
  const isMatches = pathname.startsWith("/matches") && !isCreate;
  const isProfile = pathname.startsWith(`/profile/${userId}`);

  return (
    <nav
      aria-label="Điều hướng di động"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex h-14 max-w-md items-center justify-around px-2">
        {/* Khám phá */}
        <Link
          href="/discover"
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[11px] font-medium transition-colors",
            isDiscover
              ? "text-brand font-bold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Compass
            className={cn(
              "size-5 transition-transform",
              isDiscover && "scale-110",
            )}
          />
          <span>Khám phá</span>
        </Link>

        {/* Câu lạc bộ */}
        <Link
          href="/clubs"
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[11px] font-medium transition-colors",
            isClubs
              ? "text-brand font-bold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Users
            className={cn(
              "size-5 transition-transform",
              isClubs && "scale-110",
            )}
          />
          <span>CLB</span>
        </Link>

        {/* Nút Tạo trận nổi bật ở giữa */}
        <div className="flex flex-1 flex-col items-center justify-center">
          <Link
            href="/matches/create"
            aria-label="Tạo trận đấu mới"
            className="group relative -top-3.5 flex size-12 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/35 transition-transform duration-200 active:scale-95"
          >
            <Plus className="size-6 transition-transform group-hover:rotate-90 duration-200" />
          </Link>
          <span className="-mt-2.5 text-[10px] font-semibold text-muted-foreground">
            Tạo trận
          </span>
        </div>

        {/* Trận đấu */}
        <Link
          href="/matches"
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[11px] font-medium transition-colors",
            isMatches
              ? "text-brand font-bold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <CalendarDays
            className={cn(
              "size-5 transition-transform",
              isMatches && "scale-110",
            )}
          />
          <span>Trận đấu</span>
        </Link>

        {/* Hồ sơ cá nhân */}
        <Link
          href={`/profile/${userId}`}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[11px] font-medium transition-colors",
            isProfile
              ? "text-brand font-bold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <div
            className={cn(
              "relative rounded-full transition-all",
              isProfile && "ring-2 ring-brand ring-offset-2 ring-offset-background",
            )}
          >
            <UserAvatar
              emoji={avatar}
              src={avatarUrl}
              name={displayName}
              className="size-5 text-[11px]"
            />
          </div>
          <span>Tôi</span>
        </Link>
      </div>
    </nav>
  );
}
