"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  Camera,
  Crosshair,
  Loader2,
  Save,
  Shield,
  Trophy,
  User as UserIcon,
} from "lucide-react";
import {
  changePasswordAction,
  saveProfileAction,
} from "@/app/(app)/settings/actions";
import { locateAreaAction } from "@/app/onboarding/actions";
import { AvatarPicker } from "@/components/profile/avatar-picker";
import { useToast } from "@/components/ui/toast";
import { UserAvatar } from "@/components/ui/user-avatar";
import { getBrowserPosition } from "@/lib/browser-location";
import { removeProfileImage } from "@/lib/profile-upload";
import {
  AvailabilityEditor,
  type SlotRow,
} from "@/components/settings/availability-editor";
import { SportProfileEditor } from "@/components/settings/sport-profile-editor";
import {
  minutesToTime,
  timeToMinutes,
  validateSlotDrafts,
} from "@/lib/availability";
import type { AvailabilitySlot, Gender, UserSport } from "@/lib/types";
import { cn } from "@/lib/utils";

export type SettingsUser = {
  name: string;
  avatar: string;
  avatarUrl: string | null;
  area: string;
  gender: Gender | "";
  birthday: string;
  bio: string;
  sports: UserSport[];
  availabilitySlots: AvailabilitySlot[];
};

const TABS = [
  { id: "profile", label: "Hồ sơ", icon: UserIcon },
  { id: "notifications", label: "Thông báo", icon: Bell },
  { id: "security", label: "Bảo mật", icon: Shield },
] as const;

const GENDERS: Gender[] = ["Nam", "Nữ", "Khác"];

const NOTIFICATION_SETTINGS = [
  { id: "invites", label: "Lời mời trận đấu", detail: "Khi có người mời bạn vào trận" },
  { id: "joins", label: "Yêu cầu tham gia", detail: "Khi có người xin vào trận của bạn" },
  { id: "messages", label: "Tin nhắn mới", detail: "Tin nhắn từ chủ trận hoặc team" },
  { id: "ratings", label: "Đánh giá mới", detail: "Khi đồng đội đánh giá bạn sau trận" },
];

