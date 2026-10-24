# Hướng Dẫn Cài Đặt, Cấu Hình Và Chạy Dự Án SportMatch Từ Đầu

Tài liệu này hướng dẫn chi tiết từng bước từ một máy tính mới hoặc thư mục dự án mới, cách kết nối cơ sở dữ liệu PostgreSQL (Supabase / Local), cấu hình tệp `.env`, nạp dữ liệu mẫu và khởi chạy toàn bộ hệ thống.

---

## 1. Yêu Cầu Môi Trường Tiên Quyết (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo máy tính đã cài đặt:

1. **Node.js**: Phiên bản `>= 20.x` (khuyên dùng Node.js 20 hoặc 22 LTS).
   - Kiểm tra bằng lệnh: `node -v`
2. **Package Manager (pnpm)**: Dự án dùng `pnpm@12.4.2`.
   - Nếu chưa có, cài đặt nhanh bằng lệnh:
     ```bash
     npm install -g pnpm
     ```
   - Kiểm tra: `pnpm -v`
3. **Git**: Kiểm tra bằng `git --version`.
4. **Python & uv (Tùy chọn - Dành cho mô hình Graphify)**:
   - Nếu bạn muốn trích xuất đồ thị tri thức mã nguồn: `uv --version`.

---

## 2. Cài Đặt Dependencies Từ Đầu

Mở Terminal (PowerShell hoặc Command Prompt) tại thư mục gốc của dự án `d:\Sportmatch`:

```powershell
# Di chuyển vào thư mục dự án (nếu chưa đứng tại đây)
cd d:\Sportmatch

# 1. Cài đặt toàn bộ thư viện
pnpm install

# 2. Nếu pnpm thông báo cảnh báo về build scripts (ERR_PNPM_IGNORED_BUILDS), chạy lệnh:
pnpm approve-builds --all

# 3. Biên dịch Prisma Client cho TypeScript:
pnpm db:generate
```

---

## 3. Cách Thức Kết Nối Cơ Sở Dữ Liệu PostgreSQL

SportMatch sử dụng PostgreSQL qua Prisma 7 với driver adapter `@prisma/adapter-pg`.

### Cách 1: Sử dụng Supabase (Khuyên dùng - Đúng kiến trúc dự án)

Supabase cung cấp cơ sở dữ liệu PostgreSQL miễn phí, có sẵn kết nối connection pooler và Realtime broadcast cho tính năng chat.

