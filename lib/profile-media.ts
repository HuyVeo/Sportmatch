/**
 * Quy ước ảnh hồ sơ (ảnh đại diện + ảnh bìa) dùng chung cho client lẫn server,
 * để hai phía kiểm tra cùng một bộ luật.
 */

export type ProfileImageKind = "avatar" | "cover";

export const PROFILE_IMAGE_KINDS: readonly ProfileImageKind[] = [
  "avatar",
  "cover",
];

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export type AcceptedImageType = (typeof ACCEPTED_IMAGE_TYPES)[number];

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const IMAGE_TYPE_ERROR = "Ảnh phải có định dạng JPG, PNG hoặc WebP.";
export const IMAGE_SIZE_ERROR = "Ảnh không được vượt quá 5MB.";

/**
 * Tỉ lệ crop và kích thước ảnh xuất ra sau khi crop (ảnh được thu nhỏ ở trình
 * duyệt trước khi upload, nên file gửi lên server nhỏ hơn nhiều so với 5MB).
 */
export const PROFILE_IMAGE_SPECS: Record<
  ProfileImageKind,
  { aspect: number; maxWidth: number; successMessage: string }
> = {
  avatar: {
    aspect: 1,
    maxWidth: 512,
    successMessage: "Đã cập nhật ảnh đại diện.",
  },
  cover: {
    aspect: 16 / 5,
    maxWidth: 1600,
    successMessage: "Đã cập nhật ảnh bìa.",
  },
};

export function isAcceptedImageType(type: string): type is AcceptedImageType {
  return (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(type);
}

/** Trả về thông báo lỗi (tiếng Việt) nếu file không hợp lệ, ngược lại `null`. */
export function validateImageFile(file: {
  type: string;
  size: number;
}): string | null {
  if (!isAcceptedImageType(file.type)) return IMAGE_TYPE_ERROR;
  if (file.size > MAX_IMAGE_BYTES) return IMAGE_SIZE_ERROR;
  return null;
}
