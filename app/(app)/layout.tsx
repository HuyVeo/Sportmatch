import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { RealtimeListener } from "@/components/chat/realtime-listener";
import { DiscoverIntroProvider } from "@/components/discover/discover-intro-provider";
import { Toaster } from "@/components/ui/toast";
import { countUnreadMessages } from "@/lib/data/chat";
import { countUnreadNotifications } from "@/lib/data/notifications";
import { getCurrentUser } from "@/lib/data/users";
import { userRealtimeTopic } from "@/lib/realtime/broadcast";

// Mọi trang trong nhóm này đều phụ thuộc phiên đăng nhập và dữ liệu người dùng,
// nên không prerender — tránh cả việc build phải kết nối database.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const [unreadNotifications, unreadMessages] = await Promise.all([
    countUnreadNotifications(user.id),
    countUnreadMessages(user.id),
  ]);
  const displayName = user.name.split(" ").at(-1) ?? user.name;

  return (
    <>
      <AppHeader
        userId={user.id}
        displayName={displayName}
        avatar={user.avatar}
        avatarUrl={user.avatarUrl}
        isPro={user.isPro}
        unreadNotifications={unreadNotifications}
        unreadMessages={unreadMessages}
      />
      <RealtimeListener topic={userRealtimeTopic(user.id)} />
      <DiscoverIntroProvider>
        <Toaster>
          <div className="flex-1 pb-20 lg:pb-0">{children}</div>
        </Toaster>
      </DiscoverIntroProvider>
      <MobileNav
        userId={user.id}
        displayName={displayName}
        avatar={user.avatar}
        avatarUrl={user.avatarUrl}
      />
    </>
  );
}
