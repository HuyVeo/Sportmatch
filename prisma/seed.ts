import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { extraPlayers } from "./extra-players";
import { createSeedUser, type SeedUser } from "./seed-users";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Thiếu DIRECT_URL/DATABASE_URL — xem .env.example.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

/** PRNG có hạt giống cố định để mỗi lần seed ra cùng một bộ dữ liệu. */
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const random = createRandom(20260920);

function pick<T>(items: T[]): T {
  return items[Math.floor(random() * items.length)];
}

const SEED_PASSWORD = "SportMatch123";

const sports = [
  { id: "badminton", slug: "cau-long", name: "Cầu lông", icon: "🏸", sortOrder: 1 },
  { id: "pickleball", slug: "pickleball", name: "Pickleball", icon: "🏓", sortOrder: 2 },
  // Giữ khớp với migration 20260929000000_more_sports.
  { id: "football", slug: "bong-da", name: "Bóng đá", icon: "⚽", sortOrder: 3, minPlayers: 10, maxPlayers: 22, defaultPlayers: 14 },
  { id: "futsal", slug: "futsal", name: "Futsal", icon: "🥅", sortOrder: 4, minPlayers: 8, maxPlayers: 14, defaultPlayers: 10 },
  { id: "tennis", slug: "tennis", name: "Tennis", icon: "🎾", sortOrder: 5, minPlayers: 2, maxPlayers: 4, defaultPlayers: 4 },
  { id: "table_tennis", slug: "bong-ban", name: "Bóng bàn", icon: "⚪", sortOrder: 6, minPlayers: 2, maxPlayers: 4, defaultPlayers: 2 },
  { id: "volleyball", slug: "bong-chuyen", name: "Bóng chuyền", icon: "🏐", sortOrder: 7, minPlayers: 8, maxPlayers: 14, defaultPlayers: 12 },
  { id: "basketball", slug: "bong-ro", name: "Bóng rổ", icon: "🏀", sortOrder: 8, minPlayers: 4, maxPlayers: 12, defaultPlayers: 10 },
  { id: "handball", slug: "bong-nem", name: "Bóng ném", icon: "🤾", sortOrder: 9, minPlayers: 10, maxPlayers: 16, defaultPlayers: 14 },
  { id: "golf", slug: "golf", name: "Golf", icon: "⛳", sortOrder: 10, minPlayers: 2, maxPlayers: 4, defaultPlayers: 4 },
  { id: "billiards", slug: "bi-a", name: "Bi-a", icon: "🎱", sortOrder: 11, minPlayers: 2, maxPlayers: 4, defaultPlayers: 2 },
  { id: "bowling", slug: "bowling", name: "Bowling", icon: "🎳", sortOrder: 12, minPlayers: 2, maxPlayers: 6, defaultPlayers: 4 },
  { id: "swimming", slug: "boi-loi", name: "Bơi lội", icon: "🏊", sortOrder: 13, minPlayers: 2, maxPlayers: 10, defaultPlayers: 4 },
  { id: "boxing", slug: "boxing", name: "Boxing", icon: "🥊", sortOrder: 14, minPlayers: 2, maxPlayers: 8, defaultPlayers: 2 },
];

const courts = [
  {
    id: "c1",
    name: "CLB Cau long Dong Da",
    area: "Dong Da, Ha Noi",
    address: "Dong Da, Ha Noi",
    sportIds: ["badminton"],
    pricePerHour: 80_000,
    phone: "0901234567",
    lat: 21.0122,
    lng: 105.8292,
  },
  {
    id: "c2",
    name: "San Pickleball Tay Ho",
    area: "Tay Ho, Ha Noi",
    address: "Tay Ho, Ha Noi",
    sportIds: ["pickleball"],
    pricePerHour: 80_000,
    phone: "0902345678",
    lat: 21.0685,
    lng: 105.8207,
  },
  {
    id: "c3",
    name: "Trung tam Cau long Cau Giay",
    area: "Cau Giay, Ha Noi",
    address: "Cau Giay, Ha Noi",
    sportIds: ["badminton"],
    pricePerHour: 50_000,
    phone: "0903456789",
    lat: 21.0313,
    lng: 105.7905,
  },
  {
    id: "c4",
    name: "Pickleball Arena Hoang Mai",
    area: "Hoang Mai, Ha Noi",
    address: "Hoang Mai, Ha Noi",
    sportIds: ["pickleball"],
    pricePerHour: 70_000,
    phone: "0904567890",
    lat: 20.9758,
    lng: 105.8542,
  },
  {
    id: "c5",
    name: "San the thao Ha Dong",
    area: "Ha Dong, Ha Noi",
    address: "Ha Dong, Ha Noi",
    sportIds: ["badminton", "pickleball"],
    pricePerHour: 100_000,
    phone: "0905678901",
    lat: 20.9713,
    lng: 105.7788,
  },
];

