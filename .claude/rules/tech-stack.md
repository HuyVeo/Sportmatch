# Tech stack (đã chốt — sẵn sàng triển khai)

Dự án dùng stack sau. Không cần hỏi lại user trước khi cài các package thuộc danh sách này; chỉ hỏi lại nếu cần thêm dependency lớn **ngoài** phạm vi dưới đây (ví dụ đổi DB provider, thêm CMS, thêm payment...).

- **Framework**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS. Theme tối (dark) là mặc định, có toggle sang light mode (xem `design-system.md`)
- **UI components**: xây thủ công theo design system riêng (xem `design-system.md`) — có thể dùng shadcn/ui làm nền tảng primitives (Radix) để tăng tốc, tuỳ chỉnh lại style theo đúng ảnh gốc
- **Database/ORM**: PostgreSQL + Prisma
- **Auth**: Auth.js (NextAuth) — email/password (đăng nhập, đăng ký, quên mật khẩu)
- **Bản đồ**: Leaflet + react-leaflet, tile layer OpenStreetMap (đúng như ảnh gốc, giữ watermark "Leaflet | © OpenStreetMap contributors"). **Không dùng Google Maps API** (user không tạo được key — chốt 2026-09-27).
  - Dữ liệu sân thật: **Overpass API** (OpenStreetMap, miễn phí, không key) — `lib/osm/overpass.ts`, lưu vào bảng `Court` theo ô lưới (`lib/data/court-sync.ts`) để lần sau chỉ đọc DB. Overpass công cộng hay quá tải → có server dự phòng.
  - Chỉ đường: link công khai `google.com/maps/dir/?api=1&destination=lat,lng` (không cần key).
- **Realtime** (chat): **Supabase Realtime Broadcast** (chốt 2026-10-05). Server phát tín hiệu "có thay đổi" (không kèm nội dung) qua REST bằng `SUPABASE_SECRET_KEY` tới kênh riêng của từng user (tên kênh băm HMAC từ userId) — `lib/realtime/broadcast.ts`; trình duyệt nghe bằng publishable key rồi `router.refresh()` — `components/chat/realtime-listener.tsx`. Không dùng Postgres Changes/RLS/JWT secret. Cần bật "Allow public access" trong Realtime Settings.
- **Package manager**: pnpm
- **Deploy**: chưa chốt (đề xuất Vercel do là Next.js) — hỏi user khi tới lúc deploy.

## Cấu trúc thư mục đề xuất (Next.js App Router)

```
app/
  (marketing)/
    page.tsx                # Landing page (1.png)
  (auth)/
    login/page.tsx
    register/page.tsx
  onboarding/
    page.tsx                # wizard 5 bước, quản lý step qua query hoặc client state
  (app)/                     # route group sau khi đăng nhập, dùng chung layout header
    layout.tsx
    discover/page.tsx
    matches/
      page.tsx
      create/page.tsx
    courts/page.tsx
    ranking/page.tsx
    profile/[userId]/page.tsx
    chat/page.tsx
    notifications/page.tsx
    history/page.tsx
    ratings/page.tsx
    settings/page.tsx
components/
  ui/                        # primitives dùng chung (button, card, badge, avatar...)
  ...
prisma/
  schema.prisma
```

Các rule theo tính năng (`feature-*.md`) dùng glob path dựa trên cấu trúc này để tự động nạp đúng ngữ cảnh khi làm việc trong thư mục tương ứng. Nếu cấu trúc thực tế đổi khác, cập nhật lại `paths` trong các rule file cho khớp.
