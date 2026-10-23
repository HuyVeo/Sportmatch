---
paths:
  - "app/**/*.{tsx,jsx}"
  - "components/**/*.{tsx,jsx}"
  - "**/*.css"
  - "tailwind.config.*"
---

# Design system (rút ra từ ảnh gốc)

- **Brand**: tên "SportMatch", logo icon tia sét (⚡) trong khung bo góc màu cam gradient (cam → cam đậm/đỏ cam).
- **Màu chủ đạo**: cam (`#f97316` ~ tương đương). Nền tối gần đen/xanh navy rất đậm cho dark theme (mặc định); nền trắng/xám nhạt cho light theme. Có nút toggle dark/light ở header (icon mặt trời/mặt trăng).
- **Bo góc lớn** trên card, input, button. **Nút chính** dùng gradient cam. Card nền tối với border mờ (subtle). Badge trạng thái màu xanh lá cho "Online" / "Mở cửa" / "Còn chỗ".
- **Ngôn ngữ giao diện**: Tiếng Việt 100%, giữ đúng từ ngữ như trong ảnh gốc (không tự dịch lại hoặc đổi wording).
- **Header chính** (sau khi đăng nhập), luôn hiện trên mọi trang trong `(app)`:
  - Logo SportMatch (trái)
  - Menu ngang: Khám phá · Câu lạc bộ · Trận đấu · Sân bãi · Xếp hạng (ảnh gốc là "Bản đồ" — đã thay bằng "Câu lạc bộ" theo yêu cầu user 2026-10-05; trang `/map` đã xoá hẳn vì trùng ý nghĩa với Sân bãi — chốt 2026-10-18)
  - Toggle theme (sáng/tối)
  - Nút "+ Tạo trận" nổi bật màu cam
  - Icon Thông báo, icon Chat (có badge số lượng chưa đọc khi có)
  - Badge "Pro"
  - Avatar + tên user (dropdown menu)

Khi build bất kỳ component UI nào, đối chiếu lại đúng ảnh gốc của trang chứa nó (xem bảng trong `project-overview.md`) để lấy màu sắc, spacing, wording chính xác — không tự sáng tạo style mới ngoài hệ thống này.
