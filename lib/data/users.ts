import "server-only";

import {
  MAX_FAVORITE_COURTS,
  MAX_PREFERRED_AREAS,
  isPlayArea,
} from "@/lib/areas";
import { getSessionUserId, requireUserId } from "@/lib/auth/session";
import { DAY_END_MINUTE, sortSlots, validateSlots } from "@/lib/availability";
import {
  GENDER_FROM_DB,
  GENDER_TO_DB,
  PURPOSE_FROM_DB,
  PURPOSE_TO_DB,
  SKILL_FROM_DB,
  SKILL_TO_DB,
  WEEKDAY_FROM_DB,
  WEEKDAY_TO_DB,
  dateToString,
} from "@/lib/db/mappers";
import type { Prisma } from "@/lib/generated/prisma/client";
import { distanceKm, roundKm, type LatLng } from "@/lib/geo";
import { geocodeArea } from "@/lib/osm/geocode";
import { prisma } from "@/lib/prisma";
import type { ProfileImageKind } from "@/lib/profile-media";
import {
  WEEKDAYS,
  type AvailabilitySlot,
  type Gender,
  type PlayPurpose,
  type SkillLevel,
  type User,
  type Weekday,
} from "@/lib/types";

const userSelect = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  image: true,
  coverImage: true,
  bio: true,
  area: true,
  lat: true,
  lng: true,
  gender: true,
  birthday: true,
  trustScore: true,
  isOnline: true,
  isPro: true,
  communityVotes: true,
  createdAt: true,
  sports: {
    select: {
      sportId: true,
      skillLevel: true,
      purposes: true,
      preferredAreas: true,
      favoriteCourts: {
        select: { court: { select: { id: true, name: true, area: true } } },
        orderBy: { court: { name: "asc" } },
      },
    },
    orderBy: { sportId: "asc" },
  },
  availability: { select: { day: true, startMinute: true, endMinute: true } },
  ratingsGot: { select: { stars: true } },
  _count: {
    select: {
      participation: {
        where: { status: "JOINED", match: { status: "COMPLETED" } },
      },
    },
  },
} as const;

type UserRow = Prisma.UserGetPayload<{ select: typeof userSelect }>;

/**
 * `matchCount`, `averageStars`, `ratingCount` là giá trị dẫn xuất (derived) —
 * tính từ Rating và MatchParticipant chứ không lưu cột riêng, đúng như mô tả
 * `RankingScore` trong data-model.
 */
function toDomainUser(row: UserRow, origin?: LatLng | null): User {
  const ratingCount = row.ratingsGot.length;
  const averageStars =
    ratingCount === 0
      ? 0
      : Math.round(
          (row.ratingsGot.reduce((sum, rating) => sum + rating.stars, 0) /
            ratingCount) *
            10,
        ) / 10;

  const hasCoords = row.lat !== null && row.lng !== null;
  const availabilitySlots = sortSlots(
    row.availability.map((slot) => ({
      day: WEEKDAY_FROM_DB[slot.day],
      startMinute: slot.startMinute,
      endMinute: slot.endMinute,
    })),
  );

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatar: row.avatar,
    avatarUrl: row.image,
    coverImageUrl: row.coverImage,
    bio: row.bio,
    area: row.area,
    lat: row.lat ?? 0,
    lng: row.lng ?? 0,
    gender: row.gender ? GENDER_FROM_DB[row.gender] : "Khác",
    birthday: dateToString(row.birthday),
    trustScore: row.trustScore,
    isOnline: row.isOnline,
    isPro: row.isPro,
    distanceKm:
      origin && hasCoords
        ? roundKm(distanceKm(origin, { lat: row.lat!, lng: row.lng! }))
        : 0,
    sports: row.sports.map((sport) => ({
      sportId: sport.sportId,
      skillLevel: SKILL_FROM_DB[sport.skillLevel],
      purposes: sport.purposes.map((purpose) => PURPOSE_FROM_DB[purpose]),
      preferredAreas: sport.preferredAreas,
      favoriteCourts: sport.favoriteCourts.map((entry) => entry.court),
    })),
    availability: WEEKDAYS.filter((day) =>
      availabilitySlots.some((slot) => slot.day === day),
    ),
    availabilitySlots,
    matchCount: row._count.participation,
    averageStars,
    ratingCount,
    communityVotes: row.communityVotes,
    createdAt: dateToString(row.createdAt),
  };
}

