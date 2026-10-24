import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Thiếu DIRECT_URL/DATABASE_URL.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const sampleClubs = [
  {
    name: "Cầu Lông Sunrise Cầu Giấy",
    sportType: "Cầu lông",
    area: "Cầu Giấy, Hà Nội",
    logo: "🏸",
    rating: 4.9,
    capacity: 24,
    fee: 60000,
    schedule: ["T3", "T5", "T7"],
    time: "19:00–21:00",
    level: "Cơ bản",
    description: "Nhóm cầu lông thân thiện, duy trì lịch tập đều đặn và luôn dành sân cho thành viên mới giao lưu.",
  },
  {
    name: "Pickleball Tây Hồ Club",
    sportType: "Pickleball",
    area: "Tây Hồ, Hà Nội",
    logo: "🏓",
    rating: 4.8,
    capacity: 20,
    fee: 70000,
    schedule: ["T3", "T6", "CN"],
    time: "17:30–19:30",
    level: "Người mới",
    description: "Cộng đồng Pickleball ven Hồ Tây, có người hướng dẫn cho người mới bắt đầu và tổ chức mini-game hàng tuần.",
  },
  {
    name: "Hà Nội Football Strikers",
    sportType: "Bóng đá",
    area: "Nam Từ Liêm, Hà Nội",
    logo: "⚽",
    rating: 4.7,
    capacity: 22,
    fee: 75000,
    schedule: ["T4", "T6", "CN"],
    time: "19:00–21:00",
    level: "Trung bình",
    description: "Đội bóng phong trào 7 người, sinh hoạt cố định hàng tuần, đề cao tinh thần thể thao vui khỏe và đúng giờ.",
  },
  {
    name: "Tennis Ba Đình Champions",
    sportType: "Tennis",
    area: "Ba Đình, Hà Nội",
    logo: "🎾",
    rating: 4.9,
    capacity: 16,
    fee: 120000,
    schedule: ["T2", "T4", "T6"],
    time: "06:00–08:00",
    level: "Nâng cao",
    description: "Nhóm tennis buổi sáng sớm, rèn luyện kỹ thuật đánh đơn và đánh đôi, thường xuyên giao hữu liên CLB.",
  },
  {
    name: "Bóng Rổ Trẻ Cầu Giấy",
    sportType: "Bóng rổ",
    area: "Cầu Giấy, Hà Nội",
    logo: "🏀",
    rating: 4.8,
    capacity: 25,
    fee: 50000,
    schedule: ["T3", "T5", "CN"],
    time: "18:00–20:00",
    level: "Trung bình",
    description: "CLB bóng rổ cộng đồng, tổ chức tập chiến thuật và scrimmage mỗi cuối tuần.",
  },
  {
    name: "Pickleball Hoàn Kiếm Arena",
    sportType: "Pickleball",
    area: "Hoàn Kiếm, Hà Nội",
    logo: "🏓",
    rating: 4.6,
    capacity: 18,
    fee: 80000,
    schedule: ["T2", "T5", "T7"],
    time: "18:30–20:30",
    level: "Cơ bản",
    description: "Sân chơi trung tâm phố cổ, giao lưu kết nối người yêu thích môn thể thao pickleball năng động.",
  },
];

async function seedClubs() {
  console.log("Bắt đầu nạp dữ liệu CLB vào database...");

  const users = await prisma.user.findMany({ take: 10, select: { id: true, name: true } });
  if (users.length === 0) {
    console.log("Chưa có user nào, vui lòng seed users trước!");
    return;
  }

  const owner = users[0]; // Mạnh Phan (user đầu tiên)
  const otherUsers = users.slice(1);

  for (let i = 0; i < sampleClubs.length; i++) {
    const data = sampleClubs[i];
    const clubOwner = i % 2 === 0 ? owner : users[i % users.length];

    // Tạo CLB
    const club = await prisma.club.create({
      data: {
        name: data.name,
        sportType: data.sportType,
        area: data.area,
        logo: data.logo,
        rating: data.rating,
        capacity: data.capacity,
        fee: data.fee,
        schedule: data.schedule,
        time: data.time,
        level: data.level,
        description: data.description,
        ownerId: clubOwner.id,
        memberCount: 1, // Chủ CLB
      },
    });

    // Tạo nhóm Chat nội bộ cho CLB
    const conversation = await prisma.chatConversation.create({
      data: {
        type: "CLUB",
        clubId: club.id,
        members: {
          create: [{ userId: clubOwner.id }],
        },
      },
    });

    // Tin nhắn chào mừng đầu tiên từ chủ CLB
    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: clubOwner.id,
        body: `Chào mừng mọi người gia nhập ${club.name}! Lịch sinh hoạt cố định: ${club.schedule.join(", ")} (${club.time}).`,
      },
    });

    // Thêm 2 thành viên đã được duyệt (APPROVED) và 1 thành viên chờ duyệt (PENDING)
    if (otherUsers.length >= 2) {
      const approved1 = otherUsers[(i * 2) % otherUsers.length];
      const approved2 = otherUsers[(i * 2 + 1) % otherUsers.length];
      const pendingUser = otherUsers[(i * 2 + 2) % otherUsers.length];

      // Thêm thành viên duyệt 1
      if (approved1.id !== clubOwner.id) {
        await prisma.clubMembership.upsert({
          where: { clubId_userId: { clubId: club.id, userId: approved1.id } },
          create: { clubId: club.id, userId: approved1.id, status: "APPROVED" },
          update: { status: "APPROVED" },
        });
        await prisma.conversationMember.upsert({
          where: { conversationId_userId: { conversationId: conversation.id, userId: approved1.id } },
          create: { conversationId: conversation.id, userId: approved1.id },
          update: {},
        });
      }

      // Thêm thành viên duyệt 2
      if (approved2.id !== clubOwner.id && approved2.id !== approved1.id) {
        await prisma.clubMembership.upsert({
          where: { clubId_userId: { clubId: club.id, userId: approved2.id } },
          create: { clubId: club.id, userId: approved2.id, status: "APPROVED" },
          update: { status: "APPROVED" },
        });
        await prisma.conversationMember.upsert({
          where: { conversationId_userId: { conversationId: conversation.id, userId: approved2.id } },
          create: { conversationId: conversation.id, userId: approved2.id },
          update: {},
        });
      }

      // Thêm yêu cầu chờ duyệt (PENDING) để chủ CLB có thể duyệt
      if (pendingUser && pendingUser.id !== clubOwner.id) {
        await prisma.clubMembership.upsert({
          where: { clubId_userId: { clubId: club.id, userId: pendingUser.id } },
          create: { clubId: club.id, userId: pendingUser.id, status: "PENDING" },
          update: { status: "PENDING" },
        });
      }

      // Cập nhật memberCount
      const totalApproved = await prisma.clubMembership.count({
        where: { clubId: club.id, status: "APPROVED" },
      });
      await prisma.club.update({
        where: { id: club.id },
        data: { memberCount: totalApproved + 1 },
      });
    }

    console.log(`✓ Đã tạo CLB: ${club.name} (Chủ: ${clubOwner.name})`);
  }

  console.log("Hoàn tất nạp dữ liệu CLB!");
}

seedClubs()
  .catch((err) => {
    console.error("Lỗi seed clubs:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
