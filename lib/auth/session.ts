import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Lớp truy cập dữ liệu (DAL): mọi server component / server action lấy user
 * hiện tại qua đây, không tin vào proxy.ts (proxy chỉ kiểm tra lạc quan).
 */
export const getSessionUserId = cache(async (): Promise<string | null> => {
  const session = await auth();
  return session?.user?.id ?? null;
});

/** Dùng trong route bắt buộc đăng nhập — tự redirect nếu chưa có session. */
export async function requireUserId(): Promise<string> {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");
  return userId;
}
