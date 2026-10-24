# SportMatch 🏅

> **Nền tảng kết nối thể thao & ghép trận thông minh đa môn**  
> Dễ dàng tìm đồng đội, đặt sân, tham gia câu lạc bộ, trao đổi thời gian thực và xây dựng hồ sơ uy tín với tính năng đánh giá người chơi sau trận.

---

## 🌟 Điểm nổi bật & Tính năng chính

### 1. 🔍 Khám phá & Ghép trận thông minh (Smart Matchmaking)
- **Thuật toán ghép cặp thông minh**: Phân tích sự tương đồng theo môn thể thao, trình độ kỹ năng (`Mới chơi`, `Trung cấp`, `Chuyên nghiệp`), mục đích chơi (`Giao lưu`, `Luyện tập`, `Thi đấu`), và khoảng cách địa lý (tính theo tọa độ GPS/quận huyện).
- **Bộ lọc mạnh mẽ**: Tìm kiếm đối thủ/đồng đội theo khu vực, thời gian rảnh, môn thể thao yêu thích.

### 2. 🏸 Tạo & Quản lý trận đấu (Matches Management)
- **Tạo trận linh hoạt**: Hỗ trợ 14+ môn thể thao, thiết lập số lượng người, sân bãi, thời gian, trình độ yêu cầu và quyền hiển thị (`Công khai`, `Theo lời mời`, `Riêng tư`).
- **Quy trình tham gia minh bạch**: Xin vào trận, duyệt/từ chối yêu cầu, nhận lời mời, rút yêu cầu hoặc rời trận.
- **Hoàn thành trận đấu**: Chủ trận có quyền xác nhận kết thúc trận đấu (`COMPLETED`), kích hoạt quy trình đánh giá đồng đội.

### 3. ⭐ Đánh giá sau trận & Social Proof Profile *(Tính năng mới)*
- **Quy trình khép kín**: Trận đấu hoàn thành → Hệ thống tự động gửi thông báo yêu cầu đánh giá đến tất cả người tham gia → Chấm sao & viết nhận xét → Cập nhật Social Proof trên hồ sơ.
- **Thang điểm chuẩn 1–5 sao**: Kèm ô nhận xét ngắn (tối đa 500 ký tự) và thông báo trực tiếp đến người được đánh giá.
- **Bảo toàn dữ liệu & Chống spam**: Chỉ người thực sự tham gia trận mới được đánh giá; mỗi người chỉ đánh giá đồng đội 1 lần trong cùng một trận.
- **Social Proof trên Profile**: Hiển thị điểm trung bình (⭐ 4.8/5), tổng số lượt đánh giá, số trận đã chơi và các trích dẫn nhận xét thực tế (*“Đúng giờ, đánh rất fair-play”*, *“Trình độ phù hợp, giao tiếp tốt”*).

### 4. 💬 Tin nhắn & Chat thời gian thực (Chat & Messaging)
- **Đa dạng hình thức hội thoại**:
  - **Chat trực tiếp 1-on-1**: Nhắn tin trao đổi riêng với bất kỳ người chơi nào ngay từ trang hồ sơ của họ.
  - **Chat nhóm trận đấu**: Tự động tạo nhóm chat cho tất cả thành viên trong trận.
  - **Chat câu lạc bộ**: Phòng sinh hoạt chung dành riêng cho ban quản trị và thành viên chính thức của CLB.
- **Thời gian thực**: Tích hợp **Supabase Realtime Broadcast** giúp tin nhắn đến tức thì không cần tải lại trang.

### 5. 👥 Câu lạc bộ thể thao (Clubs)
- Khám phá các câu lạc bộ thể thao theo từng môn và khu vực.
- Tạo câu lạc bộ mới, quản lý thành viên, xét duyệt đơn xin gia nhập (`PENDING` → `APPROVED` / `REJECTED`).
- Bảng tin hoạt động và lịch sinh hoạt của câu lạc bộ.

