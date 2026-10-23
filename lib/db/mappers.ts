import {
  Gender as DbGender,
  MatchStatus as DbMatchStatus,
  MatchVisibility as DbMatchVisibility,
  ParticipantStatus as DbParticipantStatus,
  PlayPurpose as DbPlayPurpose,
  SkillLevel as DbSkillLevel,
  Weekday as DbWeekday,
} from "@/lib/generated/prisma/enums";
import type {
  Gender,
  MatchParticipant,
  MatchStatus,
  MatchVisibility,
  PlayPurpose,
  SkillLevel,
  SkillRequirement,
  Weekday,
} from "@/lib/types";

/**
 * DB lưu enum bằng mã tiếng Anh cho gọn và ổn định; toàn bộ UI dùng nhãn tiếng
 * Việt theo ảnh gốc. Hai bảng dưới là nơi duy nhất dịch qua lại.
 */

export const SKILL_TO_DB: Record<SkillLevel, DbSkillLevel> = {
  "Mới chơi": DbSkillLevel.BEGINNER,
  "Trung cấp": DbSkillLevel.INTERMEDIATE,
  "Chuyên nghiệp": DbSkillLevel.ADVANCED,
};

export const SKILL_FROM_DB: Record<DbSkillLevel, SkillLevel> = {
  BEGINNER: "Mới chơi",
  INTERMEDIATE: "Trung cấp",
  ADVANCED: "Chuyên nghiệp",
};

export const PURPOSE_TO_DB: Record<PlayPurpose, DbPlayPurpose> = {
  "Giao lưu": DbPlayPurpose.SOCIAL,
  "Luyện tập": DbPlayPurpose.PRACTICE,
  "Thi đấu": DbPlayPurpose.COMPETITIVE,
};

export const PURPOSE_FROM_DB: Record<DbPlayPurpose, PlayPurpose> = {
  SOCIAL: "Giao lưu",
  PRACTICE: "Luyện tập",
  COMPETITIVE: "Thi đấu",
};

export const GENDER_TO_DB: Record<Gender, DbGender> = {
  Nam: DbGender.MALE,
  Nữ: DbGender.FEMALE,
  Khác: DbGender.OTHER,
};

export const GENDER_FROM_DB: Record<DbGender, Gender> = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
};

export const WEEKDAY_TO_DB: Record<Weekday, DbWeekday> = {
  "Thứ hai": DbWeekday.MON,
  "Thứ ba": DbWeekday.TUE,
  "Thứ tư": DbWeekday.WED,
  "Thứ năm": DbWeekday.THU,
  "Thứ sáu": DbWeekday.FRI,
  "Thứ bảy": DbWeekday.SAT,
  "Chủ nhật": DbWeekday.SUN,
};

export const WEEKDAY_FROM_DB: Record<DbWeekday, Weekday> = {
  MON: "Thứ hai",
  TUE: "Thứ ba",
  WED: "Thứ tư",
  THU: "Thứ năm",
  FRI: "Thứ sáu",
  SAT: "Thứ bảy",
  SUN: "Chủ nhật",
};

export const VISIBILITY_TO_DB: Record<MatchVisibility, DbMatchVisibility> = {
  "Công khai": DbMatchVisibility.PUBLIC,
  "Theo lời mời": DbMatchVisibility.INVITE,
  "Riêng tư": DbMatchVisibility.PRIVATE,
};

export const VISIBILITY_FROM_DB: Record<DbMatchVisibility, MatchVisibility> = {
  PUBLIC: "Công khai",
  INVITE: "Theo lời mời",
  PRIVATE: "Riêng tư",
};

export const STATUS_TO_DB: Record<MatchStatus, DbMatchStatus> = {
  "Sắp diễn ra": DbMatchStatus.UPCOMING,
  "Đang diễn ra": DbMatchStatus.ONGOING,
  "Đã hoàn tất": DbMatchStatus.COMPLETED,
};

export const STATUS_FROM_DB: Record<DbMatchStatus, MatchStatus> = {
  UPCOMING: "Sắp diễn ra",
  ONGOING: "Đang diễn ra",
  COMPLETED: "Đã hoàn tất",
};

export const PARTICIPANT_TO_DB: Record<
  MatchParticipant["status"],
  DbParticipantStatus
> = {
  invited: DbParticipantStatus.INVITED,
  requested: DbParticipantStatus.REQUESTED,
  joined: DbParticipantStatus.JOINED,
  left: DbParticipantStatus.LEFT,
};

export const PARTICIPANT_FROM_DB: Record<
  DbParticipantStatus,
  MatchParticipant["status"]
> = {
  INVITED: "invited",
  REQUESTED: "requested",
  JOINED: "joined",
  LEFT: "left",
};

/** `null` trong DB nghĩa là trận không giới hạn trình độ ("Bất kỳ"). */
export function skillRequirementFromDb(
  value: DbSkillLevel | null,
): SkillRequirement {
  return value === null ? "Bất kỳ" : SKILL_FROM_DB[value];
}

export function skillRequirementToDb(
  value: SkillRequirement,
): DbSkillLevel | null {
  return value === "Bất kỳ" ? null : SKILL_TO_DB[value];
}

/** DB lưu DateTime; UI dùng chuỗi "YYYY-MM-DDTHH:mm:ss" giờ địa phương. */
export function dateTimeToString(value: Date): string {
  const pad = (input: number) => String(input).padStart(2, "0");
  return (
    `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}` +
    `T${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`
  );
}

export function dateToString(value: Date | null): string {
  if (!value) return "";
  const pad = (input: number) => String(input).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}
