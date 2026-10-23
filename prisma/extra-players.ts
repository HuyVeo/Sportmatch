import type { SeedUser } from "./seed-users";

/**
 * Người chơi demo cho 12 môn thêm ở migration 20260929000000_more_sports —
 * mỗi môn 3 người (Mới chơi / Trung cấp / Chuyên nghiệp) để thử được luồng
 * mời người chơi khi tạo trận. Chỉ thêm mới, không đụng user có sẵn.
 * Nạp vào DB đang có (không xoá dữ liệu): `pnpm db:add-players`.
 */

/** Toạ độ trung tâm các quận trong `lib/areas.ts`. */
const AREAS = {
  "Ba Đình": { lat: 21.0353, lng: 105.8145 },
  "Hoàn Kiếm": { lat: 21.0288, lng: 105.8525 },
  "Tây Hồ": { lat: 21.0685, lng: 105.8207 },
  "Long Biên": { lat: 21.0469, lng: 105.8888 },
  "Cầu Giấy": { lat: 21.0333, lng: 105.7936 },
  "Đống Đa": { lat: 21.0181, lng: 105.8292 },
  "Hai Bà Trưng": { lat: 21.0059, lng: 105.8573 },
  "Hoàng Mai": { lat: 20.9745, lng: 105.8633 },
  "Thanh Xuân": { lat: 20.9937, lng: 105.8053 },
  "Nam Từ Liêm": { lat: 21.0152, lng: 105.7657 },
  "Bắc Từ Liêm": { lat: 21.0708, lng: 105.763 },
  "Hà Đông": { lat: 20.9713, lng: 105.7788 },
} as const;

type Area = keyof typeof AREAS;

type PlayerRow = {
  slug: string;
  name: string;
  gender: SeedUser["gender"];
  avatar: string;
  area: Area;
  sports: SeedUser["sports"];
  bio: string;
};