### 6. 🏟️ Sân bãi & Đồng bộ OpenStreetMap (Courts & OSM Sync)
- Danh mục sân bãi chi tiết: địa chỉ, giá thuê theo giờ, số điện thoại liên hệ, giờ mở cửa.
- Bản đồ tương tác trực quan với **Leaflet & OpenStreetMap**.
- Cơ chế đồng bộ thông minh theo ô lưới địa lý (~11 km) từ Overpass API, lưu cache cục bộ để tăng tốc độ tải trang.

### 7. 🏆 Bảng xếp hạng & Điểm uy tín (Ranking & Trust Score)
- Hệ thống phân hạng minh bạch: Hạng Đồng, Bạc, Vàng, Bạch kim, Kim cương, Huyền thoại.
- Công thức tính điểm tổng hợp (`lib/ranking.ts`):
  $$\text{Tổng điểm} = (\text{Sao TB} \times 30) + (\text{Số trận} \times 1.5) + (\text{Điểm uy tín} \times 0.4) + (\text{Vote cộng đồng} \times 2)$$

### 8. 🔔 Thông báo & Hồ sơ cá nhân (Notifications & Profile)
- Trung tâm thông báo: Nhận tin nhắn mời trận, duyệt tham gia, nhắc nhở đánh giá sau trận, đánh dấu đã đọc.
- Hồ sơ chi tiết: Quản lý lịch rảnh hàng tuần theo từng khung giờ, tải ảnh đại diện & ảnh bìa với công cụ cắt ảnh (crop) trực quan.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

| Thành phần | Công nghệ | Chi tiết |
|---|---|---|
| **Framework** | Next.js 16.3 (App Router) | React 19, Turbopack, Server Actions, Server Components |
| **Ngôn ngữ** | TypeScript 5 | Strict mode, an toàn kiểu dữ liệu 100% |
| **Giao diện & CSS** | Tailwind CSS v4 | Dark mode mặc định qua `next-themes`, Lucide Icons |
| **Cơ sở dữ liệu** | PostgreSQL (Supabase) | Lưu trữ quan hệ, Index tối ưu hóa truy vấn |
| **ORM** | Prisma 7.10 | Driver adapter `@prisma/adapter-pg`, Prisma Client |
| **Xác thực (Auth)** | Auth.js v5 (NextAuth) | Credentials (Email/Password), Bcrypt hashing, JWT Session |
| **Bản đồ** | Leaflet + React-Leaflet | OpenStreetMap tiles, định vị GPS, Geocoding |
| **Realtime** | Supabase Realtime | Broadcast channel cho hệ thống Chat |
| **Package Manager** | pnpm | Quản lý gói nhanh và tiết kiệm dung lượng |

---

## 📁 Cấu trúc thư mục (Architecture Overview)

