"use client";

import { useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, ImageIcon } from "lucide-react";
import { ImageCropDialog } from "@/components/profile/image-crop-dialog";
import { useToast } from "@/components/ui/toast";
import {
  ACCEPTED_IMAGE_TYPES,
  PROFILE_IMAGE_SPECS,
  validateImageFile,
  type ProfileImageKind,
} from "@/lib/profile-media";
import { uploadProfileImage } from "@/lib/profile-upload";
import { displayEmoji } from "@/lib/avatar";

/**
 * Phần đầu trang hồ sơ: ảnh bìa + avatar chồng lên ảnh bìa. `children` là phần
 * thông tin (tên, khu vực, môn...) do server component render.
 *
 * Nút đổi ảnh chỉ render khi `isOwnProfile` — quyền thật vẫn do API
 * `/api/profile/images` kiểm tra (luôn ghi vào user của phiên đăng nhập).
 */
export function ProfileHeader({
  name,
  avatarEmoji,
  avatarUrl: initialAvatarUrl,
  coverImageUrl: initialCoverUrl,
  isOnline,
  isOwnProfile,
  children,
}: {
  name: string;
  avatarEmoji: string;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  isOnline: boolean;
  isOwnProfile: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const pickingKind = useRef<ProfileImageKind>("avatar");
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [coverUrl, setCoverUrl] = useState(initialCoverUrl);
  // URL ảnh tải lỗi (file mất, link hỏng...) → hiện fallback thay vì ảnh vỡ.
  const [brokenUrls, setBrokenUrls] = useState<string[]>([]);
  const [editing, setEditing] = useState<{
    kind: ProfileImageKind;
    src: string;
  } | null>(null);

  const showAvatar = avatarUrl && !brokenUrls.includes(avatarUrl);
  const showCover = coverUrl && !brokenUrls.includes(coverUrl);

  function markBroken(url: string) {
    setBrokenUrls((current) => [...current, url]);
  }

  function pick(kind: ProfileImageKind) {
    pickingKind.current = kind;
    inputRef.current?.click();
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    const problem = validateImageFile(file);
    if (problem) {
      toast.error(problem);
      return;
    }
    setEditing({ kind: pickingKind.current, src: URL.createObjectURL(file) });
  }

  function closeEditor() {
    if (editing) URL.revokeObjectURL(editing.src);
    setEditing(null);
  }

  async function submit(blob: Blob) {
    if (!editing) return;
    const url = await uploadProfileImage(editing.kind, blob);
    if (editing.kind === "avatar") setAvatarUrl(url);
    else setCoverUrl(url);
    toast.success(PROFILE_IMAGE_SPECS[editing.kind].successMessage);
    closeEditor();
    // Cập nhật avatar ở header và các phần khác của trang.
    router.refresh();
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="relative h-36 sm:h-56 lg:h-64">
        {showCover ? (
          <Image
            src={coverUrl}
            alt={`Ảnh bìa của ${name}`}
            fill
            priority
            unoptimized
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="object-cover"
            onError={() => markBroken(coverUrl)}
          />
        ) : (
          <DefaultCover />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 to-transparent" />

        {isOwnProfile ? (
          <button
            type="button"
            onClick={() => pick("cover")}
            className="hover:border-brand/70 absolute top-3 right-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/75 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:top-4 sm:right-4 sm:text-sm"
          >
            <ImageIcon className="size-4" />
            Thay ảnh bìa
          </button>
        ) : null}
      </div>

      <div className="px-4 pb-5 sm:px-8 sm:pb-8">
        <div className="flex flex-col gap-3.5 sm:flex-row sm:gap-6">
          <div className="relative -mt-12 w-fit shrink-0 self-start sm:-mt-17">
            <AvatarFrame
              editable={isOwnProfile}
              onEdit={() => pick("avatar")}
            >
              {showAvatar ? (
                <Image
                  src={avatarUrl}
                  alt={name}
                  fill
                  unoptimized
                  sizes="136px"
                  className="object-cover"
                  onError={() => markBroken(avatarUrl)}
                />
              ) : (
                <span className="bg-brand-gradient flex size-full items-center justify-center text-4xl leading-none sm:text-6xl">
                  {displayEmoji(avatarEmoji)}
                </span>
              )}
            </AvatarFrame>
            {isOnline ? (
              <span
                aria-label="Đang online"
                className="bg-success absolute right-1.5 bottom-1.5 size-3.5 rounded-full ring-4 ring-card sm:right-2.5 sm:bottom-2.5 sm:size-5"
              />
            ) : null}
          </div>

          <div className="min-w-0 flex-1 sm:pt-5">{children}</div>
        </div>
      </div>

      {isOwnProfile ? (
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          className="hidden"
          onChange={(event) => {
            handleFile(event.target.files?.[0]);
            // Reset để chọn lại đúng file đó vẫn kích hoạt onChange.
            event.target.value = "";
          }}
        />
      ) : null}

      {editing ? (
        <ImageCropDialog
          key={editing.src}
          kind={editing.kind}
          src={editing.src}
          onCancel={closeEditor}
          onSubmit={submit}
        />
      ) : null}
    </section>
  );
}

function AvatarFrame({
  editable,
  onEdit,
  children,
}: {
  editable: boolean;
  onEdit: () => void;
  children: ReactNode;
}) {
  const frame =
    "relative block size-24 overflow-hidden rounded-full border-4 border-card bg-card sm:size-34";

  if (!editable) return <div className={frame}>{children}</div>;

  return (
    <button
      type="button"
      onClick={onEdit}
      aria-label="Đổi ảnh đại diện"
      className={`${frame} group focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none`}
    >
      {children}
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        <Camera className="size-6" />
        Đổi ảnh
      </span>
    </button>
  );
}

/** Ảnh bìa mặc định: nền gradient cam của SportMatch + đường kẻ sân. */
function DefaultCover() {
  return (
    <div
      aria-hidden
      className="from-brand/40 via-card to-background absolute inset-0 bg-gradient-to-br"
    >
      <svg
        viewBox="0 0 1600 500"
        preserveAspectRatio="xMidYMid slice"
        className="text-brand absolute inset-0 size-full"
        fill="none"
      >
        <defs>
          <radialGradient id="cover-glow" cx="0.8" cy="0.2" r="0.6">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.35" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1600" height="500" fill="url(#cover-glow)" />
        <g stroke="currentColor" strokeOpacity="0.28" strokeWidth="4">
          <rect x="260" y="70" width="1080" height="360" rx="6" />
          <line x1="800" y1="40" x2="800" y2="460" strokeWidth="6" />
          <line x1="560" y1="70" x2="560" y2="430" />
          <line x1="1040" y1="70" x2="1040" y2="430" />
          <line x1="260" y1="250" x2="560" y2="250" />
          <line x1="1040" y1="250" x2="1340" y2="250" />
        </g>
      </svg>
    </div>
  );
}