const rows: PlayerRow[] = [
  // Bóng đá
  { slug: "quang.huy", name: "Trần Quang Huy", gender: "MALE", avatar: "🧔", area: "Cầu Giấy", sports: [{ sportId: "football", skillLevel: "ADVANCED" }, { sportId: "futsal", skillLevel: "INTERMEDIATE" }], bio: "Đá sân 7 mỗi tối thứ ba, thứ năm. Cần thêm người đá cánh." },
  { slug: "duc.anh", name: "Lê Đức Anh", gender: "MALE", avatar: "👨", area: "Nam Từ Liêm", sports: [{ sportId: "football", skillLevel: "INTERMEDIATE" }], bio: "Thủ môn phong trào, sẵn sàng bắt chính." },
  { slug: "minh.tuan", name: "Phạm Minh Tuấn", gender: "MALE", avatar: "🧑", area: "Đống Đa", sports: [{ sportId: "football", skillLevel: "BEGINNER" }], bio: "Mới đá lại sau vài năm nghỉ, tìm đội đá vui vẻ." },
  // Futsal
  { slug: "hoang.long", name: "Vũ Hoàng Long", gender: "MALE", avatar: "👱‍♂️", area: "Thanh Xuân", sports: [{ sportId: "futsal", skillLevel: "ADVANCED" }], bio: "Từng đá futsal sinh viên, thích lối chơi nhanh." },
  { slug: "thanh.dat", name: "Đỗ Thành Đạt", gender: "MALE", avatar: "🧑‍🦱", area: "Hai Bà Trưng", sports: [{ sportId: "futsal", skillLevel: "INTERMEDIATE" }], bio: "Đá futsal cuối tuần, ưu tiên sân trong nhà." },
  { slug: "khanh.linh", name: "Ngô Khánh Linh", gender: "FEMALE", avatar: "👩‍🦰", area: "Ba Đình", sports: [{ sportId: "futsal", skillLevel: "BEGINNER" }], bio: "Tìm đội futsal nữ hoặc đội mix để tập." },
  // Tennis
  { slug: "bao.ngoc", name: "Hoàng Bảo Ngọc", gender: "FEMALE", avatar: "👩", area: "Tây Hồ", sports: [{ sportId: "tennis", skillLevel: "ADVANCED" }], bio: "Chơi tennis 8 năm, tìm bạn đánh đôi buổi sáng." },
  { slug: "gia.bao", name: "Bùi Gia Bảo", gender: "MALE", avatar: "🧑‍🦰", area: "Hoàn Kiếm", sports: [{ sportId: "tennis", skillLevel: "INTERMEDIATE" }], bio: "Đánh đơn và đôi đều được, rảnh tối trong tuần." },
  { slug: "thu.trang", name: "Đặng Thu Trang", gender: "FEMALE", avatar: "👱‍♀️", area: "Long Biên", sports: [{ sportId: "tennis", skillLevel: "BEGINNER" }], bio: "Mới học tennis được 3 tháng, cần bạn tập cùng." },
  // Bóng bàn
  { slug: "van.hung", name: "Nguyễn Văn Hùng", gender: "MALE", avatar: "👴", area: "Đống Đa", sports: [{ sportId: "table_tennis", skillLevel: "ADVANCED" }], bio: "Bóng bàn là niềm vui mỗi tối, thích giao lưu học hỏi." },
  { slug: "my.duyen", name: "Trịnh Mỹ Duyên", gender: "FEMALE", avatar: "👩‍🦱", area: "Cầu Giấy", sports: [{ sportId: "table_tennis", skillLevel: "INTERMEDIATE" }], bio: "Đánh bóng bàn ở CLB phường, tìm thêm bạn đánh." },
  { slug: "tien.dung", name: "Lý Tiến Dũng", gender: "MALE", avatar: "🧑", area: "Hoàng Mai", sports: [{ sportId: "table_tennis", skillLevel: "BEGINNER" }], bio: "Mới chơi, muốn tập giao bóng xoáy." },
  // Bóng chuyền
  { slug: "ngoc.anh", name: "Phan Ngọc Ánh", gender: "FEMALE", avatar: "👩", area: "Bắc Từ Liêm", sports: [{ sportId: "volleyball", skillLevel: "ADVANCED" }], bio: "Chủ công đội bóng chuyền hơi công ty." },
  { slug: "cong.minh", name: "Tạ Công Minh", gender: "MALE", avatar: "👨", area: "Hà Đông", sports: [{ sportId: "volleyball", skillLevel: "INTERMEDIATE" }, { sportId: "basketball", skillLevel: "BEGINNER" }], bio: "Chơi bóng chuyền và tập thêm bóng rổ." },
  { slug: "ha.my", name: "Cao Hà My", gender: "FEMALE", avatar: "👱‍♀️", area: "Thanh Xuân", sports: [{ sportId: "volleyball", skillLevel: "BEGINNER" }], bio: "Tìm nhóm bóng chuyền mix chơi cuối tuần." },
  // Bóng rổ
  { slug: "quoc.khanh", name: "Mai Quốc Khánh", gender: "MALE", avatar: "🧔", area: "Ba Đình", sports: [{ sportId: "basketball", skillLevel: "ADVANCED" }], bio: "Chơi 3x3 và 5x5, vị trí hậu vệ dẫn bóng." },
  { slug: "nhat.nam", name: "Đinh Nhật Nam", gender: "MALE", avatar: "🧑‍🦱", area: "Nam Từ Liêm", sports: [{ sportId: "basketball", skillLevel: "INTERMEDIATE" }], bio: "Ném rổ tối thứ hai, tư, sáu ở sân Mỹ Đình." },
  { slug: "phuong.thao", name: "Lưu Phương Thảo", gender: "FEMALE", avatar: "👩‍🦰", area: "Cầu Giấy", sports: [{ sportId: "basketball", skillLevel: "BEGINNER" }], bio: "Mới tập bóng rổ, cần nhóm kiên nhẫn." },
  // Bóng ném
  { slug: "trung.kien", name: "Hà Trung Kiên", gender: "MALE", avatar: "👨", area: "Long Biên", sports: [{ sportId: "handball", skillLevel: "ADVANCED" }], bio: "Từng chơi bóng ném đội tuyển trường." },
  { slug: "thu.ha.nem", name: "Kiều Thu Hà", gender: "FEMALE", avatar: "👩", area: "Đống Đa", sports: [{ sportId: "handball", skillLevel: "INTERMEDIATE" }], bio: "Tìm đội bóng ném mix tập hằng tuần." },
  { slug: "van.khoa", name: "Tôn Văn Khoa", gender: "MALE", avatar: "🧑", area: "Hai Bà Trưng", sports: [{ sportId: "handball", skillLevel: "BEGINNER" }], bio: "Muốn thử môn mới, sẵn sàng học luật." },
  // Golf
  { slug: "duc.thang", name: "Võ Đức Thắng", gender: "MALE", avatar: "👴", area: "Tây Hồ", sports: [{ sportId: "golf", skillLevel: "ADVANCED" }], bio: "Handicap 12, ra sân sáng cuối tuần." },
  { slug: "lan.huong", name: "Nghiêm Lan Hương", gender: "FEMALE", avatar: "👩‍🦱", area: "Hoàn Kiếm", sports: [{ sportId: "golf", skillLevel: "INTERMEDIATE" }], bio: "Tìm nhóm đi sân 18 lỗ quanh Hà Nội." },
  { slug: "tuan.kiet", name: "Châu Tuấn Kiệt", gender: "MALE", avatar: "🧑‍🦰", area: "Nam Từ Liêm", sports: [{ sportId: "golf", skillLevel: "BEGINNER" }], bio: "Mới tập ở sân tập, muốn ra sân lần đầu." },
  // Bi-a
  { slug: "van.tai", name: "Quách Văn Tài", gender: "MALE", avatar: "🧔", area: "Hoàng Mai", sports: [{ sportId: "billiards", skillLevel: "ADVANCED" }, { sportId: "bowling", skillLevel: "INTERMEDIATE" }], bio: "Chơi bi-a lỗ và carom, tối nào cũng rảnh." },
  { slug: "hai.dang", name: "Dương Hải Đăng", gender: "MALE", avatar: "👱‍♂️", area: "Thanh Xuân", sports: [{ sportId: "billiards", skillLevel: "INTERMEDIATE" }], bio: "Đánh bi-a giải trí, thích giao lưu." },
  { slug: "kim.chi", name: "Lạc Kim Chi", gender: "FEMALE", avatar: "👩", area: "Ba Đình", sports: [{ sportId: "billiards", skillLevel: "BEGINNER" }], bio: "Mới chơi bi-a, cần người hướng dẫn." },
  // Bowling
  { slug: "thao.vy", name: "Mạc Thảo Vy", gender: "FEMALE", avatar: "👱‍♀️", area: "Cầu Giấy", sports: [{ sportId: "bowling", skillLevel: "ADVANCED" }], bio: "Điểm trung bình 180, chơi bowling tối thứ sáu." },
  { slug: "quang.vinh", name: "Âu Quang Vinh", gender: "MALE", avatar: "👨", area: "Hà Đông", sports: [{ sportId: "bowling", skillLevel: "INTERMEDIATE" }], bio: "Tìm nhóm bowling cố định cuối tuần." },
  { slug: "ngoc.han", name: "Giang Ngọc Hân", gender: "FEMALE", avatar: "👩‍🦰", area: "Tây Hồ", sports: [{ sportId: "bowling", skillLevel: "BEGINNER" }], bio: "Chơi bowling cho vui, không cần giỏi." },
  // Bơi lội
  { slug: "minh.chau", name: "Tăng Minh Châu", gender: "FEMALE", avatar: "👩", area: "Long Biên", sports: [{ sportId: "swimming", skillLevel: "ADVANCED" }], bio: "Bơi 2km mỗi sáng, tìm bạn bơi cùng giữ nhịp." },
  { slug: "the.vinh", name: "Hồ Thế Vinh", gender: "MALE", avatar: "🧑", area: "Bắc Từ Liêm", sports: [{ sportId: "swimming", skillLevel: "INTERMEDIATE" }], bio: "Bơi ếch và sải, rảnh tối trong tuần." },
  { slug: "bich.ngoc", name: "Thái Bích Ngọc", gender: "FEMALE", avatar: "👩‍🦱", area: "Hai Bà Trưng", sports: [{ sportId: "swimming", skillLevel: "BEGINNER" }], bio: "Đang học bơi, muốn có bạn đi bể cùng." },
  // Boxing
  { slug: "hoang.nam", name: "Triệu Hoàng Nam", gender: "MALE", avatar: "🧔", area: "Hoàng Mai", sports: [{ sportId: "boxing", skillLevel: "ADVANCED" }], bio: "Tập boxing 5 năm, sẵn sàng đấu tập nhẹ." },
  { slug: "thanh.tam", name: "Khổng Thanh Tâm", gender: "FEMALE", avatar: "👩", area: "Đống Đa", sports: [{ sportId: "boxing", skillLevel: "INTERMEDIATE" }], bio: "Tập boxing giữ dáng, tìm bạn tập cặp." },
  { slug: "duy.khang", name: "Lâm Duy Khang", gender: "MALE", avatar: "👨", area: "Thanh Xuân", sports: [{ sportId: "boxing", skillLevel: "BEGINNER" }], bio: "Mới vào phòng tập, muốn luyện phản xạ." },
];