const users: SeedUser[] = [
  {
    id: "169",
    name: "Manh Phan Trong",
    email: "manh.phan@sportmatch.vn",
    avatar: "🧑‍🦱",
    bio: "",
    area: "Tây Hồ, Hà Nội",
    lat: 21.0685,
    lng: 105.8207,
    gender: "MALE",
    birthday: "1998-04-12",
    trustScore: 80,
    isOnline: true,
    isPro: true,
    communityVotes: 0,
    sports: [{ sportId: "pickleball", skillLevel: "BEGINNER" }],
    availability: ["WED"],
    targetStars: 0,
    targetMatches: 0,
  },
  {
    id: "1",
    name: "Nguyễn Thu Hà",
    email: "thuha@example.com",
    avatar: "👩",
    bio: "Chơi cầu lông 5 năm, thích đánh đôi vào buổi tối.",
    area: "Ba Đình, Hà Nội",
    lat: 21.0353,
    lng: 105.8145,
    gender: "FEMALE",
    birthday: "1996-02-20",
    trustScore: 96,
    isOnline: true,
    isPro: true,
    communityVotes: 42,
    sports: [{ sportId: "badminton", skillLevel: "ADVANCED" }],
    availability: ["MON", "WED", "FRI"],
    targetStars: 4.9,
    targetMatches: 18,
  },
  {
    id: "2",
    name: "Trần Đức Huy",
    email: "duchuy@example.com",
    avatar: "🧔",
    bio: "Mới chuyển sang pickleball, tìm bạn đánh cuối tuần.",
    area: "Thanh Xuân, Hà Nội",
    lat: 20.9955,
    lng: 105.8065,
    gender: "MALE",
    birthday: "1994-07-08",
    trustScore: 91,
    isOnline: true,
    isPro: false,
    communityVotes: 25,
    sports: [{ sportId: "pickleball", skillLevel: "INTERMEDIATE" }],
    availability: ["SAT", "SUN"],
    targetStars: 4.6,
    targetMatches: 12,
  },
  {
    id: "3",
    name: "Phạm Lan Chi",
    email: "lanchi@example.com",
    avatar: "👧",
    bio: "Vừa bắt đầu chơi cầu lông, mong được chỉ thêm.",
    area: "Hai Bà Trưng, Hà Nội",
    lat: 21.0074,
    lng: 105.8545,
    gender: "FEMALE",
    birthday: "2001-11-30",
    trustScore: 78,
    isOnline: false,
    isPro: false,
    communityVotes: 8,
    sports: [{ sportId: "badminton", skillLevel: "BEGINNER" }],
    availability: ["TUE", "THU"],
    targetStars: 4.3,
    targetMatches: 5,
  },
  {
    id: "4",
    name: "Lê Tuấn Kiệt",
    email: "tuankiet@example.com",
    avatar: "🧑",
    bio: "Đánh pickleball 3 buổi mỗi tuần, ưu tiên sân Mỹ Đình.",
    area: "Nam Từ Liêm, Hà Nội",
    lat: 21.0207,
    lng: 105.7639,
    gender: "MALE",
    birthday: "1992-05-14",
    trustScore: 99,
    isOnline: true,
    isPro: true,
    communityVotes: 58,
    sports: [
      { sportId: "pickleball", skillLevel: "ADVANCED" },
      { sportId: "badminton", skillLevel: "INTERMEDIATE" },
    ],
    availability: ["MON", "TUE", "THU", "SAT"],
    targetStars: 5,
    targetMatches: 22,
  },
  {
    id: "5",
    name: "Đỗ Minh Anh",
    email: "minhanh@example.com",
    avatar: "👩‍🦰",
    bio: "Cầu lông trình độ trung cấp, hay chơi ở Cầu Giấy.",
    area: "Cầu Giấy, Hà Nội",
    lat: 21.0313,
    lng: 105.7905,
    gender: "FEMALE",
    birthday: "1999-09-09",
    trustScore: 88,
    isOnline: true,
    isPro: false,
    communityVotes: 19,
    sports: [{ sportId: "badminton", skillLevel: "INTERMEDIATE" }],
    availability: ["WED", "FRI", "SUN"],
    targetStars: 4.8,
    targetMatches: 10,
  },
  {
    id: "6",
    name: "Vũ Quốc Bảo",
    email: "quocbao@example.com",
    avatar: "👨",
    bio: "Tìm nhóm pickleball cố định buổi tối trong tuần.",
    area: "Đống Đa, Hà Nội",
    lat: 21.0122,
    lng: 105.8292,
    gender: "MALE",
    birthday: "1997-12-01",
    trustScore: 84,
    isOnline: false,
    isPro: false,
    communityVotes: 11,
    sports: [{ sportId: "pickleball", skillLevel: "BEGINNER" }],
    availability: ["MON", "THU"],
    targetStars: 4.5,
    targetMatches: 6,
  },
  {
    id: "7",
    name: "Hoàng Gia Bảo",
    email: "giabao@example.com",
    avatar: "🧑‍🦳",
    bio: "Cầu lông phong trào, thích giao lưu nhóm mới.",
    area: "Long Biên, Hà Nội",
    lat: 21.0453,
    lng: 105.8894,
    gender: "MALE",
    birthday: "1990-03-25",
    trustScore: 93,
    isOnline: true,
    isPro: false,
    communityVotes: 33,
    sports: [{ sportId: "badminton", skillLevel: "ADVANCED" }],
    availability: ["TUE", "FRI", "SAT"],
    targetStars: 4.7,
    targetMatches: 16,
  },
  {
    id: "8",
    name: "Bùi Khánh Linh",
    email: "khanhlinh@example.com",
    avatar: "👩‍🦱",
    bio: "Chơi cả cầu lông và pickleball, rảnh cuối tuần.",
    area: "Hoàng Mai, Hà Nội",
    lat: 20.9758,
    lng: 105.8542,
    gender: "FEMALE",
    birthday: "1995-06-18",
    trustScore: 90,
    isOnline: false,
    isPro: true,
    communityVotes: 21,
    sports: [
      { sportId: "badminton", skillLevel: "INTERMEDIATE" },
      { sportId: "pickleball", skillLevel: "INTERMEDIATE" },
    ],
    availability: ["SAT", "SUN"],
    targetStars: 4.6,
    targetMatches: 11,
  },
  {
    id: "9",
    name: "Ngô Hải Đăng",
    email: "haidang@example.com",
    avatar: "🧒",
    bio: "Sinh viên, tìm bạn chơi cầu lông giá rẻ gần trường.",
    area: "Bắc Từ Liêm, Hà Nội",
    lat: 21.0685,
    lng: 105.7739,
    gender: "MALE",
    birthday: "2003-08-22",
    trustScore: 72,
    isOnline: true,
    isPro: false,
    communityVotes: 4,
    sports: [{ sportId: "badminton", skillLevel: "BEGINNER" }],
    availability: ["MON", "WED", "FRI"],
    targetStars: 4.1,
    targetMatches: 3,
  },
  {
    id: "10",
    name: "Đặng Phương Thảo",
    email: "phuongthao@example.com",
    avatar: "👩‍🦳",
    bio: "Pickleball trung cấp, ưu tiên sân có mái che.",
    area: "Tây Hồ, Hà Nội",
    lat: 21.0721,
    lng: 105.8188,
    gender: "FEMALE",
    birthday: "1993-10-11",
    trustScore: 95,
    isOnline: true,
    isPro: true,
    communityVotes: 37,
    sports: [{ sportId: "pickleball", skillLevel: "INTERMEDIATE" }],
    availability: ["TUE", "THU", "SUN"],
    targetStars: 4.9,
    targetMatches: 14,
  },
  {
    id: "11",
    name: "Trịnh Văn Nam",
    email: "vannam@example.com",
    avatar: "👴",
    bio: "Đánh cầu lông buổi sáng sớm, nhóm cố định 4 người.",
    area: "Hà Đông, Hà Nội",
    lat: 20.9713,
    lng: 105.7788,
    gender: "MALE",
    birthday: "1985-01-07",
    trustScore: 87,
    isOnline: false,
    isPro: false,
    communityVotes: 15,
    sports: [{ sportId: "badminton", skillLevel: "INTERMEDIATE" }],
    availability: ["MON", "TUE", "WED", "THU", "FRI"],
    targetStars: 4.4,
    targetMatches: 8,
  },
];

