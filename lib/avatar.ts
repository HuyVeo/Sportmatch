/**
 * Avatar hệ thống (emoji). Chỉ dùng emoji một ký tự — emoji ghép bằng ZWJ
 * (🧑‍🦱, 👩‍🦰...) không có trên Windows 10, trình duyệt vẽ thành 2 hình
 * cạnh nhau nên bị lệch khỏi khung tròn.
 */
export const SYSTEM_AVATARS = [
  "🧑",
  "👩",
  "👨",
  "👱",
  "🧒",
  "👧",
  "👦",
  "🧔",
  "👵",
  "👴",
  "👶",
  "🙂",
  "😎",
  "🤠",
  "🥳",
  "😉",
] as const;

export const DEFAULT_AVATAR = SYSTEM_AVATARS[0];

/**
 * Emoji avatar đã lưu trước đây có thể là emoji ghép (ZWJ) — chỉ giữ phần
 * trước ZWJ để luôn hiển thị gọn trong khung trên mọi hệ điều hành.
 */
export function displayEmoji(emoji: string | null | undefined): string {
  const value = emoji?.split("‍")[0]?.replace(/️/g, "").trim();
  return value || DEFAULT_AVATAR;
}
