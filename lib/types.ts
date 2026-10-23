export type Sport = {
  id: string;
  slug: string;
  name: string;
  icon: string;
};

/** Môn kèm khoảng "Số người cần" khi tạo trận. */
export type SportWithPlayers = Sport & {
  minPlayers: number;
  maxPlayers: number;
  defaultPlayers: number;
};

export const SKILL_LEVELS = ["Mới chơi", "Trung cấp", "Chuyên nghiệp"] as const;
export type SkillLevel = (typeof SKILL_LEVELS)[number];

export const WEEKDAYS = [
  "Thứ hai",
  "Thứ ba",
  "Thứ tư",
  "Thứ năm",
  "Thứ sáu",
  "Thứ bảy",
  "Chủ nhật",
] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const PLAY_PURPOSES = ["Giao lưu", "Luyện tập", "Thi đấu"] as const;
export type PlayPurpose = (typeof PLAY_PURPOSES)[number];

export type Gender = "Nam" | "Nữ" | "Khác";

export type FavoriteCourt = {
  id: string;
  name: string;
  area: string;
};

/** Hồ sơ thể thao theo từng môn — dữ liệu đầu vào cho matchmaking. */
export type UserSport = {
  sportId: string;
  skillLevel: SkillLevel;
  purposes: PlayPurpose[];
  /** Khu vực thường chơi, tên chuẩn trong `lib/areas.ts`. */
  preferredAreas: string[];
  favoriteCourts: FavoriteCourt[];
};

/** Một khung giờ rảnh hằng tuần; giờ tính bằng phút từ 00:00 (0–1439). */
export type AvailabilitySlot = {
  day: Weekday;
  startMinute: number;
  endMinute: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  /** Avatar emoji — fallback khi chưa upload ảnh đại diện. */
  avatar: string;
  /** URL ảnh đại diện đã upload (cột `User.image`). */
  avatarUrl: string | null;
  /** URL ảnh bìa hồ sơ (cột `User.coverImage`). */
  coverImageUrl: string | null;
  bio: string;
  area: string;
  lat: number;
  lng: number;
  gender: Gender;
  birthday: string;
  trustScore: number;
  isOnline: boolean;
  isPro: boolean;
  distanceKm: number;
  sports: UserSport[];
  /** Các ngày có ít nhất một khung giờ rảnh (dẫn xuất từ `availabilitySlots`). */
  availability: Weekday[];
  availabilitySlots: AvailabilitySlot[];
  matchCount: number;
  averageStars: number;
  ratingCount: number;
  communityVotes: number;
  createdAt: string;
};

export type MatchVisibility = "Công khai" | "Theo lời mời" | "Riêng tư";
export type MatchStatus = "Sắp diễn ra" | "Đang diễn ra" | "Đã hoàn tất";
export type SkillRequirement = SkillLevel | "Bất kỳ";

export type MatchParticipant = {
  userId: string;
  status: "invited" | "requested" | "joined" | "left";
};

/** Quan hệ của người đang xem với một trận. */
export type ViewerRole = "host" | "joined" | "invited" | "requested" | "none";

export type Match = {
  id: string;
  sportId: string;
  hostId: string;
  title: string;
  courtName: string;
  address: string;
  dateTime: string;
  maxPlayers: number;
  skillRequirement: SkillRequirement;
  visibility: MatchVisibility;
  description: string;
  status: MatchStatus;
  participants: MatchParticipant[];
};

export type Court = {
  id: string;
  name: string;
  area: string;
  address: string;
  sportIds: string[];
  pricePerHour: number;
  phone: string;
  isOpen: boolean;
  lat: number;
  lng: number;
  /** "sportmatch" = sân tự quản lý; "osm" = đồng bộ từ OpenStreetMap. */
  source: "sportmatch" | "osm";
  website: string | null;
  openingHours: string | null;
};

export type Rating = {
  id: string;
  fromUserId: string;
  toUserId: string;
  matchId: string;
  stars: number;
  comment: string;
  createdAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  type: "invite" | "join" | "rating" | "system";
  title: string;
  body: string;
  /** Trận liên quan (lời mời, yêu cầu tham gia...) để thông báo link tới. */
  matchId: string | null;
  readAt: string | null;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderImage: string | null;
  body: string;
  createdAt: string;
};

/** direct = chat riêng 2 người; match = nhóm trận; club = nhóm nội bộ CLB. */
export type ConversationKind = "direct" | "match" | "club";

export type ChatMember = {
  id: string;
  name: string;
  avatar: string;
  image: string | null;
  isOnline: boolean;
};

export type ChatConversation = {
  id: string;
  kind: ConversationKind;
  title: string;
  /** Emoji fallback (avatar người chơi, icon môn của trận, logo CLB). */
  avatar: string;
  image: string | null;
  /** Trang liên quan: hồ sơ người kia / chi tiết trận / trang CLB. */
  href: string;
  memberCount: number;
  /** Chat riêng: người còn lại trong hội thoại. */
  peer: ChatMember | null;
  lastMessage: {
    body: string;
    senderId: string;
    senderName: string;
    createdAt: string;
  } | null;
  lastMessageAt: string;
  unreadCount: number;
};

export type ChatConversationDetail = ChatConversation & {
  members: ChatMember[];
  /** Chat riêng: mốc đã đọc của người kia — để hiện "Đã xem". */
  peerLastReadAt: string | null;
};

export const WEEKDAY_SHORT: Record<Weekday, string> = {
  "Thứ hai": "T2",
  "Thứ ba": "T3",
  "Thứ tư": "T4",
  "Thứ năm": "T5",
  "Thứ sáu": "T6",
  "Thứ bảy": "T7",
  "Chủ nhật": "CN",
};
