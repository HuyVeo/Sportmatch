---
paths:
  - "app/(app)/discover/**"
  - "app/(app)/ranking/**"
---

# Khám phá & Xếp hạng

## Khám phá (Discover)
Giao diện dạng thẻ (card swipe, kiểu Tinder): hiển thị 1 người chơi phù hợp mỗi lần — avatar, tên, khoảng cách, khu vực, rating sao, số trận, badge trình độ, % uy tín, lịch rảnh trùng, mô tả ngắn. Hành động: Bỏ qua / Nhắn tin / Mời chơi (quẹt trái/phải cũng được). Sidebar trái là bộ lọc: tên, môn thể thao, trình độ, giới tính, độ tuổi, khoảng cách (slider km), lịch rảnh, toggle "chỉ hiện người đang online". Thanh trên cùng hiện: số người phù hợp, số lượt mời miễn phí còn lại/ngày (giới hạn free-tier, reset lúc 0h — liên quan gói "Pro"), đồng hồ đếm ngược. Panel phải "Tiếp theo" preview người kế tiếp. Đối chiếu `screencapture-...-main-discover-*.png`.

## Bản đồ (Map) — ĐÃ BỎ
Trang Bản đồ người chơi (`/map`) đã xoá hẳn (chốt 2026-10-18) vì trùng ý nghĩa với Sân bãi. Không dựng lại trừ khi user yêu cầu.

## Xếp hạng (Ranking)
Bảng xếp hạng toàn hệ thống. Top 3 hiển thị dạng podium (avatar lớn, khung màu theo hạng, huy hiệu #1/#2/#3, badge cấp bậc "Huyền thoại" v.v.). Bảng list có cột: Hạng, Người chơi (kèm badge trình độ/môn), Cấp bậc, Đánh giá (sao TB + số lượt), Trận (số trận), Điểm (điểm tổng + % uy tín). Tab lọc theo tiêu chí: Tổng thể / Đánh giá / Trận đấu / Uy tín; có ô tìm kiếm, lọc theo môn, chọn số dòng/trang, phân trang.

Sidebar phải: "Thứ hạng của bạn" (rank hiện tại/tổng số người chơi) + **công thức tính điểm minh bạch**:

```
Điểm đánh giá  = Sao trung bình × 30
Điểm trận đấu  = Số trận × 1.5
Điểm uy tín    = Uy tín × 0.4
Điểm cộng đồng = Votes × 2
Tổng điểm      = tổng 4 thành phần trên
```

Ngưỡng cấp bậc: Tân binh ≥0, Trung cấp ≥50, Chuyên nghiệp ≥100, Tinh anh ≥150, Huyền thoại ≥200.

Đối chiếu `screencapture-...-main-ranking-*.png` (2 ảnh — light và dark mode, nội dung giống nhau chỉ khác theme).
