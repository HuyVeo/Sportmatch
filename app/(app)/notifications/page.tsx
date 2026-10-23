import type { Metadata } from "next";
import Link from "next/link";
import { Bell } from "lucide-react";
import { MarkAllReadButton } from "@/components/notifications/mark-read-button";
import { getNotifications } from "@/lib/data/notifications";
import { getCurrentUser } from "@/lib/data/users";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Thông báo · SportMatch",
};

export default async function NotificationsPage() {
  const currentUser = await getCurrentUser();
  const notifications = await getNotifications(currentUser.id);
  const unread = notifications.filter(
    (notification) => notification.readAt === null,
  ).length;

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Thông báo</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {unread === 0 ? "Bạn đã xử lý xong!" : `${unread} thông báo chưa đọc`}
          </p>
        </div>
        {unread > 0 ? <MarkAllReadButton /> : null}
      </div>

      {notifications.length === 0 ? (
        <div className="mt-24 text-center">
          <Bell className="mx-auto size-10 text-muted-foreground/40" />
          <p className="mt-6 text-muted-foreground">Chưa có thông báo</p>
          <Link
            href="/matches"
            className="text-brand mt-6 inline-flex font-semibold hover:underline"
          >
            Khám phá trận đấu
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={cn(
                "rounded-2xl border border-border bg-card p-5 transition-colors",
                notification.readAt === null && "border-brand/40 bg-brand/5",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {notification.readAt === null ? (
                    <span className="bg-brand size-2 shrink-0 rounded-full" />
                  ) : null}
                  <p className="font-semibold">{notification.title}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatRelativeTime(notification.createdAt)}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {notification.body}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                {notification.matchId ? (
                  <Link
                    href={`/matches/${notification.matchId}`}
                    className="text-brand inline-flex text-sm font-semibold hover:underline"
                  >
                    Xem trận
                  </Link>
                ) : null}
                {notification.type === "rating" ? (
                  <Link
                    href="/ratings"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-amber-500 hover:underline"
                  >
                    ⭐ Đánh giá ngay
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
