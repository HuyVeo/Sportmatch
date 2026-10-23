import type { PrismaClient } from "../lib/generated/prisma/client";
import type {
  Gender,
  SkillLevel,
  Weekday,
} from "../lib/generated/prisma/enums";

export type SeedUser = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  area: string;
  lat: number;
  lng: number;
  gender: Gender;
  birthday: string;
  trustScore: number;
  isOnline: boolean;
  isPro: boolean;
  communityVotes: number;
  sports: { sportId: string; skillLevel: SkillLevel }[];
  availability: Weekday[];
  /** Mức sao mong muốn — dùng để sinh dữ liệu Rating quanh giá trị này. */
  targetStars: number;
  /** Số trận đã hoàn tất mong muốn — dùng để phân bổ trận trong seed. */
  targetMatches: number;
};

/** Tạo một user demo kèm hồ sơ thể thao và lịch rảnh. */
export async function createSeedUser(
  prisma: PrismaClient,
  user: SeedUser,
  passwordHash: string,
) {
  const { sports: userSports, availability, targetStars, targetMatches, ...rest } =
    user;
  void targetStars;
  void targetMatches;

  await prisma.user.create({
    data: {
      ...rest,
      birthday: new Date(user.birthday),
      emailVerified: new Date(),
      passwordHash,
      onboardedAt: new Date(),
      // Dữ liệu demo: khu vực chơi = quận của user, mục đích "Giao lưu";
      // lịch rảnh ngày thường 18:00–21:00, cuối tuần 07:00–11:00.
      sports: {
        create: userSports.map((sport) => ({
          ...sport,
          purposes: ["SOCIAL"],
          preferredAreas: [user.area.split(",")[0].trim()],
        })),
      },
      availability: {
        create: availability.map((day) =>
          day === "SAT" || day === "SUN"
            ? { day, startMinute: 7 * 60, endMinute: 11 * 60 }
            : { day, startMinute: 18 * 60, endMinute: 21 * 60 },
        ),
      },
    },
  });
}