const AVAILABILITY_PATTERNS: SeedUser["availability"][] = [
  ["MON", "WED", "FRI"],
  ["TUE", "THU", "SAT"],
  ["SAT", "SUN"],
  ["MON", "TUE", "WED", "THU", "FRI"],
];

export const extraPlayers: SeedUser[] = rows.map((row, index) => {
  const center = AREAS[row.area];
  // Lệch nhẹ khỏi tâm quận để các điểm không chồng lên nhau trên bản đồ.
  const offset = ((index % 5) - 2) * 0.004;
  return {
    id: `demo-${row.slug.replace(/\./g, "-")}`,
    name: row.name,
    email: `${row.slug}@example.com`,
    avatar: row.avatar,
    bio: row.bio,
    area: `${row.area}, Hà Nội`,
    lat: center.lat + offset,
    lng: center.lng - offset,
    gender: row.gender,
    birthday: `${1985 + (index % 16)}-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 27) + 1).padStart(2, "0")}`,
    trustScore: 70 + ((index * 7) % 26),
    isOnline: index % 3 === 0,
    isPro: index % 7 === 0,
    communityVotes: (index * 3) % 20,
    sports: row.sports,
    availability: AVAILABILITY_PATTERNS[index % AVAILABILITY_PATTERNS.length],
    targetStars: 0,
    targetMatches: 0,
  };
});