/**
 * @param origin toạ độ người xem — dùng để tính `distanceKm`. Bỏ trống thì
 *   khoảng cách trả về 0.
 */
export async function getUsers(origin?: LatLng | null): Promise<User[]> {
  const rows = await prisma.user.findMany({
    select: userSelect,
    orderBy: { createdAt: "asc" },
  });
  return rows.map((row) => toDomainUser(row, origin));
}

export async function getUserById(
  id: string,
  origin?: LatLng | null,
): Promise<User | null> {
  const row = await prisma.user.findUnique({ where: { id }, select: userSelect });
  return row ? toDomainUser(row, origin) : null;
}

export async function getCurrentUser(): Promise<User> {
  const userId = await requireUserId();
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });

  if (!row) {
    throw new Error("Không tìm thấy người dùng của phiên đăng nhập hiện tại.");
  }

  return toDomainUser(row);
}

export type ViewerSummary = {
  id: string;
  name: string;
  avatar: string;
  avatarUrl: string | null;
};

/**
 * Người đang xem trang công khai (landing...) nếu đã đăng nhập, ngược lại
 * `null`. Không redirect và không ném lỗi — trang công khai vẫn phải hiển thị
 * được khi database tạm thời không truy cập được.
 */
export async function getViewerSummary(): Promise<ViewerSummary | null> {
  try {
    const userId = await getSessionUserId();
    if (!userId) return null;
    const row = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, avatar: true, image: true },
    });
    return row
      ? { id: row.id, name: row.name, avatar: row.avatar, avatarUrl: row.image }
      : null;
  } catch (error) {
    console.error("getViewerSummary thất bại:", error);
    return null;
  }
}

export type UserSportInput = {
  sportId: string;
  skillLevel: SkillLevel;
  purposes: PlayPurpose[];
  preferredAreas: string[];
  favoriteCourtIds: string[];
};

export type UserProfileInput = {
  name: string;
  avatar: string;
  area: string;
  /** Toạ độ từ GPS khi bấm "Vị trí"; bỏ trống thì tra từ `area` nếu đổi. */
  coords?: LatLng | null;
  gender: Gender;
  birthday: string;
  bio: string;
  sports: UserSportInput[];
  availability: AvailabilitySlot[];
};

/** Lỗi dữ liệu hồ sơ do người dùng nhập — message hiển thị thẳng cho user. */
export class ProfileInputError extends Error {}

/**
 * Kiểm tra phần hồ sơ thể thao + lịch rảnh trước khi ghi: không trùng môn,
 * khu vực thuộc danh sách chuẩn, sân yêu thích phải là sân có thật và có môn
 * đó, khung giờ hợp lệ và không chồng nhau.
 */
async function assertValidSportProfile(input: UserProfileInput) {
  const sportIds = input.sports.map((sport) => sport.sportId);
  if (new Set(sportIds).size !== sportIds.length) {
    throw new ProfileInputError("Mỗi môn thể thao chỉ được thêm một lần.");
  }

  for (const sport of input.sports) {
    if (sport.preferredAreas.length > MAX_PREFERRED_AREAS) {
      throw new ProfileInputError(
        `Chọn tối đa ${MAX_PREFERRED_AREAS} khu vực cho mỗi môn.`,
      );
    }
    if (!sport.preferredAreas.every(isPlayArea)) {
      throw new ProfileInputError("Khu vực thường chơi không hợp lệ.");
    }
    if (sport.favoriteCourtIds.length > MAX_FAVORITE_COURTS) {
      throw new ProfileInputError(
        `Chọn tối đa ${MAX_FAVORITE_COURTS} sân yêu thích cho mỗi môn.`,
      );
    }
    if (sport.favoriteCourtIds.length > 0) {
      const found = await prisma.courtSport.count({
        where: {
          sportId: sport.sportId,
          courtId: { in: sport.favoriteCourtIds },
        },
      });
      if (found !== new Set(sport.favoriteCourtIds).size) {
        throw new ProfileInputError(
          "Sân yêu thích phải là sân có sẵn trong hệ thống và có môn đã chọn.",
        );
      }
    }
  }

  const slotError = validateSlots(input.availability);
  if (slotError) throw new ProfileInputError(slotError);
}

