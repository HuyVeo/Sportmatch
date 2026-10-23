import Link from "next/link";
import { ArrowRight, LogOut } from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import { SiteLogo } from "@/components/layout/site-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { ViewerSummary } from "@/lib/data/users";

/**
 * Header trang công khai. Đã đăng nhập thì hiện người dùng + nút vào app +
 * đăng xuất, thay vì "Đăng nhập" (bấm vào sẽ bị chuyển thẳng vào app vì đã có
 * phiên, trông như "tự đăng nhập").
 */
export function SiteHeader({ viewer }: { viewer: ViewerSummary | null }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <SiteLogo />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {viewer ? (
            <>
              <Link
                href={`/profile/${viewer.id}`}
                className="hidden items-center gap-2 rounded-full border border-border py-1 pr-3 pl-1 transition-colors hover:bg-secondary sm:flex"
              >
                <UserAvatar
                  emoji={viewer.avatar}
                  src={viewer.avatarUrl}
                  name={viewer.name}
                  className="bg-brand size-8 text-base"
                />
                <span className="max-w-32 truncate text-sm font-semibold">
                  {viewer.name}
                </span>
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <LogOut className="size-4" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </button>
              </form>
              <Link
                href="/discover"
                className="bg-brand-gradient inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-opacity hover:opacity-90"
              >
                Vào SportMatch
                <ArrowRight className="size-4" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="bg-brand-gradient inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-opacity hover:opacity-90"
              >
                Đăng ký miễn phí
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
