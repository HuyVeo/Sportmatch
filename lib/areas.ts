/**
 * Khu vực thường chơi (chọn nhiều) — danh sách chuẩn để matchmaking so khớp
 * chính xác từng chuỗi. Dùng lại tên quận đang có trong `User.area`
 * ("Tây Hồ, Hà Nội" → "Tây Hồ"). Project chưa có bảng địa giới riêng; khi mở
 * rộng ra tỉnh/thành khác thì chuyển danh sách này thành bảng trong DB.
 */
export const PLAY_AREAS = [
  "Ba Đình",
  "Hoàn Kiếm",
  "Tây Hồ",
  "Long Biên",
  "Cầu Giấy",
  "Đống Đa",
  "Hai Bà Trưng",
  "Hoàng Mai",
  "Thanh Xuân",
  "Nam Từ Liêm",
  "Bắc Từ Liêm",
  "Hà Đông",
] as const;

export type PlayArea = (typeof PLAY_AREAS)[number];

export function isPlayArea(value: string): value is PlayArea {
  return (PLAY_AREAS as readonly string[]).includes(value);
}

export const MAX_PREFERRED_AREAS = 6;
export const MAX_FAVORITE_COURTS = 10;
