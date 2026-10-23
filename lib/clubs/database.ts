import "server-only";
import type { Club } from "@/lib/clubs/mock-data";
import { prisma } from "@/lib/prisma";

export async function getDatabaseClubs(): Promise<Club[]> {
  const rows = await prisma.club.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    sportType: row.sportType as Club["sportType"],
    area: row.area,
    logo: row.logo,
    rating: row.rating,
    memberCount: row.memberCount,
    capacity: row.capacity,
    recruitmentCount: Math.max(0, row.capacity - row.memberCount),
    positions: [],
    level: row.level as Club["level"],
    schedule: row.schedule,
    time: row.time,
    fee: row.fee,
    activityCount: 0,
    activityRate: 0,
    responseRate: 0,
    foundedMonths: Math.max(0, Math.floor((Date.now() - row.createdAt.getTime()) / (30 * 24 * 60 * 60 * 1000))),
    description: row.description,
    status: "Đang hoạt động",
    nextActivity: { title: "Chưa có hoạt động", kind: "Tập luyện", date: "Chưa lên lịch", time: row.time, venue: row.area, joined: 0, capacity: row.capacity },
    members: [],
    achievements: { events: 0, wins: 0, draws: 0, losses: 0 },
  }));
}
