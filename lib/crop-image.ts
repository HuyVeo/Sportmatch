import type { Area } from "react-easy-crop";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Không đọc được ảnh."));
    image.src = src;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Cắt vùng `area` (toạ độ pixel trên ảnh gốc) và thu nhỏ về tối đa `maxWidth`,
 * xuất WebP (hoặc JPEG nếu trình duyệt không encode được WebP). Chạy hoàn toàn
 * ở trình duyệt nên file gửi lên server nhỏ và đã đúng tỉ lệ.
 */
export async function cropImage(
  src: string,
  area: Area,
  maxWidth: number,
): Promise<Blob> {
  const image = await loadImage(src);
  const scale = Math.min(1, maxWidth / area.width);
  const width = Math.max(1, Math.round(area.width * scale));
  const height = Math.max(1, Math.round(area.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Trình duyệt không hỗ trợ xử lý ảnh.");

  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    width,
    height,
  );

  const webp = await canvasToBlob(canvas, "image/webp", 0.9);
  if (webp?.type === "image/webp") return webp;

  // Fallback JPEG: phủ nền trước để vùng trong suốt (PNG) không thành màu đen.
  context.globalCompositeOperation = "destination-over";
  context.fillStyle = "#131313";
  context.fillRect(0, 0, width, height);
  const jpeg = await canvasToBlob(canvas, "image/jpeg", 0.9);
  if (!jpeg) throw new Error("Không xử lý được ảnh.");
  return jpeg;
}
