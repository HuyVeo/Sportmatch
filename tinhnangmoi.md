# **1\. Tính năng mới: Đánh giá người chơi sau trận**

Khi một trận đấu chuyển sang trạng thái “Đã hoàn thành”, những người tham gia trận sẽ được yêu cầu đánh giá các thành viên cùng trận.

·   	Đánh giá theo thang điểm 1–5 sao.

·   	Có thể viết nhận xét ngắn về người chơi.

·   	Chỉ người thực sự tham gia trận mới được đánh giá.

·   	Chỉ có thể đánh giá sau khi trận đấu đã hoàn thành.

·   	Mỗi người chỉ được đánh giá một người chơi một lần trong cùng một trận.

# **2\. Flow tính năng mới**

| Flow | Giai đoạn | Mô tả |
| :---- | :---- | :---- |
| Bước 1 | Trận đấu được tạo | Người dùng tạo hoặc tham gia một trận đấu trên SportMatch. |
| Bước 2 | Trận đấu diễn ra | Những người chơi tham gia trận theo thông tin đã thống nhất. |
| Bước 3 | Trận đấu hoàn thành | Hệ thống cập nhật trạng thái trận thành “Đã hoàn thành”. |
| Bước 4 | Gửi yêu cầu đánh giá | Hệ thống gửi thông báo/yêu cầu đánh giá tới người tham gia. |
| Bước 5 | Đánh giá người chơi | Người dùng chọn số sao và có thể viết nhận xét ngắn. |
| Bước 6 | Lưu đánh giá | Hệ thống lưu người đánh giá, người được đánh giá, trận đấu, số sao, nhận xét và thời gian. |
| Bước 7 | Cập nhật Profile | Điểm đánh giá trung bình, số lượt đánh giá và nhận xét được cập nhật trên Profile. |
| Bước 8 | Sử dụng dữ liệu đánh giá | Người chơi khác có thể xem đánh giá để tham khảo độ tin cậy trước khi tham gia trận. |

 

**TRẬN ĐẤU HOÀN THÀNH → THÔNG BÁO ĐÁNH GIÁ → CHẤM SAO/NHẬN XÉT → LƯU REVIEW → CẬP NHẬT PROFILE → NGƯỜI KHÁC XEM ĐÁNH GIÁ**

# **3\. Giao diện đánh giá sau trận**

Sau khi trận đấu hoàn thành, người dùng có thể nhìn thấy màn hình:

·   	Tên người chơi cần đánh giá.

·   	Thang đánh giá 1–5 sao.

·   	Ô nhập nhận xét.

·   	Nút “Gửi đánh giá”.

# **4\. Cập nhật thông tin trên Profile**

Profile được bổ sung khu vực đánh giá để biến kết quả từ những trận đấu thực tế thành social proof cho người chơi.

| Thông tin | Hiển thị đề xuất |
| :---- | :---- |
| Điểm đánh giá | ⭐ 4.8/5 |
| Số lượt đánh giá | 24 đánh giá |
| Số trận đã chơi | 18 trận đã chơi |
| Nhận xét | Hiển thị một số nhận xét gần đây từ đồng đội |

 

**Ví dụ Profile sau cập nhật:**

Nguyễn Minh  
 ⭐ 4.8/5 · 24 đánh giá  
 🏸 18 trận đã chơi

 “Đúng giờ, đánh rất fair-play.” – Minh  
 “Trình độ phù hợp, giao tiếp tốt.” – Nam

# **5\. Logic dữ liệu/code cần cập nhật**

| Hạng mục | Nội dung cập nhật |
| :---- | :---- |
| Match | Bổ sung/đảm bảo trạng thái “COMPLETED” để xác định trận đã kết thúc. |
| Review | Lưu reviewerId, revieweeId, matchId, rating, comment và createdAt. |
| Validation | Kiểm tra người đánh giá có tham gia trận và chưa đánh giá người đó trong trận. |
| Profile | Tính averageRating và totalReviews; truy xuất các nhận xét để hiển thị. |
| Notification | Thông báo cho người chơi khi có yêu cầu đánh giá hoặc khi có đánh giá mới. |