```
Sportmatch/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Trang chủ giới thiệu (Landing page)
│   ├── (auth)/                   # Đăng nhập (/login), Đăng ký (/register)
│   ├── (app)/                    # Toàn bộ trang nghiệp vụ chính (dùng AppHeader chung)
│   │   ├── discover/             # Khám phá & ghép trận thông minh
│   │   ├── matches/              # Danh sách trận, chi tiết trận, tạo trận
│   │   ├── ratings/              # Đánh giá & nhận xét đồng đội sau trận
│   │   ├── profile/[userId]/     # Hồ sơ người chơi & Social proof reviews
│   │   ├── clubs/                # Câu lạc bộ thể thao & quản lý thành viên
│   │   ├── chat/                 # Trò chuyện 1-on-1, nhóm trận, nhóm CLB
│   │   ├── courts/               # Sân bãi thể thao & bản đồ OpenStreetMap
│   │   ├── ranking/              # Bảng xếp hạng người chơi
│   │   ├── notifications/        # Trung tâm thông báo
│   │   ├── history/              # Lịch sử các trận đấu đã tham gia
│   │   └── settings/             # Cài đặt tài khoản & đổi mật khẩu
│   ├── onboarding/               # Wizard 5 bước thiết lập hồ sơ người mới
│   ├── api/                      # Route handlers (Auth, Upload media, Clubs)
│   ├── layout.tsx                # Root layout (Theme provider, Toast)
│   └── globals.css               # Design system tokens & CSS utilities
├── components/                   # React Components phân theo module
│   ├── auth/                     # Form đăng nhập, đăng ký
│   ├── chat/                     # Cửa sổ chat, danh sách hội thoại, realtime listener
│   ├── clubs/                    # Thẻ CLB, hồ sơ CLB, lọc CLB
│   ├── courts/                   # Bảng sân bãi, bản đồ Leaflet
│   ├── discover/                 # Thẻ người chơi, matchmaking cards
│   ├── matches/                  # Form tạo trận, hành động trận (tham gia/hoàn thành)
│   ├── notifications/            # Danh sách thông báo, nút đánh dấu đã đọc
│   ├── profile/                  # Header hồ sơ, lịch rảnh, UserReviewsCard
│   ├── ranking/                  # Bảng xếp hạng và thanh tiến trình điểm
│   ├── ratings/                  # RateableMatchItem, modal chấm sao & nhận xét
│   ├── settings/                 # Bảng chỉnh sửa thông tin & môn thể thao
│   └── ui/                       # UI primitives (Button, Dialog, Toast, Avatar, Slider)
├── lib/                          # Core Data Access Layer & Business Logic
│   ├── auth/session.ts           # DAL xác thực người dùng trong Server Components
│   ├── data/                     # Các hàm truy vấn Prisma chuyên biệt
│   │   ├── matches.ts            # Tạo trận, tham gia, hoàn thành trận đấu
│   │   ├── ratings.ts            # Lấy trận cần đánh giá, trích xuất nhận xét Profile
│   │   ├── users.ts              # Thông tin người chơi, xếp hạng, cập nhật hồ sơ
│   │   ├── courts.ts             # Truy vấn sân bãi theo môn và vị trí
│   │   ├── court-sync.ts         # Đồng bộ sân từ OpenStreetMap (Overpass API)
│   │   ├── chat.ts               # Tạo hội thoại, gửi tin nhắn, đếm tin chưa đọc
│   │   ├── notifications.ts      # Tạo và cập nhật thông báo
│   │   └── sports.ts             # Danh sách các môn thể thao hỗ trợ
│   ├── db/mappers.ts             # Chuyển đổi hai chiều Enum Database ↔ Nhãn Tiếng Việt
│   ├── prisma.ts                 # Prisma Client singleton kèm pooling config
│   ├── ranking.ts                # Thuật toán tính điểm xếp hạng & phân hạng
│   ├── types.ts                  # Toàn bộ kiểu dữ liệu Domain của hệ thống
│   └── utils.ts                  # Hàm tiện ích cn (clsx + tailwind-merge)
├── prisma/                       # Database Schema & Migrations
│   ├── schema.prisma             # Định nghĩa cấu trúc dữ liệu PostgreSQL
│   ├── migrations/               # Lịch sử các bản migration SQL
│   ├── seed.ts                   # Kịch bản nạp dữ liệu mẫu ban đầu
│   ├── seed-clubs.ts             # Kịch bản nạp dữ liệu câu lạc bộ mẫu
│   └── add-players.ts            # Kịch bản bổ sung người chơi demo
├── proxy.ts                      # Middleware chuyển hướng lạc quan theo session
├── prisma7.config.ts             # Cấu hình Prisma 7 CLI & Direct URL
└── package.json                  # Scripts và danh sách thư viện phụ thuộc
```

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### 1. Yêu cầu môi trường
- **Node.js**: Phiên bản 20.x trở lên
- **pnpm**: Phiên bản 9.x hoặc mới hơn (`npm install -g pnpm`)
- **Tài khoản Supabase** (hoặc cơ sở dữ liệu PostgreSQL bất kỳ)

### 2. Cài đặt thư viện
```bash
pnpm install
```

### 3. Cấu hình biến môi trường (`.env`)
Tạo file `.env` tại thư mục gốc dựa theo `.env.example`:
```bash
cp .env.example .env
```

Điền các thông số kết nối vào `.env`:
```env
# Kết nối PostgreSQL qua Transaction Pooler (port 6543) - Dành cho ứng dụng chạy
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Kết nối PostgreSQL trực tiếp (port 5432) - Dành cho migrate & seed
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# NextAuth v5 Secret
AUTH_SECRET="your-generated-secret-key"

# Supabase Public Keys (Dành cho Realtime & Storage)
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
```
*(Mẹo: Bạn có thể tạo nhanh secret ngẫu nhiên bằng lệnh `npx auth secret`).*

