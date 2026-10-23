"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

/** Gộp nhiều tín hiệu sát nhau thành 1 lần tải lại. */
const REFRESH_DELAY_MS = 150;

/**
 * Nghe kênh realtime riêng của người dùng (Supabase Broadcast). Có tín hiệu "chat"
 * → tải lại dữ liệu server của trang hiện tại: tin nhắn mới, danh sách hội thoại,
 * số chưa đọc trên header. State phía client (ô đang gõ...) vẫn giữ nguyên.
 */
export function RealtimeListener({ topic }: { topic: string | null }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!topic || !supabase) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let subscribedBefore = false;
    const refreshSoon = () => {
      clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), REFRESH_DELAY_MS);
    };

    const channel = supabase
      .channel(topic)
      .on("broadcast", { event: "chat" }, refreshSoon)
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") return;
        // Kết nối lại sau khi rớt mạng / máy ngủ → tải lại để không sót tin.
        if (subscribedBefore) refreshSoon();
        subscribedBefore = true;
      });

    return () => {
      clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [topic, router]);

  return null;
}
