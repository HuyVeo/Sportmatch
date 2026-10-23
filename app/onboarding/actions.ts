"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUserId } from "@/lib/auth/session";
import { completeOnboarding } from "@/lib/data/users";
import { reverseGeocode } from "@/lib/osm/geocode";
import { SKILL_LEVELS, WEEKDAYS, type SkillLevel, type Weekday } from "@/lib/types";

const coordsSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const onboardingSchema = z.object({
  sportIds: z.array(z.string().min(1)).max(20),
  skillLevel: z.enum(SKILL_LEVELS),
  area: z.string().trim().min(1).max(120),
  coords: coordsSchema.nullable(),
  avatar: z.string().max(16),
  availability: z.array(z.enum(WEEKDAYS)).max(7),
});

export async function completeOnboardingAction(input: {
  sportIds: string[];
  skillLevel: SkillLevel;
  area: string;
  coords: { lat: number; lng: number } | null;
  avatar: string;
  availability: Weekday[];
}): Promise<{ error: string }> {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) return { error: "Thông tin chưa hợp lệ, vui lòng kiểm tra lại." };

  try {
    await completeOnboarding({
      avatar: parsed.data.avatar,
      area: parsed.data.area,
      coords: parsed.data.coords,
      sports: parsed.data.sportIds.map((sportId) => ({
        sportId,
        skillLevel: parsed.data.skillLevel,
      })),
      availability: parsed.data.availability,
    });
  } catch (error) {
    console.error("completeOnboarding thất bại:", error);
    return { error: "Chưa lưu được hồ sơ, vui lòng thử lại." };
  }

  // redirect() ném lỗi điều hướng nên phải nằm ngoài try/catch.
  redirect("/discover");
}

/** Đổi toạ độ GPS của trình duyệt thành tên khu vực ("Tây Hồ, Hà Nội"). */
export async function locateAreaAction(
  lat: number,
  lng: number,
): Promise<{ area: string | null }> {
  await requireUserId();
  const coords = coordsSchema.safeParse({ lat, lng });
  if (!coords.success) return { area: null };
  return { area: await reverseGeocode(coords.data) };
}
