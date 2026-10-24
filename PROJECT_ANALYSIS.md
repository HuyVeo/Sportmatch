# Báo Cáo Phân Tích Chi Tiết Dự Án SportMatch

---

## 1. Tổng quan dự án

- **Tên dự án**: **SportMatch**
- **Mục tiêu**: Nền tảng kết nối người chơi thể thao phong trào, tạo trận đấu, tìm sân bãi, ghép cặp (matchmaking), quản lý câu lạc bộ (CLB) và trò chuyện thời gian thực. Bắt đầu với **Cầu lông** và **Pickleball**, hiện đã hỗ trợ mở rộng thêm 12 môn thể thao khác (Bóng đá, Futsal, Tennis, Bóng bàn, Bóng chuyền, Bóng rổ, Golf, Bi-a, Bowling, Bơi lội, Boxing, Bóng ném).
- **Tech Stack cốt lõi**:
  - **Framework**: Next.js 16.3.5 (App Router, React 19.2.8, Server Components & Server Actions).
  - **Ngôn ngữ**: TypeScript 5.
  - **Styling**: Tailwind CSS v4, dark mode tự động qua `next-themes`, biểu tượng Lucide React, Radix UI & Shadcn.
  - **Database & ORM**: PostgreSQL (Supabase) + Prisma 7 (`@prisma/adapter-pg` với kết nối kép: connection pooler port `6543` cho runtime và direct port `5432` cho migrations/seeding).
  - **Xác thực (Auth)**: Auth.js v5 (NextAuth beta 32) với Credentials Provider, mã hóa mật khẩu `bcryptjs`, JWT session.
  - **Bản đồ & Vị trí**: Leaflet + `react-leaflet`, tích hợp trực tiếp OpenStreetMap Overpass API (tìm sân tự động) và Nominatim Reverse Geocoding.
  - **Realtime**: Supabase Broadcast API (phát event dạng HMAC SHA-256 an toàn, bảo vệ dữ liệu phía server).
  - **Quản lý gói**: `pnpm@12.4.2`.

---

## 2. Cây thư mục tổng quát

