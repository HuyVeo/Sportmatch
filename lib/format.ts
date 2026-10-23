export function calculateAge(birthday: string, today = new Date()): number {
  const birth = new Date(birthday);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

export function formatPrice(value: number): string {
  return `${value.toLocaleString("vi-VN")}đ/h`;
}

export function formatDateTime(value: string): string {
  const [date, time] = value.split("T");
  return `${date} · ${time.slice(0, 5)}`;
}

export function formatRelativeTime(value: string, now = new Date()): string {
  const diff = now.getTime() - new Date(value).getTime();
  const minutes = Math.round(diff / 60_000);

  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;

  const days = Math.round(hours / 24);
  if (days < 30) return `${days} ngày trước`;

  return new Date(value).toLocaleDateString("vi-VN");
}
