import "server-only";

import { prisma } from "@/lib/prisma";
import type { SportWithPlayers } from "@/lib/types";

const sportSelect = {
  id: true,
  slug: true,
  name: true,
  icon: true,
  minPlayers: true,
  maxPlayers: true,
  defaultPlayers: true,
} as const;

export async function getSports(): Promise<SportWithPlayers[]> {
  return prisma.sport.findMany({
    where: { isActive: true },
    select: sportSelect,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getSportById(
  id: string,
): Promise<SportWithPlayers | null> {
  return prisma.sport.findUnique({ where: { id }, select: sportSelect });
}

export async function getSportBySlug(
  slug: string,
): Promise<SportWithPlayers | null> {
  return prisma.sport.findUnique({ where: { slug }, select: sportSelect });
}
