export const CLUB_SPORTS = [
  "Bóng đá",
  "Bóng rổ",
  "Cầu lông",
  "Bóng bàn",
  "Tennis",
  "Pickleball",
  "Võ thuật",
] as const;

export type ClubSport = (typeof CLUB_SPORTS)[number];
export type ClubLevel = "Người mới" | "Cơ bản" | "Trung bình" | "Nâng cao";
export type ClubStatus = "Đang hoạt động" | "Hoạt động không thường xuyên" | "Tạm ngưng";

export type ClubActivity = {
  title: string;
  kind: string;
  date: string;
  time: string;
  venue: string;
  joined: number;
  capacity: number;
};

export type Club = {
  id: string;
  name: string;
  sportType: ClubSport;
  area: string;
  logo: string;
  rating: number;
  memberCount: number;
  capacity: number;
  recruitmentCount: number;
  positions: string[];
  level: ClubLevel;
  schedule: string[];
  time: string;
  fee: number;
  activityCount: number;
  activityRate: number;
  responseRate: number;
  foundedMonths: number;
  description: string;
  status: ClubStatus;
  nextActivity: ClubActivity;
  members: string[];
  achievements: { events: number; wins: number; draws: number; losses: number };
};

type ClubSeed = Omit<Club, "positions" | "nextActivity" | "members" | "achievements"> & {
  positions: string[];
  activityTitle: string;
  venue: string;
};

const memberNames = [
  "Minh Anh", "Quốc Bảo", "Thu Hà", "Hoàng Nam", "Lan Chi", "Gia Huy",
  "Ngọc Trâm", "Tuấn Kiệt", "Phương Linh", "Đức Huy", "Bảo Ngọc", "Anh Khoa",
];

