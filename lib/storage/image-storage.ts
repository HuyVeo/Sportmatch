import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AcceptedImageType } from "@/lib/profile-media";

/**
 * Lớp trừu tượng lưu ảnh upload. Phần còn lại của app chỉ làm việc với URL
 * trả về từ `put`, nên muốn chuyển sang S3 / Supabase Storage / Vercel Blob chỉ
 * cần viết thêm một implementation của `ImageStorage` và đổi `imageStorage`.
 */
export interface ImageStorage {
  /** Lưu ảnh dưới thư mục `folder`, trả về URL công khai để hiển thị. */
  put(folder: string, data: Buffer, type: AcceptedImageType): Promise<string>;
  /** Đọc ảnh theo key (phần đường dẫn sau `MEDIA_URL_PREFIX`). */
  get(key: string): Promise<{ data: Buffer; type: AcceptedImageType } | null>;
  /** Xoá ảnh theo URL do chính storage này cấp; URL lạ thì bỏ qua. */
  remove(url: string): Promise<void>;
}

export const MEDIA_URL_PREFIX = "/api/media/";

const EXTENSION_BY_TYPE: Record<AcceptedImageType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const TYPE_BY_EXTENSION: Record<string, AcceptedImageType> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/** Key hợp lệ: `<thư mục>/<tên file>.<đuôi>` — chặn mọi kiểu `..` hay path lạ. */
const KEY_PATTERN = /^[a-z]+\/[A-Za-z0-9_-]+\.(jpg|png|webp)$/;

/**
 * Lưu file trên ổ đĩa của server (mặc định `storage/uploads`, đổi được qua
 * `UPLOAD_DIR`) và phục vụ qua route `/api/media/...`. Phù hợp môi trường
 * local/demo hoặc server có ổ đĩa bền; KHÔNG dùng được trên serverless.
 */
class LocalDiskImageStorage implements ImageStorage {
  constructor(private readonly root: string) {}

  async put(folder: string, data: Buffer, type: AcceptedImageType) {
    const key = `${folder}/${randomUUID()}.${EXTENSION_BY_TYPE[type]}`;
    const filePath = this.resolve(key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, data);
    return `${MEDIA_URL_PREFIX}${key}`;
  }

  async get(key: string) {
    if (!KEY_PATTERN.test(key)) return null;
    try {
      const data = await readFile(this.resolve(key));
      const extension = key.slice(key.lastIndexOf(".") + 1);
      return { data, type: TYPE_BY_EXTENSION[extension] };
    } catch {
      return null;
    }
  }

  async remove(url: string) {
    if (!url.startsWith(MEDIA_URL_PREFIX)) return;
    const key = url.slice(MEDIA_URL_PREFIX.length);
    if (!KEY_PATTERN.test(key)) return;
    await unlink(this.resolve(key)).catch(() => {});
  }

  private resolve(key: string) {
    return path.join(this.root, ...key.split("/"));
  }
}

export const imageStorage: ImageStorage = new LocalDiskImageStorage(
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "storage", "uploads"),
);

/**
 * Xác định định dạng thật qua magic bytes — không tin `file.type` do client
 * gửi lên.
 */
export function detectImageType(data: Buffer): AcceptedImageType | null {
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    data.length >= 8 &&
    data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }
  if (
    data.length >= 12 &&
    data.toString("ascii", 0, 4) === "RIFF" &&
    data.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}
