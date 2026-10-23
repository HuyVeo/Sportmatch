"use server";

import { refresh } from "next/cache";
import {
  MatchActionError,
  cancelJoinRequest,
  leaveMatch,
  requestToJoin,
  respondToInvite,
  reviewJoinRequest,
} from "@/lib/data/matches";

export type MatchActionState = { error: string | null };

async function run(task: () => Promise<void>): Promise<MatchActionState> {
  try {
    await task();
  } catch (error) {
    if (error instanceof MatchActionError) return { error: error.message };
    throw error;
  }
  refresh();
  return { error: null };
}

export async function requestToJoinAction(matchId: string) {
  return run(() => requestToJoin(matchId));
}

export async function respondToInviteAction(matchId: string, accept: boolean) {
  return run(() => respondToInvite(matchId, accept));
}

export async function cancelJoinRequestAction(matchId: string) {
  return run(() => cancelJoinRequest(matchId));
}

export async function leaveMatchAction(matchId: string) {
  return run(() => leaveMatch(matchId));
}

export async function reviewJoinRequestAction(
  matchId: string,
  requesterId: string,
  approve: boolean,
) {
  return run(() => reviewJoinRequest(matchId, requesterId, approve));
}
