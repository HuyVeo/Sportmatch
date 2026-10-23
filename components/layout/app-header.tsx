"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Crown,
  History,
  LogOut,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  Settings,
  Star,
  Trophy,
  User as UserIcon,
  Users,
} from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import { SiteLogo } from "@/components/layout/site-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/discover", label: "Khám phá", icon: Search },
  { href: "/clubs", label: "Câu lạc bộ", icon: Users },
  { href: "/matches", label: "Trận đấu", icon: CalendarDays },
  { href: "/courts", label: "Sân bãi", icon: MapPin },
  { href: "/ranking", label: "Xếp hạng", icon: Trophy },
];

export function AppHeader({
  userId,
  displayName,
  avatar,
  avatarUrl,
  isPro,
  unreadNotifications,
  unreadMessages,
}: {
  userId: string;
  displayName: string;
  avatar: string;
  avatarUrl: string | null;
  isPro: boolean;
  unreadNotifications: number;
  unreadMessages: number;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-3 px-4 sm:gap-6 sm:px-6">
        <SiteLogo href="/discover" />

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand/10 text-brand"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          <Link
            href="/matches/create"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#fff0e6] px-5 py-2.5 text-sm font-semibold text-[#ff5722] shadow-sm shadow-orange-950/5 transition-all duration-200 ease-in-out hover:bg-orange-400 hover:text-white hover:shadow-orange-500/20 active:bg-[#e64a19] active:text-white"
          >
            <Plus className="size-4" />
            Tạo trận
          </Link>

          <Link
            href="/notifications"
            aria-label="Thông báo"
            className="relative flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
          >
            <Bell className="size-5" />
            {unreadNotifications > 0 && (
              <span className="bg-brand absolute top-1 right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-bold text-white">
                {unreadNotifications}
              </span>
            )}
          </Link>

          <Link
            href="/chat"
            aria-label="Tin nhắn"
            className="relative flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
          >
            <MessageCircle className="size-5" />
            {unreadMessages > 0 && (
              <span className="bg-brand absolute top-1 right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-bold text-white">
                {unreadMessages}
              </span>
            )}
          </Link>

          {isPro && (
            <span className="hidden sm:flex items-center gap-1 rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-400">
              <Crown className="size-3" />
              Pro
            </span>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-border p-0.5 sm:py-1 sm:pr-3 sm:pl-1 transition-colors hover:bg-secondary">
              <UserAvatar
                emoji={avatar}
                src={avatarUrl}
                name={displayName}
                className="bg-brand size-8 text-base"
              />
              <span className="hidden sm:inline text-sm font-semibold">{displayName}</span>
              <ChevronDown className="hidden sm:inline size-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem asChild>
                <Link href={`/profile/${userId}`}>
                  <UserIcon className="size-4" />
                  Hồ sơ cá nhân
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/history">
                  <History className="size-4" />
                  Lịch sử trận đấu
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/ratings">
                  <Star className="size-4" />
                  Đánh giá
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="size-4" />
                  Cài đặt
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2"
                  >
                    <LogOut className="size-4" />
                    Đăng xuất
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