const seeds: ClubSeed[] = [
  { id: "club-01", name: "Cầu Lông Sunrise", sportType: "Cầu lông", area: "Cầu Giấy, Hà Nội", logo: "🏸", rating: 4.9, memberCount: 18, capacity: 24, recruitmentCount: 6, positions: ["Người chơi đôi"], level: "Cơ bản", schedule: ["T3", "T5", "T7"], time: "19:00–21:00", fee: 60000, activityCount: 32, activityRate: 92, responseRate: 96, foundedMonths: 22, description: "Nhóm cầu lông thân thiện, duy trì lịch tập đều và luôn dành sân cho người mới tham gia.", status: "Đang hoạt động", activityTitle: "Buổi tập đôi cuối tuần", venue: "Sân cầu lông Cầu Giấy" },
  { id: "club-02", name: "Pickleball CityCore", sportType: "Pickleball", area: "Quận 7, TP.HCM", logo: "🏓", rating: 4.8, memberCount: 21, capacity: 28, recruitmentCount: 7, positions: ["Đôi nam nữ", "Người mới"], level: "Người mới", schedule: ["T4", "T6", "CN"], time: "18:30–20:30", fee: 80000, activityCount: 26, activityRate: 88, responseRate: 91, foundedMonths: 14, description: "Cộng đồng pickleball cởi mở, có người hướng dẫn cơ bản và thường tổ chức giao lưu.", status: "Đang hoạt động", activityTitle: "Làm quen pickleball", venue: "CityCore Pickleball" },
  { id: "club-03", name: "Sài Gòn Football Hub", sportType: "Bóng đá", area: "Bình Thạnh, TP.HCM", logo: "⚽", rating: 4.7, memberCount: 18, capacity: 22, recruitmentCount: 4, positions: ["Thủ môn", "Hậu vệ"], level: "Trung bình", schedule: ["T3", "T5", "T7"], time: "20:00–22:00", fee: 90000, activityCount: 41, activityRate: 90, responseRate: 89, foundedMonths: 31, description: "Đội bóng đá phong trào sinh hoạt cố định, đề cao tinh thần đồng đội và đúng giờ.", status: "Đang hoạt động", activityTitle: "Tập chiến thuật 7 người", venue: "Sân Bình Thạnh" },
  { id: "club-04", name: "Racket House", sportType: "Tennis", area: "Quận 1, TP.HCM", logo: "🎾", rating: 4.6, memberCount: 12, capacity: 16, recruitmentCount: 4, positions: ["Đánh đơn", "Đánh đôi"], level: "Nâng cao", schedule: ["T2", "T4", "T6"], time: "06:30–08:00", fee: 120000, activityCount: 19, activityRate: 76, responseRate: 84, foundedMonths: 18, description: "Nhóm tennis quy mô nhỏ, ưu tiên các buổi tập kỹ thuật và trận đấu giao hữu.", status: "Đang hoạt động", activityTitle: "Giao hữu sáng thứ Sáu", venue: "Sân tennis Tao Đàn" },
  { id: "club-05", name: "Hoops Crew Thủ Đức", sportType: "Bóng rổ", area: "Thủ Đức, TP.HCM", logo: "🏀", rating: 4.8, memberCount: 25, capacity: 30, recruitmentCount: 5, positions: ["Hậu vệ", "Tiền phong"], level: "Trung bình", schedule: ["T3", "T5", "CN"], time: "18:00–20:00", fee: 50000, activityCount: 37, activityRate: 94, responseRate: 93, foundedMonths: 27, description: "Đội bóng rổ cộng đồng tổ chức tập luyện và scrimmage hàng tuần.", status: "Đang hoạt động", activityTitle: "Scrimmage tối Chủ nhật", venue: "Nhà thi đấu Thủ Đức" },
  { id: "club-06", name: "Pickleball Tây Hồ", sportType: "Pickleball", area: "Tây Hồ, Hà Nội", logo: "🏓", rating: 4.7, memberCount: 14, capacity: 20, recruitmentCount: 6, positions: ["Người mới", "Đánh đôi"], level: "Người mới", schedule: ["T3", "T6", "CN"], time: "17:30–19:30", fee: 70000, activityCount: 18, activityRate: 81, responseRate: 90, foundedMonths: 8, description: "CLB mới thành lập bên Hồ Tây, chào đón người muốn học và chơi đều đặn.", status: "Đang hoạt động", activityTitle: "Giao lưu bên Hồ Tây", venue: "Sân Pickleball Tây Hồ" },
  { id: "club-07", name: "Ping Pong Lab", sportType: "Bóng bàn", area: "Quận 10, TP.HCM", logo: "🏓", rating: 4.5, memberCount: 16, capacity: 18, recruitmentCount: 2, positions: ["Đánh đơn"], level: "Cơ bản", schedule: ["T2", "T4", "T7"], time: "19:00–21:00", fee: 40000, activityCount: 29, activityRate: 83, responseRate: 87, foundedMonths: 20, description: "Không gian rèn kỹ thuật bóng bàn, có nhóm ghép cặp theo trình độ.", status: "Đang hoạt động", activityTitle: "Giải nội bộ tháng", venue: "Nhà văn hóa Quận 10" },
  { id: "club-08", name: "Cầu Lông Phú Thọ", sportType: "Cầu lông", area: "Quận 11, TP.HCM", logo: "🏸", rating: 4.8, memberCount: 20, capacity: 20, recruitmentCount: 0, positions: [], level: "Trung bình", schedule: ["T2", "T4", "T6"], time: "19:30–21:30", fee: 55000, activityCount: 54, activityRate: 97, responseRate: 98, foundedMonths: 46, description: "CLB lâu năm với lịch tập ổn định, hiện đã đủ thành viên và nhận danh sách chờ.", status: "Đang hoạt động", activityTitle: "Buổi đánh nội bộ", venue: "Nhà thi đấu Phú Thọ" },
  { id: "club-09", name: "Hà Nội Strikers", sportType: "Bóng đá", area: "Nam Từ Liêm, Hà Nội", logo: "⚽", rating: 4.6, memberCount: 16, capacity: 22, recruitmentCount: 6, positions: ["Tiền vệ", "Tiền đạo"], level: "Cơ bản", schedule: ["T4", "T6", "CN"], time: "19:00–21:00", fee: 75000, activityCount: 24, activityRate: 79, responseRate: 86, foundedMonths: 16, description: "Đội bóng phong trào tập trung vào vận động vui khỏe và kết nối người chơi mới.", status: "Hoạt động không thường xuyên", activityTitle: "Trận giao hữu cuối tuần", venue: "Sân Mỹ Đình" },
  { id: "club-10", name: "Tennis Riverside", sportType: "Tennis", area: "Long Biên, Hà Nội", logo: "🎾", rating: 4.9, memberCount: 10, capacity: 14, recruitmentCount: 4, positions: ["Đánh đơn", "Đánh đôi"], level: "Nâng cao", schedule: ["T3", "T5", "T7"], time: "06:00–08:00", fee: 150000, activityCount: 45, activityRate: 95, responseRate: 94, foundedMonths: 38, description: "Nhóm tennis có lịch sớm, thường xuyên tổ chức các trận giao lưu liên CLB.", status: "Đang hoạt động", activityTitle: "Riverside Open", venue: "Cụm sân Riverside" },
  { id: "club-11", name: "Saigon Karate Dojo", sportType: "Võ thuật", area: "Tân Bình, TP.HCM", logo: "🥋", rating: 4.9, memberCount: 28, capacity: 36, recruitmentCount: 8, positions: ["Người mới", "Trung cấp"], level: "Người mới", schedule: ["T2", "T4", "T6"], time: "18:00–19:30", fee: 100000, activityCount: 48, activityRate: 96, responseRate: 97, foundedMonths: 62, description: "Lớp karate cộng đồng có lộ trình cho người mới và buổi tập nâng cao.", status: "Đang hoạt động", activityTitle: "Tập kỹ thuật căn bản", venue: "Dojo Tân Bình" },
  { id: "club-12", name: "Pickleball Bình Thạnh", sportType: "Pickleball", area: "Bình Thạnh, TP.HCM", logo: "🏓", rating: 4.4, memberCount: 9, capacity: 16, recruitmentCount: 7, positions: ["Người mới", "Đánh đôi"], level: "Cơ bản", schedule: ["T5", "T7", "CN"], time: "16:00–18:00", fee: 65000, activityCount: 11, activityRate: 68, responseRate: 79, foundedMonths: 5, description: "Nhóm nhỏ mới lập, đang tìm thêm thành viên để duy trì sân cuối tuần.", status: "Hoạt động không thường xuyên", activityTitle: "Buổi chơi thử miễn phí", venue: "Sân Bình Thạnh" },
  { id: "club-13", name: "Bóng Rổ Ba Đình", sportType: "Bóng rổ", area: "Ba Đình, Hà Nội", logo: "🏀", rating: 4.7, memberCount: 22, capacity: 26, recruitmentCount: 4, positions: ["Hậu vệ", "Trung phong"], level: "Trung bình", schedule: ["T3", "T5", "CN"], time: "19:00–21:00", fee: 0, activityCount: 33, activityRate: 89, responseRate: 90, foundedMonths: 24, description: "Cộng đồng bóng rổ mở, không thu phí thành viên và có trận chơi hàng tuần.", status: "Đang hoạt động", activityTitle: "Chơi bóng tối thứ Năm", venue: "Sân bóng rổ Ba Đình" },
  { id: "club-14", name: "Cầu Lông Cầu Giấy", sportType: "Cầu lông", area: "Cầu Giấy, Hà Nội", logo: "🏸", rating: 4.3, memberCount: 11, capacity: 18, recruitmentCount: 7, positions: ["Đánh đôi", "Người mới"], level: "Người mới", schedule: ["T3", "T5", "T7"], time: "20:00–22:00", fee: 45000, activityCount: 13, activityRate: 72, responseRate: 82, foundedMonths: 7, description: "Nhóm cầu lông thân thiện với người mới, ưu tiên ghép cặp cân bằng.", status: "Đang hoạt động", activityTitle: "Tập luyện và ghép đôi", venue: "Sân Cầu Giấy" },
  { id: "club-15", name: "Saigon Table Tennis", sportType: "Bóng bàn", area: "Quận 3, TP.HCM", logo: "🏓", rating: 4.2, memberCount: 8, capacity: 14, recruitmentCount: 6, positions: ["Đánh đơn", "Người mới"], level: "Cơ bản", schedule: ["T2", "T6", "CN"], time: "18:30–20:00", fee: 35000, activityCount: 8, activityRate: 61, responseRate: 74, foundedMonths: 3, description: "CLB mới mở, tổ chức buổi giao lưu nhẹ nhàng cho mọi trình độ.", status: "Hoạt động không thường xuyên", activityTitle: "Làm quen bóng bàn", venue: "Nhà văn hóa Quận 3" },
];

export const mockClubs: Club[] = seeds.map((seed, index) => ({
  ...seed,
  nextActivity: {
    title: seed.activityTitle,
    kind: index % 3 === 0 ? "Tập luyện" : index % 3 === 1 ? "Giao lưu" : "Trận đấu",
    date: index % 2 === 0 ? "Thứ Bảy, 04/10" : "Chủ Nhật, 05/10",
    time: seed.time,
    venue: seed.venue,
    joined: Math.min(seed.memberCount, 8 + (index % 7)),
    capacity: 12 + (index % 8),
  },
  members: Array.from({ length: Math.min(5, seed.memberCount) }, (_, memberIndex) =>
    memberNames[(index + memberIndex) % memberNames.length],
  ),
  achievements: {
    events: seed.activityCount,
    wins: Math.round(seed.activityCount * (0.38 + (index % 4) * 0.04)),
    draws: Math.round(seed.activityCount * 0.16),
    losses: Math.round(seed.activityCount * 0.26),
  },
}));

export const DEMO_PREFERENCES = {
  sport: "Cầu lông" as ClubSport,
  area: "Cầu Giấy, Hà Nội",
  level: "Cơ bản" as ClubLevel,
  availableDays: ["T7", "CN"],
};