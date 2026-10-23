/** Định dạng thời gian cho trang Tin nhắn (kiểu Zalo), theo giờ Việt Nam. */

const TIME_ZONE = "Asia/Ho_Chi_Minh";
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const timeFormat = new Intl.DateTimeFormat("vi-VN", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});
const dayKeyFormat = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE });
const weekdayFormat = new Intl.DateTimeFormat("vi-VN", { timeZone: TIME_ZONE, weekday: "long" });
const shortDateFormat = new Intl.DateTimeFormat("vi-VN", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
});
const fullDateFormat = new Intl.DateTimeFormat("vi-VN", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** "2026-10-05" theo giờ VN — để so sánh cùng ngày. */
export function dayKey(date: Date) {
  return dayKeyFormat.format(date);
}

function daysBetween(date: Date, now: Date) {
  return Math.round(
    (Date.parse(dayKey(now)) - Date.parse(dayKey(date))) / DAY,
  );
}

export function formatClock(iso: string) {
  return timeFormat.format(new Date(iso));
}

/** Thời gian ở danh sách hội thoại: "Vừa xong", "5 phút", "3 giờ", "Hôm qua", "T2", "12/03". */
export function formatListTime(iso: string, now = new Date()) {
  const date = new Date(iso);
  const diff = now.getTime() - date.getTime();
  if (diff < MINUTE) return "Vừa xong";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} phút`;

  const days = daysBetween(date, now);
  if (days === 0) return `${Math.floor(diff / HOUR)} giờ`;
  if (days === 1) return "Hôm qua";
  if (days < 7) return weekdayFormat.format(date).replace("Thứ ", "T").replace("Chủ Nhật", "CN");
  return date.getFullYear() === now.getFullYear()
    ? shortDateFormat.format(date)
    : fullDateFormat.format(date);
}

/** Nhãn mốc ngày giữa khung chat: "Hôm nay", "Hôm qua", "Thứ Hai", "12/03/2026". */
export function formatDayDivider(iso: string, now = new Date()) {
  const date = new Date(iso);
  const days = daysBetween(date, now);
  if (days === 0) return "Hôm nay";
  if (days === 1) return "Hôm qua";
  if (days < 7) return weekdayFormat.format(date);
  return fullDateFormat.format(date);
}