export async function updateCurrentUser(
  input: UserProfileInput,
): Promise<User> {
  const userId = await requireUserId();
  await assertValidSportProfile(input);

  const current = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { area: true },
  });
  const coords =
    input.coords ??
    (input.area !== current.area ? await geocodeArea(input.area) : null);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name,
        avatar: input.avatar,
        area: input.area,
        ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
        gender: GENDER_TO_DB[input.gender],
        birthday: input.birthday ? new Date(input.birthday) : null,
        bio: input.bio,
      },
    }),
    // Xoá UserSport kéo theo UserSportCourt (onDelete: Cascade).
    prisma.userSport.deleteMany({ where: { userId } }),
    ...input.sports.map((sport) =>
      prisma.userSport.create({
        data: {
          userId,
          sportId: sport.sportId,
          skillLevel: SKILL_TO_DB[sport.skillLevel],
          purposes: [...new Set(sport.purposes)].map(
            (purpose) => PURPOSE_TO_DB[purpose],
          ),
          preferredAreas: [...new Set(sport.preferredAreas)],
          favoriteCourts: {
            create: [...new Set(sport.favoriteCourtIds)].map((courtId) => ({
              courtId,
            })),
          },
        },
      }),
    ),
    prisma.availability.deleteMany({ where: { userId } }),
    prisma.availability.createMany({
      data: input.availability.map((slot) => ({
        userId,
        day: WEEKDAY_TO_DB[slot.day],
        startMinute: slot.startMinute,
        endMinute: slot.endMinute,
      })),
    }),
  ]);

  return getCurrentUser();
}

const IMAGE_COLUMN = {
  avatar: "image",
  cover: "coverImage",
} as const satisfies Record<ProfileImageKind, string>;

/**
 * Ghi URL ảnh đại diện / ảnh bìa mới (hoặc `null` để bỏ ảnh) cho `userId` và
 * trả về URL cũ (để dọn file). Hàm KHÔNG tự kiểm tra quyền — nơi gọi phải truyền đúng user của phiên
 * đăng nhập.
 */
export async function replaceUserImage(
  userId: string,
  kind: ProfileImageKind,
  url: string | null,
): Promise<string | null> {
  const column = IMAGE_COLUMN[kind];
  const previous = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { image: true, coverImage: true },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { [column]: url },
  });
  return previous[column];
}

export type OnboardingInput = {
  avatar: string;
  area: string;
  /** Toạ độ từ GPS ở bước 3; bỏ trống thì tra từ `area`. */
  coords?: LatLng | null;
  sports: { sportId: string; skillLevel: SkillLevel }[];
  /** Onboarding chỉ hỏi ngày → mỗi ngày lưu thành khung "cả ngày". */
  availability: Weekday[];
};

/** Đánh dấu đã hoàn tất onboarding (dùng khi kết thúc wizard 5 bước). */
export async function completeOnboarding(
  input: OnboardingInput,
): Promise<void> {
  const userId = await requireUserId();
  // Toạ độ dùng để tính khoảng cách ở Khám phá / Trận đấu.
  const coords = input.coords ?? (await geocodeArea(input.area));

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        avatar: input.avatar,
        area: input.area,
        ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
        onboardedAt: new Date(),
      },
    }),
    prisma.userSport.deleteMany({ where: { userId } }),
    prisma.userSport.createMany({
      data: input.sports.map((sport) => ({
        userId,
        sportId: sport.sportId,
        skillLevel: SKILL_TO_DB[sport.skillLevel],
      })),
    }),
    prisma.availability.deleteMany({ where: { userId } }),
    prisma.availability.createMany({
      data: input.availability.map((day) => ({
        userId,
        day: WEEKDAY_TO_DB[day],
        startMinute: 0,
        endMinute: DAY_END_MINUTE,
      })),
    }),
  ]);
}
