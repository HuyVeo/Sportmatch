import { auth } from "@/auth";
import { CLUB_SPORTS } from "@/lib/clubs/mock-data";
import { createClubConversation } from "@/lib/data/chat";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  const ownerId = session?.user?.id;
  if (!ownerId) return Response.json({ error: "Cần đăng nhập để tạo CLB." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const area = typeof body.area === "string" ? body.area.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const sportType = typeof body.sportType === "string" ? body.sportType : "";
  const capacity = Number(body.capacity);
  const fee = Number(body.fee);
  const schedule = Array.isArray(body.schedule)
    ? body.schedule.filter((day): day is string => typeof day === "string" && ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].includes(day))
    : [];

  if (!name || name.length > 80 || !area || !description || description.length > 500 || !CLUB_SPORTS.includes(sportType as (typeof CLUB_SPORTS)[number])) {
    return Response.json({ error: "Vui lòng kiểm tra tên, môn thể thao, khu vực và giới thiệu CLB." }, { status: 400 });
  }
  if (!Number.isInteger(capacity) || capacity < 2 || capacity > 200 || !Number.isInteger(fee) || fee < 0) {
    return Response.json({ error: "Sức chứa hoặc mức phí không hợp lệ." }, { status: 400 });
  }

  const icons: Record<string, string> = {
    "Bóng đá": "⚽", "Bóng rổ": "🏀", "Cầu lông": "🏸", "Bóng bàn": "🏓",
    Tennis: "🎾", Pickleball: "🏓", "Võ thuật": "🥋",
  };
  const club = await prisma.$transaction(async (tx) => {
    const created = await tx.club.create({
      data: {
        ownerId,
        name,
        area,
        description,
        sportType,
        logo: icons[sportType],
        capacity,
        fee,
        schedule: schedule.length ? schedule : ["T7"],
        level: "Người mới",
        memberCount: 1,
      },
      select: { id: true },
    });
    // Mỗi CLB có 1 nhóm chat nội bộ; thành viên được thêm khi chủ CLB duyệt.
    await createClubConversation(tx, created.id, ownerId);
    return created;
  });

  return Response.json({ id: club.id }, { status: 201 });
}
