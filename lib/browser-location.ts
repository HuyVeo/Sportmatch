import type { LatLng } from "@/lib/geo";

/**
 * Lấy toạ độ hiện tại từ trình duyệt. Lỗi ném ra có message tiếng Việt để
 * hiển thị thẳng cho người dùng.
 */
export function getBrowserPosition(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Trình duyệt không hỗ trợ định vị — hãy nhập khu vực."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Bạn đã chặn quyền vị trí. Bấm biểu tượng 🔒 cạnh thanh địa chỉ để cho phép, hoặc nhập khu vực."
            : error.code === error.TIMEOUT
              ? "Định vị quá lâu, vui lòng thử lại hoặc nhập khu vực."
              : "Không xác định được vị trí của bạn — hãy nhập khu vực.";
        reject(new Error(message));
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 5 * 60_000 },
    );
  });
}
