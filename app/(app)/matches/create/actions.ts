"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUserId } from "@/lib/auth/session";
import {
  MatchActionError,
  createMatch,
  getBusyCourtIds,
  type NewMatchInput,
} from "@/lib/data/matches";

export async function createMatchAction(
  input: NewMatchInput,
): Promise<{ error: string }> {
  try {
    await createMatch(input);
  } catch (error) {
    if (error instanceof MatchActionError) return { error: error.message };
    throw error;
  }
  revalidatePath("/matches");
  redirect("/matches");
}

/** Id các sân đã có trận khác cùng môn trùng giờ `dateTime` (±2 giờ). */
export async function getBusyCourtIdsAction(
  sportId: string,
  dateTime: string,
): Promise<string[]> {
  await requireUserId();
  const date = new Date(dateTime);
  if (!sportId || Number.isNaN(date.getTime())) return [];
  return getBusyCourtIds(sportId, date);
}
