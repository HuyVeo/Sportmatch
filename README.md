# SportMatch

Nền tảng tạo trận đấu thể thao và ghép cặp người chơi (Cầu lông, Pickleball — mở rộng thêm môn sau).

## Tech stack

| Lớp | Công nghệ |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4, dark mode mặc định (next-themes) |
| Database | PostgreSQL trên Supabase + Prisma 7 (driver adapter `@prisma/adapter-pg`) |
| Auth | Auth.js v5 (NextAuth) — Credentials email/mật khẩu, JWT session, bcrypt |
| Bản đồ | Leaflet + react-leaflet, tile OpenStreetMap |
| Package manager | pnpm |

## Cài đặt lần đầu

### 1. Cài dependencies

```bash
pnpm install
```

### 2. Tạo project Supabase và lấy connection string

Supabase Dashboard → **Project Settings → Database → Connection string**:

- **Transaction pooler** (port `6543`) → `DATABASE_URL`, nhớ thêm `?pgbouncer=true`
- **Session pooler / Direct connection** (port `5432`) → `DIRECT_URL`

App runtime chạy qua pooler; `prisma migrate` và `prisma db seed` cần kết nối trực tiếp.

### 3. Tạo file `.env`

Copy `.env.example` thành `.env` rồi điền giá trị thật:

```bash
cp .env.example .env
npx auth secret   # sinh AUTH_SECRET và ghi thẳng vào .env
```

### 4. Tạo bảng và nạp dữ liệu mẫu

```bash
pnpm db:deploy    # áp dụng prisma/migrations vào database
pnpm db:seed      # nạp 12 người dùng, 2 môn, 5 sân, trận đấu + đánh giá
```

Tài khoản đăng nhập thử sau khi seed (mọi user đều dùng chung mật khẩu):

```
Email:    manh.phan@sportmatch.vn
Mật khẩu: SportMatch123
```

### 5. Chạy dev server

```bash
pnpm dev
```

## Scripts

| Lệnh | Việc |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` / `pnpm start` | Build và chạy production |
| `pnpm lint` | ESLint |
| `pnpm db:generate` | Sinh lại Prisma Client (tự chạy sau `pnpm install`) |
| `pnpm db:migrate` | Tạo migration mới từ thay đổi schema (dev) |
| `pnpm db:deploy` | Áp dụng migration có sẵn (CI/production) |
| `pnpm db:seed` | Nạp dữ liệu mẫu (xoá sạch dữ liệu cũ trước) |
| `pnpm db:studio` | Prisma Studio |

## Cấu trúc

```
app/
  (marketing)/       Landing page
  (auth)/            Đăng nhập, đăng ký + server actions
  onboarding/        Wizard 5 bước
  (app)/             Các trang sau đăng nhập (dùng chung header)
  api/auth/          Route handler của Auth.js
auth.ts              Cấu hình Auth.js (Credentials + JWT)
proxy.ts             Kiểm tra lạc quan theo cookie để chuyển hướng sớm
components/          UI components theo tính năng
lib/
  auth/session.ts    DAL — nguồn xác thực thật cho server component
  data/              Truy vấn Prisma, trả về domain type trong lib/types.ts
  db/mappers.ts      Dịch enum DB (tiếng Anh) ↔ nhãn UI (tiếng Việt)
  generated/prisma/  Prisma Client sinh ra (gitignored)
prisma/
  schema.prisma      Schema
  migrations/        Migration SQL
  seed.ts            Dữ liệu mẫu
```

## Ghi chú kiến trúc

- **Xác thực**: `proxy.ts` chỉ kiểm tra sự tồn tại của cookie để redirect sớm (theo khuyến nghị của Next 16 — proxy không phải lớp phân quyền). Việc xác thực thật nằm ở `lib/auth/session.ts` và được gọi trong từng server component / server action.
- **Enum**: database lưu mã tiếng Anh (`BEGINNER`, `PUBLIC`...), UI hiển thị tiếng Việt theo ảnh gốc. `lib/db/mappers.ts` là nơi duy nhất dịch qua lại.
- **Điểm xếp hạng**: `matchCount`, `averageStars`, `ratingCount` là giá trị dẫn xuất — tính từ bảng `Rating` và `MatchParticipant`, không lưu cột riêng. Công thức điểm nằm ở `lib/ranking.ts`.
- **Mở rộng môn thể thao**: thêm một row vào bảng `Sport` là đủ — không có chỗ nào hardcode "Cầu lông"/"Pickleball" trong logic.
