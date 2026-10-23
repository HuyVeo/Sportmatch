import type { ProfileImageKind } from "@/lib/profile-media";

const UPLOAD_ERROR = "Tải ảnh lên thất bại. Vui lòng thử lại.";
const REMOVE_ERROR = "Chưa xoá được ảnh. Vui lòng thử lại.";

/** Upload ảnh đại diện / ảnh bìa cho user đang đăng nhập (gọi từ trình duyệt). */
export async function uploadProfileImage(
  kind: ProfileImageKind,
  blob: Blob,
): Promise<string> {
  const form = new FormData();
  form.append("kind", kind);
  form.append("file", blob, `${kind}.${blob.type.split("/")[1] ?? "img"}`);

  let response: Response;
  try {
    response = await fetch("/api/profile/images", { method: "POST", body: form });
  } catch {
    throw new Error(UPLOAD_ERROR);
  }

  const body: { url?: string; error?: string } | null = await response
    .json()
    .catch(() => null);
  if (!response.ok || !body?.url) throw new Error(body?.error ?? UPLOAD_ERROR);
  return body.url;
}

/** Bỏ ảnh đã upload → hồ sơ quay về avatar emoji / ảnh bìa mặc định. */
export async function removeProfileImage(kind: ProfileImageKind): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`/api/profile/images?kind=${kind}`, { method: "DELETE" });
  } catch {
    throw new Error(REMOVE_ERROR);
  }
  if (!response.ok) {
    const body: { error?: string } | null = await response.json().catch(() => null);
    throw new Error(body?.error ?? REMOVE_ERROR);
  }
}