### 4. Triển khai cơ sở dữ liệu & Nạp dữ liệu mẫu
```bash
# Áp dụng tất cả các migration vào database
pnpm db:deploy

# Nạp dữ liệu mẫu (14+ môn thể thao, người dùng, sân bãi, trận đấu & đánh giá)
pnpm db:seed

# (Tùy chọn) Nạp thêm câu lạc bộ thể thao mẫu
pnpm dlx tsx prisma/seed-clubs.ts
```

### 5. Khởi chạy máy chủ phát triển (Dev Server)
```bash
pnpm dev
```
Mở trình duyệt và truy cập: [http://localhost:3000](http://localhost:3000).

---

## 🔑 Tài khoản thử nghiệm (Demo Accounts)

Tất cả tài khoản demo sau khi seed đều dùng chung mật khẩu: `SportMatch123`

| Email | Tên hiển thị | Vai trò / Đặc điểm |
|---|---|---|
| `manh.phan@sportmatch.vn` | Manh Phan Trong | Chủ trận cầu lông & pickleball |
| `thuha@example.com` | Nguyễn Thu Hà | Trình độ Chuyên nghiệp (32 đánh giá, 18 trận) |
| `duchuy@example.com` | Trần Đức Huy | Thành viên năng động khu vực Cầu Giấy |
| `vannam@example.com` | Trịnh Văn Nam | Người chơi giao lưu bóng đá & futsal |

---

## 📋 Danh sách lệnh hữu ích (CLI Scripts)

| Lệnh | Mô tả |
|---|---|
| `pnpm dev` | Chạy dev server tại cổng 3000 |
| `pnpm build` | Kiểm tra kiểu và tạo bản dựng production |
| `pnpm start` | Chạy ứng dụng từ bản dựng production |
| `pnpm lint` | Quét kiểm tra lỗi cú pháp bằng ESLint |
| `pnpm tsc --noEmit` | Kiểm tra an toàn kiểu dữ liệu TypeScript |
| `pnpm db:generate` | Tạo lại Prisma Client (`lib/generated/prisma`) |
| `pnpm db:migrate` | Tạo migration mới khi thay đổi `schema.prisma` |
| `pnpm db:deploy` | Chạy các migration chưa áp dụng lên database |
| `pnpm db:seed` | Nạp lại bộ dữ liệu mẫu |
| `pnpm db:studio` | Mở giao diện trực quan quản lý dữ liệu Prisma Studio |

---

## 💡 Hướng dẫn mở rộng hệ thống (Extensibility Guide)

1. **Thêm môn thể thao mới**:
   - Hệ thống được thiết kế mở rộng hoàn toàn theo dữ liệu (`data-driven`).
   - Để thêm môn thể thao mới (ví dụ: *Bóng chày*), bạn chỉ cần thêm một bản ghi vào bảng `Sport` trong cơ sở dữ liệu (hoặc qua `prisma/seed.ts`).
   - Mọi dropdown, bộ lọc, icon và quy trình tạo trận sẽ tự động cập nhật mà không cần sửa code logic.

2. **Mở rộng quy tắc tính điểm & xếp hạng**:
   - Mở file `lib/ranking.ts` để tùy chỉnh trọng số của sao đánh giá, số trận hay điểm cộng đồng.
   - Thêm các mốc xếp hạng hoặc danh hiệu mới tại `RANK_TIERS`.

3. **Tùy biến lưu trữ hình ảnh**:
   - Mặc định hệ thống hỗ trợ cả `LocalDiskImageStorage` (chạy offline trên ổ đĩa) và `SupabaseStorage` (lưu trữ trên cloud bucket).
   - Được cấu hình độc lập tại `lib/storage/image-storage.ts`.

---

## 📄 Bản quyền & Đóng góp
Dự án được phát triển theo tiêu chuẩn mã nguồn sạch, kiến trúc module hóa cao và sẵn sàng đưa vào vận hành thực tế.
Mọi đóng góp, báo lỗi xin vui lòng tạo Issue hoặc Pull Request trên repository.