```text
d:/Sportmatch/
├── app/                  # Routing Next.js App Router, Pages, Layouts, APIs & Server Actions
│   ├── (marketing)/      # Landing page công khai
│   ├── (auth)/           # Đăng nhập & Đăng ký
│   ├── onboarding/       # Wizard thiết lập hồ sơ 5 bước
│   ├── (app)/            # Các trang chức năng chính sau đăng nhập
│   └── api/              # API Route Handlers (Auth, Profile Images, Media, Clubs)
├── components/           # UI Components phân chia theo Domain & Feature
│   ├── auth/             # Form đăng nhập, đăng ký, input password
│   ├── chat/             # Khung chat, danh sách hội thoại, avatar, listener realtime
│   ├── clubs/            # Thẻ CLB, trang chi tiết CLB, tạo CLB, khám phá CLB
│   ├── courts/           # Bảng sân bãi, bản đồ Leaflet OSM
│   ├── discover/         # Trải nghiệm khám phá, ghép đôi (matchmaking)
│   ├── layout/           # Header, Footer, Logo, Theme toggle
│   ├── matches/          # Bảng trận đấu, form tạo trận, nút thao tác trận
│   ├── onboarding/       # Wizard 5 bước chọn môn, trình độ, khu vực, avatar, lịch rảnh
│   ├── profile/          # Header hồ sơ, thẻ lịch rảnh, thẻ môn thể thao, crop ảnh
│   ├── ranking/          # Bảng xếp hạng người chơi
│   ├── ratings/          # Nút làm mới và giao diện đánh giá sau trận
│   ├── settings/         # Bảng cài đặt, sửa lịch rảnh, sửa môn thể thao
│   └── ui/               # Atomic components (button, dialog, dropdown, slider, toast, user-avatar)
├── lib/                  # Data Access Layer (DAL), Business Logic, Utils
│   ├── auth/             # Session DAL (getCurrentUser, requireUserId)
│   ├── clubs/            # Dữ liệu mẫu, database adapter, kiểm tra quyền truy cập CLB
│   ├── data/             # Query Prisma (users, matches, courts, court-sync, chat, notifications, sports)
│   ├── db/               # Mapper dịch Enum DB (tiếng Anh) ↔ Label UI (tiếng Việt)
│   ├── osm/              # OpenStreetMap Overpass query & reverse geocoding
│   ├── realtime/         # Phát tín hiệu Supabase Realtime Broadcast (HMAC SHA-256)
│   ├── storage/          # LocalDiskImageStorage lưu ảnh upload, kiểm tra magic bytes
│   ├── supabase/         # Khởi tạo Supabase client trình duyệt
│   ├── availability.ts   # Tiện ích quản lý khung giờ rảnh hằng tuần (0–1439 phút)
│   ├── format.ts         # Định dạng ngày giờ, tính tuổi, thời gian tương đối
│   ├── ranking.ts        # Công thức tính điểm xếp hạng và phân cấp Rank Tier
│   ├── prisma.ts         # Prisma Client với Connection Pooling & Lazy Proxy
│   └── types.ts          # Định nghĩa TypeScript Domain Types
├── prisma/               # Cơ sở dữ liệu Prisma
│   ├── migrations/       # 9 bản migration SQL theo dòng thời gian
│   ├── schema.prisma     # Định nghĩa 17 models cơ sở dữ liệu
│   ├── seed.ts           # Script nạp dữ liệu mẫu hoàn chỉnh
│   ├── seed-users.ts     # Trợ giúp nạp người dùng mẫu
│   └── extra-players.ts  # Danh sách người chơi bổ sung
├── .claude/              # Tài liệu kiến trúc và quy tắc dự án
│   ├── rules/            # 8 tệp tài liệu nghiệp vụ, mô hình dữ liệu, design system
│   ├── agents/           # Cấu hình AI subagents (code-reviewer, qa-tester, researcher)
│   └── skills/           # Skill phân tích tri thức mã nguồn graphify
├── auth.ts               # Cấu hình NextAuth v5
├── proxy.ts              # Optimistic cookie proxy chuyển hướng đăng nhập sớm
├── prisma7.config.ts     # Cấu hình Prisma 7 CLI & Direct URL
├── package.json          # Danh sách dependencies & scripts thực thi
└── tsconfig.json         # Cấu hình TypeScript compiler
```

---

## 3. Chi tiết từng thư mục & tệp tin

### 3.1. Thư mục `app/` — Routing & Giao diện người dùng

