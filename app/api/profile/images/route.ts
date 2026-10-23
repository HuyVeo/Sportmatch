import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { replaceUserImage } from "@/lib/data/users";
import {
  IMAGE_SIZE_ERROR,
  IMAGE_TYPE_ERROR,
  MAX_IMAGE_BYTES,
  PROFILE_IMAGE_KINDS,
  type ProfileImageKind,
} from "@/lib/profile-media";
import { detectImageType, imageStorage } from "@/lib/storage/image-storage";

const FOLDER: Record<ProfileImageKind, string> = {
  avatar: "avatars",
  cover: "covers",
};

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Upload ảnh đại diện / ảnh bìa cho CHÍNH user đang đăng nhập.
 *
 * Endpoint không nhận `userId` từ client: user bị sửa luôn là user của phiên,
 * nên không có cách nào ghi đè ảnh của người khác dù có gọi API trực tiếp.
 *
 * Body: multipart/form-data với `kind` ("avatar" | "cover") và `file`.
 */
export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return error("Bạn cần đăng nhập để cập nhật ảnh.", 401);

  // Chặn request cross-site (CSRF) — trình duyệt luôn gửi Origin với POST fetch.
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) {
    return error("Yêu cầu không hợp lệ.", 403);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return error("Dữ liệu upload không hợp lệ.", 400);
  }

  const kind = form.get("kind");
  const file = form.get("file");
  if (!PROFILE_IMAGE_KINDS.includes(kind as ProfileImageKind)) {
    return error("Loại ảnh không hợp lệ.", 400);
  }
  if (!(file instanceof File)) return error("Chưa chọn ảnh.", 400);
  if (file.size > MAX_IMAGE_BYTES) return error(IMAGE_SIZE_ERROR, 413);

  const data = Buffer.from(await file.arrayBuffer());
  const type = detectImageType(data);
  if (!type) return error(IMAGE_TYPE_ERROR, 415);

  const imageKind = kind as ProfileImageKind;
  const url = await imageStorage.put(FOLDER[imageKind], data, type);

  let previous: string | null;
  try {
    previous = await replaceUserImage(userId, imageKind, url);
  } catch {
    await imageStorage.remove(url);
    return error("Không lưu được ảnh. Vui lòng thử lại.", 500);
  }
  if (previous) await imageStorage.remove(previous);

  // Ảnh đại diện hiện ở header của mọi trang → làm mới cả layout.
  revalidatePath("/", "layout");
  return NextResponse.json({ url });
}

/**
 * Bỏ ảnh đại diện / ảnh bìa đã upload của CHÍNH user đang đăng nhập — hồ sơ
 * quay về avatar emoji / ảnh bìa mặc định. Query: `?kind=avatar|cover`.
 */
export async function DELETE(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return error("Bạn cần đăng nhập để cập nhật ảnh.", 401);

  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) {
    return error("Yêu cầu không hợp lệ.", 403);
  }

  const kind = request.nextUrl.searchParams.get("kind");
  if (!PROFILE_IMAGE_KINDS.includes(kind as ProfileImageKind)) {
    return error("Loại ảnh không hợp lệ.", 400);
  }

  let previous: string | null;
  try {
    previous = await replaceUserImage(userId, kind as ProfileImageKind, null);
  } catch {
    return error("Không xoá được ảnh. Vui lòng thử lại.", 500);
  }
  if (previous) await imageStorage.remove(previous);

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
