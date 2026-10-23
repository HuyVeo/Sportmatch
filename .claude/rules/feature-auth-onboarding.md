---
paths:
  - "app/(marketing)/**"
  - "app/(auth)/**"
  - "app/onboarding/**"
---

# Landing, Auth & Onboarding

## Landing page
Hero "Tìm cộng đồng thể thao phù hợp" + CTA đăng ký. Các section theo thứ tự: mạng lưới vận động viên gần bạn, biến kết nối thành trận đấu thật, điều phối trận đấu minh bạch, uy tín từ hoạt động thật (badge cấp bậc), tìm sân bãi/khu vực, hồ sơ cá nhân đáng tin cậy, cộng đồng mạnh — kết CTA "Sẵn sàng ra sân hôm nay?". Đối chiếu `1.png`.

## Auth (Đăng nhập / Đăng ký)
Layout 2 cột: bên trái minh hoạ + tagline, bên phải form.
- **Đăng nhập**: email, mật khẩu (nút show/hide), link "Quên mật khẩu?", link sang đăng ký.
- **Đăng ký**: họ tên, email, mật khẩu (yêu cầu ≥8 ký tự, có chữ hoa và số), xác nhận mật khẩu, checkbox đồng ý Điều khoản & Chính sách riêng tư.

Đối chiếu `screencapture-...-auth-login-*.png` và `screencapture-...-auth-register-*.png`.

## Onboarding (5 bước, có thanh tiến trình % + progress dots)

1. **Chọn môn thể thao** — multi-select: Cầu lông, Pickleball
2. **Chọn trình độ chung** — Mới chơi / Trung cấp / Chuyên nghiệp
3. **Nhập khu vực** — autocomplete/gợi ý theo quận, nút "Lấy vị trí" dùng geolocation
4. **Chọn ảnh hồ sơ** — grid 14 avatar hoạt hình có sẵn hoặc upload, có thể bỏ qua
5. **Chọn lịch rảnh** — chọn các ngày trong tuần (Thứ 2 → Chủ nhật)

Mỗi bước có nút Quay lại / Tiếp tục; bước cuối đổi thành "Bắt đầu chơi". Có link "Bỏ qua lúc này" (trừ đôi khi tuỳ bước — kiểm tra lại ảnh). Đối chiếu 5 ảnh `screencapture-...-onboarding-*.png` theo timestamp tăng dần (15_46 → 16_02 → 16_07 → 16_14 → 16_23).
