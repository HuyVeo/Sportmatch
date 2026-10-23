import type { NextRequest } from "next/server";
import { imageStorage } from "@/lib/storage/image-storage";

/**
 * Phục vụ ảnh do `LocalDiskImageStorage` lưu. Mỗi lần upload sinh tên file mới,
 * nên nội dung ở một URL không bao giờ đổi → cache vĩnh viễn được.
 */
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/media/[...key]">,
) {
  const { key } = await ctx.params;
  const image = await imageStorage.get(key.join("/"));
  if (!image) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.type,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