1. **Đăng ký / Đăng nhập Supabase**: Truy cập [https://supabase.com](https://supabase.com) và tạo một Project mới.
2. **Lấy Connection String của Database**:
   - Vào **Project Settings** → **Database** → kéo xuống mục **Connection string**.
   - Chọn chế độ hiển thị: **URI**.
   - Bạn sẽ cần 2 chuỗi kết nối:
     - **Transaction Pooler (Port 6543)**: Dùng cho app chạy thực tế (`DATABASE_URL`). 
       *Lưu ý quan trọng:* Cuối chuỗi bắt buộc phải thêm `?pgbouncer=true`.
       *Ví dụ:* `postgresql://postgres.xxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
     - **Session Pooler / Direct Connection (Port 5432)**: Dùng để chạy migration và seed dữ liệu (`DIRECT_URL`).
       *Ví dụ:* `postgresql://postgres.xxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`
3. **Lấy API Keys cho tính năng Chat Realtime**:
   - Vào **Project Settings** → **Data API** (hoặc **API Keys**):
     - **Project URL**: Ví dụ `https://xyzcompany.supabase.co`
     - **anon / public key**: Chuỗi khóa công khai bắt đầu bằng `eyJ...` hoặc `sb_publishable_...`
     - **service_role key**: Chuỗi khóa bí mật dùng cho server phát broadcast.
   - Vào mục **Realtime** → **Settings**: Bật tùy chọn **"Allow public access"**.

---

### Cách 2: Sử dụng PostgreSQL Cục Bộ (Localhost / Docker)

Nếu bạn muốn chạy PostgreSQL hoàn toàn offline trên máy tính:

1. Chạy PostgreSQL qua Docker:
   ```bash
   docker run --name sportmatch-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=sportmatch -p 5432:5432 -d postgres:16
   ```
2. Khi dùng PostgreSQL cục bộ, bạn có thể trỏ cả `DATABASE_URL` và `DIRECT_URL` vào cùng một kết nối port 5432:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sportmatch"
   DIRECT_URL="postgresql://postgres:postgres@localhost:5432/sportmatch"
   ```

---

## 4. Các Bước Cấu Hình Tệp Môi Trường `.env`

Tạo tệp `.env` tại thư mục gốc `d:\Sportmatch\.env` (nếu chưa có, sao chép từ `.env.example`):

```bash
# Lệnh copy file mẫu
cp .env.example .env
```

Điền đầy đủ các thông số vào tệp `.env` theo mẫu sau:

```env
# ================================================================
# 1. Supabase Realtime (Dành cho tính năng Chat thời gian thực)
# ================================================================
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-publishable-key"
SUPABASE_SECRET_KEY="your-service-role-secret-key"

# ================================================================
# 2. PostgreSQL Database Connection
# ================================================================
# DATABASE_URL: Cổng 6543 (Pooler) kèm ?pgbouncer=true (Dành cho app runtime)
DATABASE_URL="postgresql://postgres.your-ref:YourPassword@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# DIRECT_URL: Cổng 5432 (Direct) (Dành cho prisma migrate & db:seed)
DIRECT_URL="postgresql://postgres.your-ref:YourPassword@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# ================================================================
# 3. Auth.js (NextAuth v5)
# ================================================================
# Khóa bí mật dùng để mã hóa JWT Session (chuỗi ngẫu nhiên từ 32 ký tự trở lên)
AUTH_SECRET="e3e4559f5fe0434695485b9e6f98ee4b6f7af893f67a447da406ff450b9de574"

# URL gốc của website khi chạy dev
AUTH_URL="http://localhost:3000"

# ================================================================
# 4. Lưu trữ ảnh tải lên (Local Storage)
# ================================================================
# Bỏ trống thì hệ thống mặc định lưu vào thư mục ./storage/uploads
# UPLOAD_DIR=""
```

> 💡 **Cách tạo nhanh mã `AUTH_SECRET` mới bất kỳ lúc nào:**
> Trong PowerShell:
> ```powershell
> [System.Guid]::NewGuid().ToString("N") + [System.Guid]::NewGuid().ToString("N")
> ```

---

## 5. Khởi Tạo Cơ Sở Dữ Liệu & Nạp Dữ Liệu Mẫu (Seed Data)

Sau khi đã điền đúng `DATABASE_URL` và `DIRECT_URL` trong `.env`:

### Bước 1: Đẩy cấu trúc bảng (Migrations) vào Database
```bash
pnpm db:deploy
```
*Lệnh này sẽ áp dụng toàn bộ 9 bản migration SQL (tạo 17 bảng: users, sports, matches, courts, chat...) vào PostgreSQL.*

### Bước 2: Nạp dữ liệu mẫu ban đầu (Seeding)
```bash
pnpm db:seed
```
*Lệnh này sẽ tự động nạp:*
- 14 môn thể thao (Cầu lông, Pickleball, Bóng đá, Tennis, Bóng rổ, Bóng bàn...).
- 5 sân thi đấu mẫu tại Hà Nội.
- 12+ tài khoản người dùng mẫu với các trình độ, khu vực và lịch rảnh khác nhau.
- Các trận đấu mẫu (sắp diễn ra, đã hoàn tất) kèm đánh giá sao.

**Tài khoản đăng nhập thử nghiệm:**
- **Email**: `manh.phan@sportmatch.vn`
- **Mật khẩu**: `SportMatch123`
*(Mọi tài khoản mẫu đều dùng chung mật khẩu `SportMatch123`)*

---

## 6. Khởi Chạy Ứng Dụng (Terminal Commands)

### Chế độ Phát Triển (Development Mode - Khuyên dùng)

Khởi động Next.js với Turbopack cực nhanh:

```bash
pnpm dev
```

Sau khi terminal hiển thị:
```text
▲ Next.js 16.3.5 (Turbopack)
- Local:         http://localhost:3000
- Environments:  .env
✓ Ready in 373ms
```
Hãy mở trình duyệt và truy cập: **[http://localhost:3000](http://localhost:3000)**

---

### Chế độ Sản Xuất (Production Build & Start)

Khi muốn kiểm tra hiệu năng hoặc triển khai lên máy chủ thật:

```bash
# 1. Build bundle tối ưu
pnpm build

# 2. Khởi chạy máy chủ sản xuất
pnpm start
```

---

### Mở Giao Diện Quản Trị Cơ Sở Dữ Liệu Trực Quan (Prisma Studio)

Để xem, tìm kiếm, sửa hoặc xóa dữ liệu trong database qua giao diện web:

```bash
pnpm db:studio
```
Truy cập: **[http://localhost:5555](http://localhost:5555)**

---

## 7. Chạy Mô Hình Đồ Thị Tri Thức Mã Nguồn (Graphify) Trên Ổ D

Nếu bạn muốn tạo lại cây đồ thị kiến trúc tri thức toàn bộ mã nguồn của dự án (đã cô lập trong ổ `D:`):

```powershell
# 1. Kích hoạt môi trường ảo Python đã tạo sẵn tại ổ D:
.\.venv\Scripts\Activate.ps1

# 2. Cố định cache của uv trong ổ D:
$env:UV_CACHE_DIR = "d:\Sportmatch\.uv-cache"

# 3. Cập nhật đồ thị khi có thay đổi mã nguồn:
.\.venv\Scripts\python.exe -m graphify.cli update .

# 4. Mở xem đồ thị mạng trực quan trên trình duyệt:
# Mở trực tiếp tệp: d:\Sportmatch\graphify-out\graph.html
```

---

## 8. Bảng Tổng Hợp Các Lệnh Terminal Thường Dùng

| Lệnh | Ý nghĩa |
|---|---|
| `pnpm install` | Cài đặt toàn bộ thư viện dependencies |
| `pnpm approve-builds --all` | Cho phép chạy build scripts của Prisma và esbuild |
| `pnpm db:generate` | Tạo lại Prisma Client TypeScript |
| `pnpm db:deploy` | Áp dụng toàn bộ migration vào PostgreSQL |
| `pnpm db:seed` | Nạp dữ liệu mẫu ban đầu |
| `pnpm db:studio` | Mở giao diện web quản lý Database (cổng 5555) |
| `pnpm dev` | Chạy dev server tại `http://localhost:3000` |
| `pnpm build` | Đóng gói sản phẩm sản xuất |
| `pnpm start` | Chạy sản phẩm đã build |
| `pnpm lint` | Kiểm tra lỗi cú pháp code qua ESLint |

---

## 9. Xử Lý Các Sự Cố Thường Gặp (Troubleshooting)

1. **Lỗi: `The term 'pnpm' is not recognized`**
   - *Khắc phục:* Chạy `npm install -g pnpm` để cài đặt pnpm toàn cục.
2. **Lỗi: `Ignored build scripts: better-sqlite3...`**
   - *Khắc phục:* Chạy `pnpm approve-builds --all`.
3. **Lỗi: `Thiếu biến môi trường DATABASE_URL`**
   - *Khắc phục:* Kiểm tra tệp `.env` đã được tạo ở thư mục gốc `d:\Sportmatch\.env` và có biến `DATABASE_URL` hay chưa.
4. **Lỗi Supabase: `Tenant or user not found` hoặc kết nối Database bị treo**
   - *Khắc phục:* Đảm bảo `DATABASE_URL` có thêm `?pgbouncer=true` ở cuối chuỗi và mật khẩu đã được mã hóa URL nếu có ký tự đặc biệt (ví dụ `@` đổi thành `%40`).
5. **Cổng 3000 bị chiếm dụng**:
   - Chạy trên cổng khác bằng lệnh: `pnpm dev -p 3001`.
