"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Loader2, MapPin, Star } from "lucide-react";
import { submitRatingAction } from "@/app/(app)/ratings/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { UserAvatar } from "@/components/ui/user-avatar";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { RateableMatch, RateablePeer } from "@/lib/data/ratings";
export type { RateableMatch, RateablePeer };

export function RateableMatchItem({ match }: { match: RateableMatch }) {
  const toast = useToast();
  const [selectedPeer, setSelectedPeer] = useState<RateablePeer | null>(null);
  const [stars, setStars] = useState(5);
  const [hoveredStars, setHoveredStars] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [pending, startTransition] = useTransition();
  const [peers, setPeers] = useState<RateablePeer[]>(match.peers);

  function openRateDialog(peer: RateablePeer) {
    setSelectedPeer(peer);
    setStars(peer.existingRating?.stars ?? 5);
    setComment(peer.existingRating?.comment ?? "");
  }

  function handleSaveRating() {
    if (!selectedPeer) return;
    startTransition(async () => {
      const res = await submitRatingAction({
        matchId: match.id,
        toUserId: selectedPeer.id,
        stars,
        comment,
      });

      if (!res.ok) {
        toast.error(res.error ?? "Không thể gửi đánh giá.");
        return;
      }

      toast.success(`Đã gửi đánh giá ${stars}★ cho ${selectedPeer.name}!`);
      setPeers((prev) =>
        prev.map((p) =>
          p.id === selectedPeer.id
            ? { ...p, existingRating: { stars, comment: comment.trim() } }
            : p,
        ),
      );
      setSelectedPeer(null);
    });
  }

  const unratedCount = peers.filter((p) => !p.existingRating).length;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-brand/40">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <span className="bg-brand-gradient flex size-11 shrink-0 items-center justify-center rounded-xl text-xl">
            {match.sportIcon}
          </span>
          <div>
            <Link
              href={`/matches/${match.id}`}
              className="font-heading text-lg font-bold hover:underline"
            >
              {match.title}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3.5" />
                {formatDateTime(match.dateTime)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {match.courtName}
              </span>
            </div>
          </div>
        </div>

        <div>
          {unratedCount > 0 ? (
            <span className="bg-brand/10 text-brand rounded-full px-3 py-1 text-xs font-semibold">
              Còn {unratedCount} đồng đội chưa đánh giá
            </span>
          ) : (
            <span className="bg-success/10 text-success flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold">
              <CheckCircle2 className="size-3.5" />
              Đã hoàn tất đánh giá
            </span>
          )}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Đồng đội trong trận:
        </p>
        <ul className="mt-3 divide-y divide-border">
          {peers.map((peer) => (
            <li
              key={peer.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div className="flex items-center gap-3">
                <UserAvatar
                  emoji={peer.avatar}
                  src={peer.avatarUrl}
                  name={peer.name}
                  className="bg-brand size-10 text-lg"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/profile/${peer.id}`}
                      className="text-sm font-semibold hover:underline"
                    >
                      {peer.name}
                    </Link>
                    {peer.isHost && (
                      <span className="bg-secondary rounded px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                        Chủ trận
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{peer.area}</p>
                </div>
              </div>

              <div>
                {peer.existingRating ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                      <span>{peer.existingRating.stars}</span>
                      <Star className="size-3.5 fill-current" />
                      {peer.existingRating.comment && (
                        <span className="max-w-[160px] truncate text-muted-foreground">
                          · &ldquo;{peer.existingRating.comment}&rdquo;
                        </span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openRateDialog(peer)}
                      className="h-8 rounded-full text-xs"
                    >
                      Sửa đánh giá
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => openRateDialog(peer)}
                    className="bg-brand-gradient hover:opacity-90 h-8 rounded-full px-4 text-xs font-semibold text-white shadow"
                  >
                    <Star className="mr-1.5 size-3.5 fill-current" />
                    Đánh giá
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal Chấm sao và nhận xét */}
      <Dialog open={Boolean(selectedPeer)} onOpenChange={(open) => !open && setSelectedPeer(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Đánh giá đồng đội</DialogTitle>
            <DialogDescription>
              Nhận xét cho <strong>{selectedPeer?.name}</strong> sau trận &ldquo;{match.title}&rdquo;.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 space-y-5">
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Bạn thấy đồng đội này thế nào?</p>
              <div className="mt-3 flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const active = (hoveredStars ?? stars) >= starValue;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      onMouseEnter={() => setHoveredStars(starValue)}
                      onMouseLeave={() => setHoveredStars(null)}
                      onClick={() => setStars(starValue)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={cn(
                          "size-8 transition-colors",
                          active
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30",
                        )}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs font-semibold text-amber-500">
                {stars === 5 && "Tuyệt vời, chơi rất nhiệt tình & đúng giờ!"}
                {stars === 4 && "Khá tốt, hòa đồng và thân thiện."}
                {stars === 3 && "Bình thường, đạt yêu cầu trận đấu."}
                {stars === 2 && "Cần cải thiện tinh thần đồng đội hoặc giờ giấc."}
                {stars === 1 && "Không hài lòng."}
              </p>
            </div>

            <div>
              <label
                htmlFor="ratingComment"
                className="text-xs font-semibold text-foreground"
              >
                Nhận xét chi tiết (tùy chọn)
              </label>
              <textarea
                id="ratingComment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ví dụ: Đánh rất hay, tinh thần fair-play, hẹn giao lưu trận sau..."
                className="mt-1.5 w-full rounded-xl border border-input bg-secondary/30 p-3 text-sm outline-none transition-colors focus:border-brand"
                maxLength={500}
              />
              <p className="mt-1 text-right text-[11px] text-muted-foreground">
                {comment.length}/500
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setSelectedPeer(null)}
              disabled={pending}
              className="rounded-full"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveRating}
              disabled={pending}
              className="bg-brand-gradient hover:opacity-90 rounded-full px-5 text-white"
            >
              {pending ? (
                <>
                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Gửi đánh giá"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
