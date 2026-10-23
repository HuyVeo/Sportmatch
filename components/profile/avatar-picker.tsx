"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { ImageCropDialog } from "@/components/profile/image-crop-dialog";
import { SYSTEM_AVATARS, displayEmoji } from "@/lib/avatar";
import { ACCEPTED_IMAGE_TYPES, validateImageFile } from "@/lib/profile-media";
import { uploadProfileImage } from "@/lib/profile-upload";
import { cn } from "@/lib/utils";

/**
 * Chọn ảnh đại diện: lưới avatar hệ thống (7 ô mỗi hàng như ảnh gốc) + nút
 * tải ảnh lên (cắt vuông bằng ImageCropDialog rồi upload ngay). Ảnh upload
 * được ưu tiên hiển thị hơn emoji, nên chọn emoji khi đang có ảnh nghĩa là
 * muốn bỏ ảnh — phần đó do component cha xử lý qua `onPickEmoji`.
 */
export function AvatarPicker({
  emoji,
  hasPhoto,
  onPickEmoji,
  onUploaded,
}: {
  emoji: string;
  hasPhoto: boolean;
  onPickEmoji: (emoji: string) => void;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const selected = hasPhoto ? null : displayEmoji(emoji);

  function handleFile(file: File | undefined) {
    if (!file) return;
    const problem = validateImageFile(file);
    setFileError(problem);
    if (!problem) setCropSrc(URL.createObjectURL(file));
  }

  function closeCrop() {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  }

  async function submit(blob: Blob) {
    const url = await uploadProfileImage("avatar", blob);
    onUploaded(url);
    closeCrop();
  }

  return (
    <div>
      <div className="mx-auto flex max-w-[31.5rem] flex-wrap justify-center gap-3">
        {SYSTEM_AVATARS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onPickEmoji(option)}
            aria-label={`Chọn avatar ${option}`}
            aria-pressed={selected === option}
            className={cn(
              "bg-brand flex size-14 shrink-0 items-center justify-center rounded-full text-[1.75rem] leading-none transition-transform",
              selected === option
                ? "ring-brand ring-offset-card ring-2 ring-offset-2"
                : "opacity-80 hover:scale-105 hover:opacity-100",
            )}
          >
            <span aria-hidden>{option}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="border-brand text-brand hover:bg-brand/10 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors"
        >
          <Upload className="size-4" />
          {hasPhoto ? "Đổi ảnh khác" : "Tải ảnh của bạn lên"}
        </button>
        <p className="text-xs text-muted-foreground">
          JPG, PNG hoặc WebP, tối đa 5MB.
        </p>
        {fileError ? (
          <p role="alert" className="text-destructive text-sm">
            {fileError}
          </p>
        ) : null}
      </div>

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

      {cropSrc ? (
        <ImageCropDialog
          key={cropSrc}
          kind="avatar"
          src={cropSrc}
          onCancel={closeCrop}
          onSubmit={submit}
        />
      ) : null}
    </div>
  );
}
