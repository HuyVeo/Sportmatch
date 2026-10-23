---
paths:
  - "prisma/**/*"
  - "**/*.prisma"
  - "app/api/**/*"
  - "lib/db/**/*"
  - "server/**/*"
---

# Data model đề xuất

Thiết kế sao cho **Sport** là bảng mở rộng được (không hardcode "Cầu lông"/"Pickleball" rải rác trong code) để giai đoạn 2 thêm môn mới không cần sửa core.

- `User`: id, name, email, passwordHash, avatarUrl (cột `image`), coverImageUrl (cột `coverImage`), bio, location (địa danh + lat/lng), gender, birthday, trustScore, createdAt
- `UserSport`: userId, sportId, skillLevel (Mới chơi / Trung cấp / Chuyên nghiệp), purposes[] (`PlayPurpose`: Giao lưu / Luyện tập / Thi đấu), preferredAreas[] (tên khu vực chuẩn trong `lib/areas.ts`) — nguồn dữ liệu matchmaking, có index GIN cho 2 mảng
- `UserSportCourt`: userId, sportId, courtId — sân yêu thích theo từng môn, chỉ trỏ tới `Court` có sẵn
- `Sport`: id, name, icon, slug — mở rộng được, không giới hạn 2 môn
- `Availability`: id, userId, day, startMinute, endMinute — khung giờ rảnh hằng tuần, phút tính từ 00:00 (0–1439, CHECK end > start); một ngày nhiều khung. Giao nhau: `a.start < b.end && b.start < a.end`
- `Match`: id, sportId, hostId, courtName, address, dateTime, maxPlayers, skillRequirement, visibility (public / invite / private), description, status
- `MatchParticipant`: matchId, userId, status (invited / joined / left)
- `Court`: id, name, area, sportIds[], pricePerHour, phone, status, lat/lng
- `Rating`: fromUserId, toUserId, matchId, stars, comment
- `RankingScore`: giá trị tính toán (derived) theo công thức trong `feature-discover-map-ranking.md` — đánh giá×30 + trận×1.5 + uy tín×0.4 + cộng đồng×2
- `Notification`: userId, type, payload, readAt
- `ChatConversation` / `ChatMessage`: gắn theo `Match` (chat giữa chủ trận và người tham gia/team)

Trước khi migrate DB thật (chạy `prisma migrate`), xác nhận lại schema chi tiết với user nếu có thay đổi lớn so với phác thảo trên.
