import { after } from "next/server";
import { auth } from "@/auth";
import { addClubConversationMember, removeClubConversationMember } from "@/lib/data/chat";
import { prisma } from "@/lib/prisma";
import { notifyUsers } from "@/lib/realtime/broadcast";

type Context = { params: Promise<{ clubId: string }> };

export async function GET(_request: Request, { params }: Context) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "Cần đăng nhập." }, { status: 401 });

  const { clubId } = await params;
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { ownerId: true },
  });
  if (!club) return Response.json({ error: "Không tìm thấy CLB." }, { status: 404 });
  if (!club.ownerId) return Response.json({ error: "CLB này chưa có chủ sở hữu để nhận yêu cầu." }, { status: 409 });

  const isOwner = club.ownerId === userId;
  const [membership, pendingRequests] = await Promise.all([
    prisma.clubMembership.findUnique({
      where: { clubId_userId: { clubId, userId } },
      select: { status: true },
    }),
    isOwner
      ? prisma.clubMembership.findMany({
          where: { clubId, status: "PENDING" },
          select: { userId: true, user: { select: { name: true, avatar: true, image: true, area: true } } },
          orderBy: { requestedAt: "asc" },
        })
      : Promise.resolve([]),
  ]);

  return Response.json({
    isOwner,
    membershipStatus: isOwner ? "APPROVED" : membership?.status ?? null,
    pendingRequests: pendingRequests.map((request) => ({
      userId: request.userId,
      name: request.user.name,
      avatar: request.user.avatar,
      avatarUrl: request.user.image,
      area: request.user.area,
    })),
  });
}

export async function POST(_request: Request, { params }: Context) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "Cần đăng nhập để yêu cầu tham gia." }, { status: 401 });

  const { clubId } = await params;
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { ownerId: true, capacity: true },
  });
  if (!club) return Response.json({ error: "Không tìm thấy CLB." }, { status: 404 });
  if (club.ownerId === userId) return Response.json({ error: "Bạn là chủ CLB." }, { status: 409 });

  const existing = await prisma.clubMembership.findUnique({
    where: { clubId_userId: { clubId, userId } },
    select: { status: true },
  });
  if (existing?.status === "APPROVED") {
    return Response.json({ membershipStatus: "APPROVED" });
  }

  const approvedCount = await prisma.clubMembership.count({ where: { clubId, status: "APPROVED" } });
  if (approvedCount + 1 >= club.capacity) {
    return Response.json({ error: "CLB đã đủ thành viên." }, { status: 409 });
  }

  await prisma.clubMembership.upsert({
    where: { clubId_userId: { clubId, userId } },
    create: { clubId, userId, status: "PENDING" },
    update: { status: "PENDING", requestedAt: new Date(), reviewedAt: null },
  });

  return Response.json({ membershipStatus: "PENDING" }, { status: 201 });
}

export async function PATCH(request: Request, { params }: Context) {
  const session = await auth();
  const ownerId = session?.user?.id;
  if (!ownerId) return Response.json({ error: "Cần đăng nhập." }, { status: 401 });

  const { clubId } = await params;
  let body: { userId?: unknown; decision?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }
  if (typeof body.userId !== "string" || !["approve", "reject"].includes(String(body.decision))) {
    return Response.json({ error: "Yêu cầu duyệt không hợp lệ." }, { status: 400 });
  }

  const club = await prisma.club.findUnique({ where: { id: clubId }, select: { ownerId: true, capacity: true } });
  if (!club) return Response.json({ error: "Không tìm thấy CLB." }, { status: 404 });
  if (club.ownerId !== ownerId) return Response.json({ error: "Chỉ chủ CLB mới được duyệt thành viên." }, { status: 403 });

  const result = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "Club" WHERE "id" = ${clubId} FOR UPDATE`;
    const membership = await tx.clubMembership.findUnique({
      where: { clubId_userId: { clubId, userId: body.userId as string } },
      select: { status: true },
    });
    if (!membership || membership.status !== "PENDING") return { error: "Yêu cầu này không còn chờ duyệt." };

    if (body.decision === "approve") {
      const approvedCount = await tx.clubMembership.count({ where: { clubId, status: "APPROVED" } });
      if (approvedCount + 1 >= club.capacity) return { error: "CLB đã đủ thành viên." };
    }

    await tx.clubMembership.update({
      where: { clubId_userId: { clubId, userId: body.userId as string } },
      data: {
        status: body.decision === "approve" ? "APPROVED" : "REJECTED",
        reviewedAt: new Date(),
      },
    });
    // Được duyệt → vào nhóm chat CLB; bị từ chối → không ở trong nhóm.
    if (body.decision === "approve") {
      await addClubConversationMember(tx, clubId, body.userId as string);
    } else {
      await removeClubConversationMember(tx, clubId, body.userId as string);
    }
    const approvedCount = await tx.clubMembership.count({ where: { clubId, status: "APPROVED" } });
    await tx.club.update({ where: { id: clubId }, data: { memberCount: approvedCount + 1 } });
    return { membershipStatus: body.decision === "approve" ? "APPROVED" : "REJECTED" };
  });

  if ("error" in result) return Response.json({ error: result.error }, { status: 409 });
  // Người được duyệt thấy nhóm chat CLB xuất hiện ngay trong Tin nhắn.
  after(() => notifyUsers([body.userId as string], "chat"));
  return Response.json(result);
}