#### A. Nhóm Marketing
- [app/(marketing)/page.tsx](file:///d:/Sportmatch/app/(marketing)/page.tsx): Trang Landing page giới thiệu đầy đủ tính năng: Khám phá đối thủ thể thao, Tạo & tham gia trận đấu, Tra cứu sân bãi, Bảng xếp hạng và Tin nhắn realtime.

#### B. Nhóm Xác thực `app/(auth)/`
- [app/(auth)/layout.tsx](file:///d:/Sportmatch/app/(auth)/layout.tsx): Khung giao diện tập trung cho các biểu mẫu đăng nhập/đăng ký.
- [app/(auth)/actions.ts](file:///d:/Sportmatch/app/(auth)/actions.ts): Server Actions `loginAction` và `registerAction` (kiểm tra email trùng, băm mật khẩu qua `bcryptjs`).
- [app/(auth)/login/page.tsx](file:///d:/Sportmatch/app/(auth)/login/page.tsx): Màn hình đăng nhập email/mật khẩu.
- [app/(auth)/register/page.tsx](file:///d:/Sportmatch/app/(auth)/register/page.tsx): Màn hình đăng ký tài khoản mới.

#### C. Nhóm Khởi tạo `app/onboarding/`
- [app/onboarding/page.tsx](file:///d:/Sportmatch/app/onboarding/page.tsx): Wizard 5 bước bắt buộc cho người dùng mới đăng ký.
- [app/onboarding/actions.ts](file:///d:/Sportmatch/app/onboarding/actions.ts): `completeOnboardingAction` (lưu môn, trình độ, vị trí, ảnh, lịch rảnh) và `locateAreaAction` (đổi tọa độ GPS thành tên quận/thành phố).

#### D. Nhóm Ứng dụng chính `app/(app)/`
Dùng chung [app/(app)/layout.tsx](file:///d:/Sportmatch/app/(app)/layout.tsx) thiết lập `force-dynamic`, tích hợp [AppHeader](file:///d:/Sportmatch/components/layout/app-header.tsx), đếm thông báo/tin nhắn chưa đọc và kích hoạt [RealtimeListener](file:///d:/Sportmatch/components/chat/realtime-listener.tsx):

1. **Khám phá người chơi**:
   - [app/(app)/discover/page.tsx](file:///d:/Sportmatch/app/(app)/discover/page.tsx): Màn hình gợi ý đối thủ ghép cặp dựa trên khoảng cách địa lý (km), môn thể thao, trình độ và khung giờ rảnh trùng nhau.
2. **Trận đấu**:
   - [app/(app)/matches/page.tsx](file:///d:/Sportmatch/app/(app)/matches/page.tsx): Danh sách trận đấu kèm bộ lọc môn, trạng thái còn chỗ/đã đủ.
   - [app/(app)/matches/create/page.tsx](file:///d:/Sportmatch/app/(app)/matches/create/page.tsx): Form tạo trận đấu (chọn môn, chọn sân, chọn thời gian, trình độ yêu cầu, chế độ hiển thị).
   - [app/(app)/matches/[id]/page.tsx](file:///d:/Sportmatch/app/(app)/matches/[id]/page.tsx): Chi tiết trận đấu, danh sách người tham gia, chủ trận, quản lý duyệt yêu cầu gia nhập.
   - [app/(app)/matches/actions.ts](file:///d:/Sportmatch/app/(app)/matches/actions.ts): Server Actions tạo trận, xin tham gia, duyệt đơn, rời trận.
3. **Sân bãi**:
   - [app/(app)/courts/page.tsx](file:///d:/Sportmatch/app/(app)/courts/page.tsx): Tra cứu sân bãi với bản đồ tương tác Leaflet OpenStreetMap kết hợp danh sách sân theo bán kính.
4. **Câu lạc bộ (CLB)**:
   - [app/(app)/explore-clubs/page.tsx](file:///d:/Sportmatch/app/(app)/explore-clubs/page.tsx): Khám phá các CLB thể thao.
   - [app/(app)/clubs/[clubId]/page.tsx](file:///d:/Sportmatch/app/(app)/clubs/[clubId]/page.tsx): Hồ sơ chi tiết CLB, thành viên, duyệt đơn gia nhập và tích hợp kênh chat nội bộ CLB.
   - [app/(app)/clubs/create/page.tsx](file:///d:/Sportmatch/app/(app)/clubs/create/page.tsx): Giao diện tạo CLB thể thao mới.
5. **Tin nhắn**:
   - [app/(app)/chat/page.tsx](file:///d:/Sportmatch/app/(app)/chat/page.tsx): Hệ thống tin nhắn hợp nhất hỗ trợ cả chat cá nhân 1-1, chat nhóm trận đấu và chat CLB.
6. **Bảng xếp hạng**:
   - [app/(app)/ranking/page.tsx](file:///d:/Sportmatch/app/(app)/ranking/page.tsx): Bảng xếp hạng cộng đồng theo điểm số và phân hạng danh hiệu.
7. **Đánh giá**:
   - [app/(app)/ratings/page.tsx](file:///d:/Sportmatch/app/(app)/ratings/page.tsx): Giao diện chấm sao và nhận xét đồng đội sau trận đấu đã hoàn tất.
8. **Lịch sử**:
   - [app/(app)/history/page.tsx](file:///d:/Sportmatch/app/(app)/history/page.tsx): Thống kê tổng số trận, số trận đã hoàn tất, đang diễn ra và sao trung bình.
9. **Thông báo**:
   - [app/(app)/notifications/page.tsx](file:///d:/Sportmatch/app/(app)/notifications/page.tsx): Trung tâm thông báo lời mời, yêu cầu tham gia và đánh giá.
10. **Hồ sơ cá nhân**:
    - [app/(app)/profile/[userId]/page.tsx](file:///d:/Sportmatch/app/(app)/profile/[userId]/page.tsx): Trang hồ sơ người chơi chi tiết (avatar, ảnh bìa, uy tín, phân tích điểm xếp hạng, lịch rảnh).
11. **Cài đặt tài khoản**:
    - [app/(app)/settings/page.tsx](file:///d:/Sportmatch/app/(app)/settings/page.tsx): Chỉnh sửa thông tin cá nhân, avatar, ảnh bìa, môn thể thao ưa thích và lịch rảnh.
    - [app/(app)/settings/actions.ts](file:///d:/Sportmatch/app/(app)/settings/actions.ts): Server Actions lưu cài đặt người dùng.

#### E. Tuyến API `app/api/`
- [app/api/auth/[...nextauth]/route.ts](file:///d:/Sportmatch/app/api/auth/[...nextauth]/route.ts): Route handler của Auth.js.
- [app/api/profile/images/route.ts](file:///d:/Sportmatch/app/api/profile/images/route.ts): API POST/DELETE ảnh avatar và cover (bảo vệ CSRF, chặn file quá 5MB, kiểm tra magic bytes).
- [app/api/media/[...key]/route.ts](file:///d:/Sportmatch/app/api/media/[...key]/route.ts): Phục vụ file ảnh đã upload từ storage cục bộ, ngăn chặn path traversal.
- [app/api/clubs/route.ts](file:///d:/Sportmatch/app/api/clubs/route.ts) & [app/api/clubs/[clubId]/membership/route.ts](file:///d:/Sportmatch/app/api/clubs/[clubId]/membership/route.ts): API quản lý tạo và phê duyệt thành viên CLB.

---

### 3.2. Thư mục `components/` — UI Components

Mô-đun hóa cao theo từng tính năng nghiệp vụ:
- **`layout/`**: [app-header.tsx](file:///d:/Sportmatch/components/layout/app-header.tsx) (header sau đăng nhập), [site-header.tsx](file:///d:/Sportmatch/components/layout/site-header.tsx) (header landing), [site-footer.tsx](file:///d:/Sportmatch/components/layout/site-footer.tsx), [theme-toggle.tsx](file:///d:/Sportmatch/components/layout/theme-toggle.tsx).
- **`matches/`**: [matches-board.tsx](file:///d:/Sportmatch/components/matches/matches-board.tsx) (lưới danh sách trận), [create-match-form.tsx](file:///d:/Sportmatch/components/matches/create-match-form.tsx) (form tạo trận), [match-actions.tsx](file:///d:/Sportmatch/components/matches/match-actions.tsx) (các nút tương tác trận).
- **`courts/`**: [courts-board.tsx](file:///d:/Sportmatch/components/courts/courts-board.tsx) (bảng tra cứu sân), [courts-map.tsx](file:///d:/Sportmatch/components/courts/courts-map.tsx) (bản đồ Leaflet client-side).
- **`chat/`**: [chat-window.tsx](file:///d:/Sportmatch/components/chat/chat-window.tsx), [conversation-list.tsx](file:///d:/Sportmatch/components/chat/conversation-list.tsx), [realtime-listener.tsx](file:///d:/Sportmatch/components/chat/realtime-listener.tsx).
- **`clubs/`**: [club-card.tsx](file:///d:/Sportmatch/components/clubs/club-card.tsx), [club-profile-page.tsx](file:///d:/Sportmatch/components/clubs/club-profile-page.tsx), [explore-clubs-page.tsx](file:///d:/Sportmatch/components/clubs/explore-clubs-page.tsx).
- **`discover/`**: [discover-board.tsx](file:///d:/Sportmatch/components/discover/discover-board.tsx), [discover-experience.tsx](file:///d:/Sportmatch/components/discover/discover-experience.tsx).
- **`onboarding/`**: [onboarding-wizard.tsx](file:///d:/Sportmatch/components/onboarding/onboarding-wizard.tsx) (bộ wizard 5 bước).
- **`profile/`**: [profile-header.tsx](file:///d:/Sportmatch/components/profile/profile-header.tsx), [availability-card.tsx](file:///d:/Sportmatch/components/profile/availability-card.tsx), [sport-profile-card.tsx](file:///d:/Sportmatch/components/profile/sport-profile-card.tsx), [image-crop-dialog.tsx](file:///d:/Sportmatch/components/profile/image-crop-dialog.tsx).
- **`ranking/`**: [ranking-board.tsx](file:///d:/Sportmatch/components/ranking/ranking-board.tsx).
- **`settings/`**: [settings-panel.tsx](file:///d:/Sportmatch/components/settings/settings-panel.tsx), [availability-editor.tsx](file:///d:/Sportmatch/components/settings/availability-editor.tsx), [sport-profile-editor.tsx](file:///d:/Sportmatch/components/settings/sport-profile-editor.tsx).
- **`auth/`**: [login-form.tsx](file:///d:/Sportmatch/components/auth/login-form.tsx), [register-form.tsx](file:///d:/Sportmatch/components/auth/register-form.tsx), [password-input.tsx](file:///d:/Sportmatch/components/auth/password-input.tsx).
- **`ui/`**: Các thành phần giao diện nền tảng: [button.tsx](file:///d:/Sportmatch/components/ui/button.tsx), [dialog.tsx](file:///d:/Sportmatch/components/ui/dialog.tsx), [dropdown-menu.tsx](file:///d:/Sportmatch/components/ui/dropdown-menu.tsx), [slider.tsx](file:///d:/Sportmatch/components/ui/slider.tsx), [toast.tsx](file:///d:/Sportmatch/components/ui/toast.tsx), [user-avatar.tsx](file:///d:/Sportmatch/components/ui/user-avatar.tsx).

---

### 3.3. Thư mục `lib/` — Business Logic & Data Access Layer (DAL)

- **[lib/auth/session.ts](file:///d:/Sportmatch/lib/auth/session.ts)**: Nguồn xác thực duy nhất cho Server Components và Actions (`getCurrentUser`, `getSessionUserId`, `requireUserId`).
- **[lib/prisma.ts](file:///d:/Sportmatch/lib/prisma.ts)**: Khởi tạo Prisma Client lười (Lazy Proxy), cấu hình pool connection timeout tối ưu cho kết nối Supabase từ xa.
- **`lib/data/`**: Tầng truy vấn database:
  - [users.ts](file:///d:/Sportmatch/lib/data/users.ts): Truy vấn danh sách người dùng, tìm kiếm unaccent không dấu, cập nhật ảnh và hồ sơ.
  - [matches.ts](file:///d:/Sportmatch/lib/data/matches.ts): Toàn bộ xử lý trạng thái trận, quyền xem trận (`canViewMatch`), đếm người (`countJoined`).
  - [courts.ts](file:///d:/Sportmatch/lib/data/courts.ts) & [court-sync.ts](file:///d:/Sportmatch/lib/data/court-sync.ts): Quản lý sân và cache theo ô lưới `CourtSyncCell` (khoảng 11km) tránh gọi Overpass API liên tục.
  - [chat.ts](file:///d:/Sportmatch/lib/data/chat.ts): Tạo cuộc hội thoại, lưu tin nhắn, đếm tin chưa đọc.
  - [notifications.ts](file:///d:/Sportmatch/lib/data/notifications.ts): Đọc và đếm thông báo chưa đọc.
  - [sports.ts](file:///d:/Sportmatch/lib/data/sports.ts): Lấy danh mục các môn thể thao.
- **[lib/db/mappers.ts](file:///d:/Sportmatch/lib/db/mappers.ts)**: Cầu nối dịch hai chiều giữa Enum DB (`BEGINNER`, `PUBLIC`, `UPCOMING`...) và nhãn UI tiếng Việt (`Mới chơi`, `Công khai`, `Sắp diễn ra`...).
- **[lib/ranking.ts](file:///d:/Sportmatch/lib/ranking.ts)**: Công thức tính điểm xếp hạng:
  $$\text{Score} = (\text{Sao TB} \times 30) + (\text{Số trận} \times 1.5) + (\text{Uy tín} \times 0.4) + (\text{Votes} \times 2)$$
  Phân 5 hạng: *Tân binh (0)*, *Trung cấp (50)*, *Chuyên nghiệp (100)*, *Tinh anh (150)*, *Huyền thoại (200)*.
- **[lib/availability.ts](file:///d:/Sportmatch/lib/availability.ts)**: Xử lý lưu khung giờ rảnh hằng tuần bằng số phút từ 00:00 (0–1439), kiểm tra xung đột thời gian (`slotsOverlap`).
- **[lib/osm/overpass.ts](file:///d:/Sportmatch/lib/osm/overpass.ts)** & **[lib/osm/geocode.ts](file:///d:/Sportmatch/lib/osm/geocode.ts)**: Truy vấn OpenStreetMap Overpass với cơ chế fallback server khi quá tải, reverse geocode tọa độ ra địa chỉ.
- **[lib/realtime/broadcast.ts](file:///d:/Sportmatch/lib/realtime/broadcast.ts)**: Phát tín hiệu Supabase Broadcast HMAC an toàn tới người dùng liên quan.
- **[lib/storage/image-storage.ts](file:///d:/Sportmatch/lib/storage/image-storage.ts)**: Lớp trừu tượng `ImageStorage` (`LocalDiskImageStorage` lưu tại `storage/uploads`), kiểm tra định dạng ảnh qua magic bytes.
- **[lib/types.ts](file:///d:/Sportmatch/lib/types.ts)**: Định nghĩa toàn bộ hệ thống kiểu TypeScript dùng trong toàn dự án.

---

### 3.4. Thư mục `prisma/` — Cơ sở dữ liệu

- **[prisma/schema.prisma](file:///d:/Sportmatch/prisma/schema.prisma)**: Định nghĩa toàn bộ schema với 17 bảng:
  - `User`, `Account`, `Session`, `VerificationToken`: Xác thực tài khoản.
  - `Sport`, `UserSport`, `UserSportCourt`, `Availability`: Dữ liệu thể thao & ghép trận.
  - `Match`, `MatchParticipant`, `Rating`: Trận đấu và đánh giá sau trận.
  - `Court`, `CourtSport`, `CourtSyncCell`: Sân bãi và ô lưới đồng bộ OSM.
  - `Notification`, `ChatConversation`, `ConversationMember`, `ChatMessage`: Thông báo và chat đa năng.
  - `Club`, `ClubMembership`: Quản lý câu lạc bộ.
- **`prisma/migrations/`**: Chứa 9 bản migration SQL đã áp dụng hoàn chỉnh.
- **[prisma/seed.ts](file:///d:/Sportmatch/prisma/seed.ts)**: Nạp 14 môn thể thao, 5 sân bãi, 12+ người dùng mẫu, trận đấu và đánh giá mẫu.

---

### 3.5. Thư mục `.claude/` — Tài liệu & Quy chuẩn dự án

- **`rules/`**: Chứa 8 file tài liệu chi tiết:
  - [project-overview.md](file:///d:/Sportmatch/.claude/rules/project-overview.md): Bối cảnh và bảng đối chiếu ảnh màn hình gốc (`*.png`).
  - [tech-stack.md](file:///d:/Sportmatch/.claude/rules/tech-stack.md): Quy ước công nghệ và cấu trúc thư mục.
  - [design-system.md](file:///d:/Sportmatch/.claude/rules/design-system.md): Bảng màu, typography và dark mode.
  - [data-model.md](file:///d:/Sportmatch/.claude/rules/data-model.md): Mô tả chi tiết các trường và quan hệ DB.
  - [feature-auth-onboarding.md](file:///d:/Sportmatch/.claude/rules/feature-auth-onboarding.md): Quy chuẩn Auth & Onboarding.
  - [feature-discover-map-ranking.md](file:///d:/Sportmatch/.claude/rules/feature-discover-map-ranking.md): Quy chuẩn Khám phá & Xếp hạng.
  - [feature-matches-courts.md](file:///d:/Sportmatch/.claude/rules/feature-matches-courts.md): Quy chuẩn Trận đấu & Sân bãi.
  - [feature-account-social.md](file:///d:/Sportmatch/.claude/rules/feature-account-social.md): Quy chuẩn Hồ sơ, Chat, Thông báo, Lịch sử & Đánh giá.
- **`agents/`**: Cấu hình các agent chuyên trách: [code-reviewer.md](file:///d:/Sportmatch/.claude/agents/code-reviewer.md), [qa-tester.md](file:///d:/Sportmatch/.claude/agents/qa-tester.md), [researcher.md](file:///d:/Sportmatch/.claude/agents/researcher.md).
- **`skills/`**: Kỹ năng phân tích đồ thị mã nguồn `graphify`.

---

### 3.6. Các tệp cấu hình tại thư mục gốc

- **[auth.ts](file:///d:/Sportmatch/auth.ts)**: Thiết lập Auth.js v5 với Credentials Provider, bcryptjs và JWT callback.
- **[proxy.ts](file:///d:/Sportmatch/proxy.ts)**: Optimistic check cookie phiên để chuyển hướng sớm các route được bảo vệ.
- **[prisma7.config.ts](file:///d:/Sportmatch/prisma7.config.ts)**: Cấu hình Prisma 7, kết nối trực tiếp qua `DIRECT_URL`.
- **[package.json](file:///d:/Sportmatch/package.json)**: Scripts và dependencies của dự án.
- **[next.config.ts](file:///d:/Sportmatch/next.config.ts)** & **[tsconfig.json](file:///d:/Sportmatch/tsconfig.json)**: Cấu hình Next.js và TypeScript path alias `@/*`.

---

## 4. Các điểm kỹ thuật nổi bật

1. **Kiến trúc Data Access Layer (DAL) chuẩn mực**:
   Toàn bộ truy vấn dữ liệu được gom tại `lib/data/`, Server Components chỉ gọi hàm nghiệp vụ, không truy vấn Prisma trực tiếp tại tầng view.
2. **Khả năng mở rộng không giới hạn môn thể thao**:
   Các môn thể thao là các bản ghi động trong bảng `Sport`. Thêm môn mới chỉ cần thêm 1 dòng dữ liệu mà không cần sửa đổi mã nguồn.
3. **Bảo mật Realtime & Lưu trữ**:
   - Supabase Realtime Broadcast chỉ phát tín hiệu HMAC SHA-256 ẩn danh; trình duyệt nhận tín hiệu rồi mới fetch dữ liệu từ server SportMatch qua lớp phân quyền chặt chẽ.
   - Kiểm tra magic byte ảnh thực tế, chặn file giả mạo và chống tấn công path traversal khi phục vụ file tĩnh.
4. **Tối ưu hóa bản đồ & sân bãi**:
   Phân chia bản đồ thành các ô lưới `CourtSyncCell` để lưu trữ sân bãi từ OpenStreetMap, tránh nghẽn mạng và tránh bị rate limit từ Overpass API.