export function SettingsPanel({
  user,
  sports,
}: {
  user: SettingsUser;
  sports: { id: string; name: string; icon: string }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("profile");
  const [avatar, setAvatar] = useState(user.avatar);
  // Ảnh upload được lưu ngay; chọn avatar hệ thống chỉ bỏ ảnh khi bấm Lưu.
  const [photoUrl, setPhotoUrl] = useState(user.avatarUrl);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [showAvatars, setShowAvatars] = useState(false);
  const [name, setName] = useState(user.name);
  const [area, setArea] = useState(user.area);
  const [located, setLocated] = useState<{
    area: string;
    coords: { lat: number; lng: number };
  } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender | "">(user.gender);
  const [birthday, setBirthday] = useState(user.birthday);
  const [bio, setBio] = useState(user.bio);
  const [userSports, setUserSports] = useState<UserSport[]>(user.sports);
  const [slots, setSlots] = useState<SlotRow[]>(() =>
    user.availabilitySlots.map((slot, index) => ({
      key: `saved-${index}`,
      day: slot.day,
      start: minutesToTime(slot.startMinute),
      end: minutesToTime(slot.endMinute),
    })),
  );
  const slotErrors = validateSlotDrafts(slots);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<string[]>(
    NOTIFICATION_SETTINGS.map((item) => item.id),
  );
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  // State cho chức năng đổi mật khẩu
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwPending, startPwTransition] = useTransition();

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có tối thiểu 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    startPwTransition(async () => {
      const res = await changePasswordAction({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (!res.ok) {
        toast.error(res.error ?? "Không thể đổi mật khẩu.");
        return;
      }

      toast.success("Đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    });
  }

  async function detectArea() {
    setLocating(true);
    setLocateError(null);
    try {
      const coords = await getBrowserPosition();
      const { area: found } = await locateAreaAction(coords.lat, coords.lng);
      const label = found ?? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
      setArea(label);
      setLocated({ area: label, coords });
      if (!found) {
        setLocateError("Chưa xác định được tên khu vực — bạn có thể sửa lại.");
      }
    } catch (cause) {
      setLocateError(
        cause instanceof Error ? cause.message : "Không lấy được vị trí.",
      );
    } finally {
      setLocating(false);
    }
  }

  function pickEmoji(option: string) {
    setAvatar(option);
    if (photoUrl) setRemovePhoto(true);
  }

  function save() {
    setSaved(false);
    if (slotErrors.some(Boolean)) {
      setError("Lịch rảnh chưa hợp lệ — xem lỗi bên dưới từng khung giờ.");
      document
        .querySelector("[data-slot-error]")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await saveProfileAction({
        name: name.trim(),
        avatar,
        area: area.trim(),
        coords:
          located && located.area === area.trim() ? located.coords : null,
        gender: gender === "" ? "Khác" : gender,
        birthday,
        bio: bio.trim(),
        sports: userSports.map((entry) => ({
          sportId: entry.sportId,
          skillLevel: entry.skillLevel,
          purposes: entry.purposes,
          preferredAreas: entry.preferredAreas,
          favoriteCourtIds: entry.favoriteCourts.map((court) => court.id),
        })),
        availability: slots.map((slot) => ({
          day: slot.day,
          startMinute: timeToMinutes(slot.start) ?? -1,
          endMinute: timeToMinutes(slot.end) ?? -1,
        })),
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      if (removePhoto) {
        try {
          await removeProfileImage("avatar");
          setPhotoUrl(null);
          setRemovePhoto(false);
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : null);
          return;
        }
      }
      setSaved(true);
      // Cập nhật avatar/tên ở header.
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">
        Cài đặt tài khoản
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Cập nhật hồ sơ, môn thể thao, lịch rảnh và bảo mật tài khoản.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr] lg:items-start">
        <nav className="rounded-2xl border border-border bg-card p-2 lg:sticky lg:top-24">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                tab === item.id
                  ? "bg-brand/10 text-brand"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </button>
          ))}
        </nav>

        {tab === "profile" ? (
          // min-w-0: ô giờ/ô nhập có bề rộng tối thiểu riêng, không để chúng
          // kéo giãn cột grid trên màn hình hẹp.
          <div className="min-w-0 space-y-6">
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-heading text-lg font-bold">Ảnh đại diện</h2>
              <div className="mt-5 flex flex-wrap items-center gap-5">
                <UserAvatar
                  emoji={avatar}
                  src={removePhoto ? null : photoUrl}
                  name={name}
                  className="bg-brand-gradient size-20 text-4xl"
                />
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAvatars((value) => !value)}
                    className="border-brand text-brand hover:bg-brand/10 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors"
                  >
                    <Camera className="size-4" />
                    Thay đổi ảnh đại diện
                  </button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Chọn từ avatar hệ thống hoặc upload ảnh của bạn (tối đa
                    5MB).
                  </p>
                </div>
              </div>

              {showAvatars ? (
                <div className="mt-6 border-t border-border pt-6">
                  <AvatarPicker
                    emoji={avatar}
                    hasPhoto={!!photoUrl && !removePhoto}
                    onPickEmoji={pickEmoji}
                    onUploaded={(url) => {
                      setPhotoUrl(url);
                      setRemovePhoto(false);
                      toast.success("Đã cập nhật ảnh đại diện.");
                      router.refresh();
                    }}
                  />
                  {removePhoto ? (
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                      Ảnh đã tải lên sẽ được thay bằng avatar này khi bạn bấm
                      &quot;Lưu thay đổi&quot;.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-heading text-lg font-bold">
                Thông tin cá nhân
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="fullName"
                    className="text-sm font-medium text-foreground"
                  >
                    Họ tên
                  </label>
                  <input
                    id="fullName"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-input bg-secondary/40 px-4 text-sm outline-none transition-colors focus:border-brand"
                  />
                </div>

                <div>
                  <label
                    htmlFor="area"
                    className="text-sm font-medium text-foreground"
                  >
                    Khu vực
                  </label>
                  <div className="mt-2 flex gap-3">
                    <input
                      id="area"
                      value={area}
                      onChange={(event) => setArea(event.target.value)}
                      className="h-12 w-full rounded-xl border border-input bg-secondary/40 px-4 text-sm outline-none transition-colors focus:border-brand"
                    />
                    <button
                      type="button"
                      onClick={detectArea}
                      disabled={locating}
                      className="border-brand text-brand hover:bg-brand/10 inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors disabled:opacity-60"
                    >
                      {locating ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Crosshair className="size-4" />
                      )}
                      Vị trí
                    </button>
                  </div>
                  {locateError ? (
                    <p role="alert" className="text-destructive mt-2 text-xs">
                      {locateError}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="gender"
                    className="text-sm font-medium text-foreground"
                  >
                    Giới tính
                  </label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(event) =>
                      setGender(event.target.value as Gender | "")
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-input bg-secondary/40 px-4 text-sm outline-none focus:border-brand"
                  >
                    <option value="">Chưa cập nhật</option>
                    {GENDERS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="birthday"
                    className="text-sm font-medium text-foreground"
                  >
                    Ngày sinh
                  </label>
                  <input
                    id="birthday"
                    type="date"
                    value={birthday}
                    onChange={(event) => setBirthday(event.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-input bg-secondary/40 px-4 text-sm outline-none transition-colors focus:border-brand"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="bio"
                  className="text-sm font-medium text-foreground"
                >
                  Bio ngắn
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={4}
                  className="mt-2 w-full resize-y rounded-xl border border-input bg-secondary/40 px-4 py-3 text-sm outline-none transition-colors focus:border-brand"
                />
              </div>
            </section>

            <section
              id="sports"
              className="scroll-mt-24 rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="font-heading flex items-center gap-2 text-lg font-bold">
                <Trophy className="text-brand size-5" />
                Môn thể thao và trình độ
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Trình độ, mục đích chơi và khu vực giúp ghép bạn với người chơi
                phù hợp.
              </p>
              <SportProfileEditor
                sports={sports}
                value={userSports}
                onChange={setUserSports}
              />
            </section>

            <section
              id="availability"
              className="scroll-mt-24 rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="font-heading flex items-center gap-2 text-lg font-bold">
                <CalendarDays className="text-brand size-5" />
                Lịch rảnh
              </h2>
              <AvailabilityEditor
                value={slots}
                errors={slotErrors}
                onChange={setSlots}
              />
            </section>

            <div className="flex flex-wrap items-center justify-end gap-4">
              {error && !pending ? (
                <span role="alert" className="text-destructive text-sm font-semibold">
                  {error}
                </span>
              ) : null}
              {saved && !pending ? (
                <span className="text-success text-sm font-semibold">
                  Đã lưu thay đổi
                </span>
              ) : null}
              <button
                type="button"
                onClick={save}
                disabled={pending}
                className="bg-brand-gradient shadow-brand/30 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-xl transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                <Save className="size-4" />
                {pending ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        ) : null}

        {tab === "notifications" ? (
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-lg font-bold">Thông báo</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Chọn loại thông báo bạn muốn nhận.
            </p>

            <ul className="mt-6 space-y-3">
              {NOTIFICATION_SETTINGS.map((item) => {
                const enabled = notifications.includes(item.id);
                return (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-border p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.detail}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      aria-label={item.label}
                      onClick={() =>
                        setNotifications((current) =>
                          enabled
                            ? current.filter((value) => value !== item.id)
                            : [...current, item.id],
                        )
                      }
                      className={cn(
                        "flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors",
                        enabled ? "bg-brand" : "bg-secondary",
                      )}
                    >
                      <span
                        className={cn(
                          "size-5 rounded-full bg-white transition-transform",
                          enabled && "translate-x-5",
                        )}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {tab === "security" ? (
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-lg font-bold">Bảo mật tài khoản</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Đổi mật khẩu định kỳ để giữ tài khoản của bạn luôn an toàn.
            </p>

            <form onSubmit={handleChangePassword} className="mt-6 max-w-lg space-y-5">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="text-sm font-medium text-foreground"
                >
                  Mật khẩu hiện tại
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                  required
                  className="mt-2 h-12 w-full rounded-xl border border-input bg-secondary/40 px-4 text-sm outline-none transition-colors focus:border-brand"
                />
              </div>
              <div>
                <label
                  htmlFor="newPassword"
                  className="text-sm font-medium text-foreground"
                >
                  Mật khẩu mới
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  required
                  minLength={6}
                  className="mt-2 h-12 w-full rounded-xl border border-input bg-secondary/40 px-4 text-sm outline-none transition-colors focus:border-brand"
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-foreground"
                >
                  Xác nhận mật khẩu mới
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                  minLength={6}
                  className="mt-2 h-12 w-full rounded-xl border border-input bg-secondary/40 px-4 text-sm outline-none transition-colors focus:border-brand"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={pwPending}
                  className="bg-brand-gradient hover:opacity-90 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow transition-opacity disabled:opacity-50"
                >
                  {pwPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    "Đổi mật khẩu"
                  )}
                </button>
              </div>
            </form>
          </section>
        ) : null}
      </div>
    </div>
  );
}
