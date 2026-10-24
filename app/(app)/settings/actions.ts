"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUserId } from "@/lib/auth/session";
import { searchCourts } from "@/lib/data/courts";
import { prisma } from "@/lib/prisma";
import {
  ProfileInputError,
  updateCurrentUser,
  type UserProfileInput,
} from "@/lib/data/users";
import { PLAY_PURPOSES, SKILL_LEVELS, WEEKDAYS } from "@/lib/types";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập họ tên.").max(80),
  avatar: z.string().max(16),
  area: z.string().trim().max(120),
  coords: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .nullable()
    .optional(),
  gender: z.enum(["Nam", "Nữ", "Khác"]),
  birthday: z.string().max(10),
  bio: z.string().trim().max(500),
  sports: z
    .array(
      z.object({
        sportId: z.string().min(1),
        skillLevel: z.enum(SKILL_LEVELS),
        purposes: z.array(z.enum(PLAY_PURPOSES)).max(PLAY_PURPOSES.length),
        preferredAreas: z.array(z.string()).max(20),
        favoriteCourtIds: z.array(z.string()).max(20),
      }),
    )
    .max(10),
  availability: z
    .array(
      z.object({
        day: z.enum(WEEKDAYS),
        startMinute: z.number().int(),
        endMinute: z.number().int(),
      }),
    )
    .max(100),
});

/**
 * Luôn ghi vào user của phiên đăng nhập (`updateCurrentUser` tự lấy userId từ
 * session) — không có đường nào sửa hồ sơ của người khác.
 */
export async function saveProfileAction(
  input: UserProfileInput,
): Promise<{ error: string | null }> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };
  }

  try {
    await updateCurrentUser(parsed.data);
    // Tên và avatar hiện ở header của mọi trang → làm mới cả layout.
    revalidatePath("/", "layout");
    return { error: null };
  } catch (error) {
    if (error instanceof ProfileInputError) return { error: error.message };
    console.error("saveProfileAction thất bại:", error);
    return { error: "Chưa lưu được thay đổi, vui lòng thử lại." };
  }
}

export async function searchCourtsAction(sportId: string, query: string) {
  await requireUserId();
  return searchCourts(String(sportId), String(query));
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại."),
  newPassword: z.string().min(6, "Mật khẩu mới phải có tối thiểu 6 ký tự."),
  confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới."),
});

export async function changePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ ok: boolean; error?: string }> {
  const userId = await requireUserId();
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };
  }

  const { currentPassword, newPassword, confirmPassword } = parsed.data;

  if (newPassword !== confirmPassword) {
    return { ok: false, error: "Mật khẩu xác nhận không khớp với mật khẩu mới." };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user?.passwordHash) {
    return { ok: false, error: "Tài khoản chưa thiết lập mật khẩu." };
  }

  const bcrypt = await import("bcryptjs");
  const isValid = await bcrypt.default.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    return { ok: false, error: "Mật khẩu hiện tại không chính xác." };
  }

  const newHash = await bcrypt.default.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  return { ok: true };
}
