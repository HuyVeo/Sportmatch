# Bối cảnh & mục tiêu dự án — SportMatch

Đây là dự án xây dựng lại website **SportMatch** — nền tảng giúp người chơi thể thao phong trào (bắt đầu với **Cầu lông** và **Pickleball**) tạo trận đấu tại sân thể thao và ghép cặp/ghép đội với người chơi khác gần khu vực của họ. Sau khi clone xong bản gốc, dự án sẽ **mở rộng thêm các môn thể thao khác** và các tính năng mới.

## Nguồn tham chiếu (source of truth)

Toàn bộ UI/UX giai đoạn 1 dựa trên các ảnh chụp màn hình gốc nằm ở thư mục gốc repo (`*.png`), chụp từ website đang chạy tại `sportmatch.vn`. Khi cần chi tiết một màn hình, **đọc trực tiếp file ảnh tương ứng** thay vì đoán.

| File | Trang / Chức năng |
|---|---|
| `1.png` | Landing page (chưa đăng nhập) |
| `2.png` | Preview thu nhỏ trang đăng nhập |
| `3.png` | Preview thu nhỏ trang đăng ký |
| `screencapture-...-auth-login-*.png` | Trang Đăng nhập |
| `screencapture-...-auth-register-*.png` | Trang Đăng ký |
| `screencapture-...-onboarding-*_15_46.png` | Onboarding bước 1/5 — Chọn môn thể thao |
| `screencapture-...-onboarding-*_16_02.png` | Onboarding bước 2/5 — Chọn trình độ |
| `screencapture-...-onboarding-*_16_07.png` | Onboarding bước 3/5 — Chọn khu vực |
| `screencapture-...-onboarding-*_16_14.png` | Onboarding bước 4/5 — Chọn ảnh hồ sơ |
| `screencapture-...-onboarding-*_16_23.png` | Onboarding bước 5/5 — Chọn lịch rảnh |
| `screencapture-...-main-discover-*.png` | Khám phá — swipe tìm người chơi |
| `screencapture-...-main-map-*.png` | Bản đồ người chơi — **đã bỏ, không làm** (2026-10-18) |
| `screencapture-...-main-matches-*_18_47.png` | Danh sách Trận đấu |
| `screencapture-...-main-matches-create-*.png` | Tạo trận đấu mới |
| `screencapture-...-main-courts-*.png` | Danh sách + bản đồ Sân bãi |
| `screencapture-...-main-ranking-*.png` (2 ảnh) | Bảng xếp hạng (light/dark) |
| `screencapture-...-main-profile-*.png` | Hồ sơ cá nhân |
| `screencapture-...-main-chat-*.png` | Tin nhắn realtime |
| `screencapture-...-main-history-*.png` | Lịch sử trận đấu |
| `screencapture-...-main-notifications-*.png` | Thông báo |
| `screencapture-...-main-ratings-*.png` | Đánh giá & nhận xét sau trận |
| `screencapture-...-main-settings-*.png` | Cài đặt tài khoản |

## Mục tiêu theo giai đoạn

1. **Giai đoạn 1 (hiện tại): Clone chính xác** toàn bộ trang, luồng và logic hiển thị thấy trong ảnh.
2. **Giai đoạn 2 (sau này)**: Thêm môn thể thao mới ngoài Cầu lông/Pickleball, và tính năng mới theo yêu cầu user. Kiến trúc phải đủ tổng quát để thêm môn thể thao mới không phải sửa lại core (xem `data-model.md`).

Không tự ý nhảy sang giai đoạn 2 khi giai đoạn 1 chưa xong, trừ khi user chủ động yêu cầu.

## Quy ước làm việc chung

- Luôn đối chiếu ảnh gốc tương ứng khi implement 1 trang — không đoán chi tiết UI nếu ảnh đã có sẵn thông tin.
- Giữ toàn bộ text hiển thị bằng tiếng Việt, đúng văn phong trong ảnh gốc (ví dụ: "Tạo trận", "Khám phá", "Còn chỗ"...).
- Không thêm tính năng/trang ngoài phạm vi ảnh ở giai đoạn 1. Nếu thiếu thông tin cho 1 trạng thái nào đó (ví dụ chat khi có tin nhắn thật), hỏi lại user thay vì tự bịa layout.
