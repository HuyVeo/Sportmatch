"use client";

import { useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { CircleAlert, Loader2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { cropImage } from "@/lib/crop-image";
import { PROFILE_IMAGE_SPECS, type ProfileImageKind } from "@/lib/profile-media";
import { cn } from "@/lib/utils";

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

/**
 * Modal "Chỉnh sửa ảnh": preview + crop + zoom + kéo chọn vùng. Chỉ khi bấm
 * Lưu mới cắt ảnh và gọi `onSubmit`; lỗi upload giữ modal mở để thử lại.
 */
export function ImageCropDialog({
  kind,
  src,
  onCancel,
  onSubmit,
}: {
  kind: ProfileImageKind;
  /** Object URL của file vừa chọn. */
  src: string;
  onCancel: () => void;
  /** Ném lỗi (message tiếng Việt) nếu upload thất bại. */
  onSubmit: (blob: Blob) => Promise<void>;
}) {
  const spec = PROFILE_IMAGE_SPECS[kind];
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [area, setArea] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!area || uploading) return;
    setUploading(true);
    setError(null);
    try {
      const blob = await cropImage(src, area, spec.maxWidth);
      await onSubmit(blob);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Tải ảnh lên thất bại. Vui lòng thử lại.",
      );
      setUploading(false);
    }
  }

  function changeZoom(value: number) {
    setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value)));
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !uploading) onCancel();
      }}
    >
      <DialogContent
        showCloseButton={!uploading}
        onInteractOutside={(event) => {
          if (uploading) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (uploading) event.preventDefault();
        }}
        className="gap-0 overflow-hidden rounded-3xl border border-border bg-card p-0 ring-0 sm:max-w-2xl"
      >
        <div className="px-6 pt-6 pb-4">
          <DialogTitle className="text-lg font-bold">Chỉnh sửa ảnh</DialogTitle>
          <DialogDescription className="mt-1.5">
            Kéo ảnh để chọn vùng hiển thị, dùng thanh trượt để phóng to hoặc
            thu nhỏ.
          </DialogDescription>
        </div>

        <div
          className={cn(
            "relative h-72 bg-black sm:h-96",
            uploading && "pointer-events-none opacity-70",
          )}
        >
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            aspect={spec.aspect}
            cropShape={kind === "avatar" ? "round" : "rect"}
            showGrid={kind === "cover"}
            onCropChange={setCrop}
            onZoomChange={changeZoom}
            onCropComplete={(_, pixels) => setArea(pixels)}
          />
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Thu nhỏ"
              disabled={uploading}
              onClick={() => changeZoom(zoom - 0.2)}
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
            >
              <ZoomOut className="size-4" />
            </button>
            <Slider
              aria-label="Mức phóng to"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.01}
              value={[zoom]}
              disabled={uploading}
              onValueChange={([value]) => changeZoom(value)}
              className="flex-1"
            />
            <button
              type="button"
              aria-label="Phóng to"
              disabled={uploading}
              onClick={() => changeZoom(zoom + 0.2)}
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
            >
              <ZoomIn className="size-4" />
            </button>
          </div>

          {error ? (
            <p
              role="alert"
              className="text-destructive bg-destructive/10 flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-medium"
            >
              <CircleAlert className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={uploading}
              onClick={onCancel}
              className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary disabled:opacity-50"
            >
              Huỷ
            </button>
            <button
              type="button"
              disabled={uploading || !area}
              onClick={save}
              className="bg-brand-gradient inline-flex min-w-32 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang tải lên...
                </>
              ) : error ? (
                <>
                  <RotateCcw className="size-4" />
                  Thử lại
                </>
              ) : (
                "Lưu"
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