/** Sao quanh mức mục tiêu, kẹp trong [1, 5]. */
function starsAround(target: number): number {
  const offset = random() < 0.65 ? 0 : random() < 0.5 ? -1 : 1;
  return Math.max(1, Math.min(5, Math.round(target) + offset));
}

async function main() {
  console.log("Xoá dữ liệu cũ...");
  await prisma.chatMessage.deleteMany();
  await prisma.conversationMember.deleteMany();
  await prisma.chatConversation.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.matchParticipant.deleteMany();
  await prisma.match.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.courtSport.deleteMany();
  await prisma.court.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.userSport.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.sport.deleteMany();

  console.log("Tạo môn thể thao...");
  await prisma.sport.createMany({ data: sports });

  console.log("Tạo sân bãi...");
  for (const court of courts) {
    const { sportIds, ...rest } = court;
    await prisma.court.create({
      data: {
        ...rest,
        isOpen: true,
        sports: { create: sportIds.map((sportId) => ({ sportId })) },
      },
    });
  }

  console.log("Tạo người dùng...");
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);
  for (const user of users) {
    await createSeedUser(prisma, user, passwordHash);
  }
  // Người chơi các môn mới: chỉ có hồ sơ, không tham gia trận mẫu bên dưới.
  for (const user of extraPlayers) {
    await createSeedUser(prisma, user, passwordHash);
  }

  console.log("Tạo trận đã hoàn tất + đánh giá...");
  // Mỗi user cần `targetMatches` trận đã hoàn tất; ghép 4 người một trận cho tới
  // khi tất cả đủ chỉ tiêu, rồi sinh Rating giữa các đồng đội trong trận đó.
  const remaining = new Map(users.map((user) => [user.id, user.targetMatches]));
  const starTarget = new Map(users.map((user) => [user.id, user.targetStars]));
  const sportsWithCourts = sports.filter((sport) =>
    courts.some((court) => court.sportIds.includes(sport.id)),
  );
  let completedCount = 0;
  let ratingCount = 0;
  let daysAgo = 3;

  while ([...remaining.values()].filter((value) => value > 0).length >= 4) {
    const candidates = [...remaining.entries()]
      .filter(([, value]) => value > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id]) => id);

    const lineup: string[] = [];
    while (lineup.length < 4 && candidates.length > 0) {
      const index = Math.floor(random() * candidates.length);
      lineup.push(candidates.splice(index, 1)[0]);
    }

    // Chỉ các môn có sân mẫu (Cầu lông, Pickleball) — môn mới chưa có sân seed.
    const sport = pick(sportsWithCourts);
    const court = pick(courts.filter((item) => item.sportIds.includes(sport.id)));
    const playedAt = new Date();
    playedAt.setDate(playedAt.getDate() - daysAgo);
    playedAt.setHours(19, 30, 0, 0);
    daysAgo += 2;

    const match = await prisma.match.create({
      data: {
        sportId: sport.id,
        hostId: lineup[0],
        courtId: court.id,
        title: `${sport.name} - ${court.name}`,
        courtName: court.name,
        address: court.address,
        dateTime: playedAt,
        maxPlayers: 4,
        visibility: "PUBLIC",
        status: "COMPLETED",
        description: "",
        participants: {
          create: lineup.map((userId) => ({
            userId,
            status: "JOINED" as const,
          })),
        },
      },
      select: { id: true },
    });

    completedCount += 1;
    for (const userId of lineup) {
      remaining.set(userId, (remaining.get(userId) ?? 0) - 1);
    }

    for (const fromUserId of lineup) {
      for (const toUserId of lineup) {
        if (fromUserId === toUserId) continue;
        if (random() > 0.6) continue;
        await prisma.rating.create({
          data: {
            fromUserId,
            toUserId,
            matchId: match.id,
            stars: starsAround(starTarget.get(toUserId) ?? 4),
            comment: "",
          },
        });
        ratingCount += 1;
      }
    }
  }

  console.log("Tạo trận sắp diễn ra...");
  const upcoming = [
    {
      sportId: "badminton",
      hostId: "169",
      courtId: "c3",
      title: "Cầu lông - Cầu giấy sport center",
      courtName: "Cầu giấy sport center",
      address: "Cầu Giấy, Hà Nội",
      dayOffset: 1,
      hour: 20,
      maxPlayers: 4,
      skillRequirement: null,
      visibility: "PUBLIC" as const,
      description: "",
      participants: [{ userId: "169", status: "JOINED" as const }],
    },
    {
      sportId: "badminton",
      hostId: "1",
      courtId: "c1",
      title: "Cầu lông tối thứ 4 - Ba Đình",
      courtName: "CLB Cau long Dong Da",
      address: "Dong Da, Ha Noi",
      dayOffset: 3,
      hour: 19,
      maxPlayers: 4,
      skillRequirement: "INTERMEDIATE" as const,
      visibility: "INVITE" as const,
      description: "Đánh đôi nhẹ nhàng, ưu tiên bạn đã chơi trên 1 năm.",
      participants: [
        { userId: "1", status: "JOINED" as const },
        { userId: "5", status: "JOINED" as const },
        { userId: "169", status: "INVITED" as const },
      ],
    },
    {
      sportId: "pickleball",
      hostId: "4",
      courtId: "c2",
      title: "Pickleball cuối tuần - Mỹ Đình",
      courtName: "San Pickleball Tay Ho",
      address: "Tay Ho, Ha Noi",
      dayOffset: 6,
      hour: 8,
      maxPlayers: 6,
      skillRequirement: null,
      visibility: "INVITE" as const,
      description: "Nhóm chơi cố định sáng cuối tuần, có sẵn bóng.",
      participants: [
        { userId: "4", status: "JOINED" as const },
        { userId: "10", status: "JOINED" as const },
        { userId: "169", status: "JOINED" as const },
      ],
    },
  ];

  const upcomingIds: string[] = [];
  for (const item of upcoming) {
    const { dayOffset, hour, participants, ...rest } = item;
    const dateTime = new Date();
    dateTime.setDate(dateTime.getDate() + dayOffset);
    dateTime.setHours(hour, 0, 0, 0);

    const created = await prisma.match.create({
      data: {
        ...rest,
        dateTime,
        status: "UPCOMING",
        participants: { create: participants },
        conversation: {
          create: {
            members: {
              create: participants.map((participant) => ({
                userId: participant.userId,
              })),
            },
          },
        },
      },
      select: { id: true },
    });
    upcomingIds.push(created.id);
  }

  console.log("Tạo thông báo cho lời mời đang chờ...");
  await prisma.notification.create({
    data: {
      userId: "169",
      type: "INVITE",
      title: "Bạn có lời mời trận đấu mới",
      body: "Cầu lông tối thứ 4 - Ba Đình · CLB Cau long Dong Da",
      payload: { matchId: upcomingIds[1] },
    },
  });

  console.log("");
  console.log(`✓ ${users.length + extraPlayers.length} người dùng`);
  console.log(`✓ ${sports.length} môn thể thao, ${courts.length} sân`);
  console.log(
    `✓ ${completedCount} trận đã hoàn tất, ${upcoming.length} trận sắp diễn ra`,
  );
  console.log(`✓ ${ratingCount} đánh giá`);
  console.log("");
  console.log(`Đăng nhập thử: manh.phan@sportmatch.vn / ${SEED_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
