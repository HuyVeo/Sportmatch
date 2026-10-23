import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  CalendarDays,
  Globe,
  Lock,
  MapPin,
  Phone,
  Star,
  Users,
} from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getViewerSummary } from "@/lib/data/users";
import { RANK_TIERS } from "@/lib/ranking";
import { cn } from "@/lib/utils";

function Section({
  eyebrow,
  title,
  description,
  visual,
  reversed = false,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  visual: ReactNode;
  reversed?: boolean;
}) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className={reversed ? "lg:order-2" : undefined}>
          <p className="text-brand text-sm font-semibold tracking-wide uppercase">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        <div className={reversed ? "lg:order-1" : undefined}>{visual}</div>
      </div>
    </section>
  );
}

function PlayerCard({
  name,
  area,
  sport,
  level,
  stars,
  online,
}: {
  name: string;
  area: string;
  sport: string;
  level: string;
  stars: number;
  online: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="bg-brand-gradient flex size-11 items-center justify-center rounded-full text-lg">
            {sport === "Cầu lông" ? "🏸" : "🏓"}
          </div>
          {online && (
            <span className="border-card absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full border-2 bg-green-500" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-heading font-bold">{name}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            {area}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
          {sport}
        </span>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
          {level}
        </span>
        <span className="text-brand ml-auto flex items-center gap-1 text-xs font-semibold">
          <Star className="size-3 fill-current" />
          {stars.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

function MatchCard({
  title,
  sport,
  court,
  time,
  joined,
  total,
}: {
  title: string;
  sport: string;
  court: string;
  time: string;
  joined: number;
  total: number;
}) {
  const remaining = total - joined;
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="bg-brand/5 flex items-start gap-3 p-4">
        <div className="bg-brand-gradient flex size-11 shrink-0 items-center justify-center rounded-xl text-lg">
          {sport === "Cầu lông" ? "🏸" : "🏓"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading font-bold">{title}</p>
          <p className="text-xs text-muted-foreground">{sport}</p>
        </div>
        {remaining > 0 && (
          <span className="bg-success-muted text-success rounded-full px-2.5 py-1 text-xs font-semibold">
            Còn chỗ
          </span>
        )}
      </div>
      <div className="space-y-2 p-4 pt-3">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4" />
          {time}
        </p>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4" />
          {court}
        </p>
        <div className="pt-1">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="size-4" />
              {joined}/{total} người
            </span>
            <span className="text-brand font-semibold">
              Còn {remaining} chỗ
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="bg-brand-gradient h-full rounded-full"
              style={{ width: `${(joined / total) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const visibilityModes = [
  {
    icon: Globe,
    title: "Công khai",
    description:
      "Trận hiển thị trên bảng trận để mọi người gửi yêu cầu tham gia.",
  },
  {
    icon: Users,
    title: "Theo lời mời",
    description: "Chỉ người được mời hoặc đã tham gia mới xem được trận.",
  },
  {
    icon: Lock,
    title: "Riêng tư",
    description: "Tạo nhóm kín, có thể mời thêm người vào sau.",
  },
];

const trustBars = [
  { label: "Độ tin cậy", value: 96 },
  { label: "Hoàn thành trận", value: 91 },
  { label: "Đánh giá cộng đồng", value: 88 },
];

const tierStyles = [
  "from-zinc-400 to-zinc-500",
  "from-emerald-400 to-emerald-600",
  "from-sky-400 to-sky-600",
  "from-violet-400 to-violet-600",
  "from-amber-400 to-orange-600",
];

const scoreFormula = [
  { label: "Điểm đánh giá", formula: "Sao trung bình × 30" },
  { label: "Điểm trận đấu", formula: "Số trận × 1.5" },
  { label: "Điểm uy tín", formula: "Uy tín × 0.4" },
  { label: "Điểm cộng đồng", formula: "Votes × 2" },
];

export default async function LandingPage() {
  // Đã đăng nhập → nút dẫn thẳng vào app thay vì "Đăng nhập"/"Đăng ký".
  const viewer = await getViewerSummary();

  return (
    <>
      <SiteHeader viewer={viewer} />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 right-0 size-[34rem] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.22),transparent_65%)] blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-52 -left-32 size-[30rem] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.14),transparent_65%)] blur-2xl"
          />

          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-6 pt-20 pb-24 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-sm text-muted-foreground">
                <span className="bg-success size-1.5 rounded-full" />
                Cầu lông · Pickleball
              </span>

              <h1 className="mt-6 text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Tìm cộng đồng
                <br />
                <span className="text-brand-gradient">thể thao</span> phù hợp
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
                Tạo trận tại sân gần bạn, ghép cặp với người chơi cùng trình độ và
                xây dựng uy tín qua từng trận đã ra sân.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href={viewer ? "/discover" : "/register"}
                  className="bg-brand-gradient shadow-brand/30 inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white shadow-xl transition-opacity hover:opacity-90"
                >
                  {viewer ? "Vào SportMatch" : "Bắt đầu miễn phí"}
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href={viewer ? "/matches/create" : "/login"}
                  className="inline-flex items-center rounded-full border border-border px-7 py-3.5 font-semibold transition-colors hover:bg-secondary"
                >
                  {viewer ? "Tạo trận" : "Đăng nhập"}
                </Link>
              </div>

              <dl className="mt-12 grid max-w-md grid-cols-3 gap-4">
                {[
                  { value: "2 môn", label: "Cầu lông & Pickleball" },
                  { value: "5 cấp bậc", label: "Từ Tân binh tới Huyền thoại" },
                  { value: "100%", label: "Uy tín từ trận thật" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dt className="font-heading text-2xl font-extrabold">
                      {stat.value}
                    </dt>
                    <dd className="text-sm text-muted-foreground">
                      {stat.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative">
              <div className="space-y-4">
                <MatchCard
                  title="Cầu lông - Cầu giấy sport center"
                  sport="Cầu lông"
                  court="Cầu giấy sport center"
                  time="2026-09-21 · 20:00"
                  joined={1}
                  total={4}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <PlayerCard
                    name="Minh Anh"
                    area="Cầu Giấy"
                    sport="Cầu lông"
                    level="Trung cấp"
                    stars={4.8}
                    online
                  />
                  <PlayerCard
                    name="Quốc Bảo"
                    area="Đống Đa"
                    sport="Pickleball"
                    level="Mới chơi"
                    stars={4.5}
                    online={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <Section
          eyebrow="Khám phá"
          title="Mạng lưới vận động viên sống động quanh bạn"
          description="Lọc theo môn, trình độ, khoảng cách và lịch rảnh để tìm đúng người chơi hợp gu. Chấm xanh cho biết ai đang online và sẵn sàng ra sân."
          visual={
            <div className="grid gap-4 sm:grid-cols-2">
              <PlayerCard
                name="Thu Hà"
                area="Ba Đình"
                sport="Cầu lông"
                level="Chuyên nghiệp"
                stars={4.9}
                online
              />
              <PlayerCard
                name="Đức Huy"
                area="Thanh Xuân"
                sport="Pickleball"
                level="Trung cấp"
                stars={4.6}
                online
              />
              <PlayerCard
                name="Lan Chi"
                area="Hai Bà Trưng"
                sport="Cầu lông"
                level="Mới chơi"
                stars={4.3}
                online={false}
              />
              <PlayerCard
                name="Tuấn Kiệt"
                area="Nam Từ Liêm"
                sport="Pickleball"
                level="Chuyên nghiệp"
                stars={5.0}
                online
              />
            </div>
          }
        />

        <Section
          reversed
          eyebrow="Trận đấu"
          title="Biến các kết nối thành trận đấu thật"
          description="Mỗi trận hiển thị rõ sân, giờ, số chỗ còn lại và ai đã tham gia. Gửi lời mời hoặc xin vào trận chỉ bằng một chạm."
          visual={
            <div className="space-y-4">
              <MatchCard
                title="Pickleball - Sân Mỹ Đình"
                sport="Pickleball"
                court="Sân Mỹ Đình"
                time="2026-09-22 · 18:30"
                joined={3}
                total={4}
              />
              <MatchCard
                title="Cầu lông - NTĐ Trịnh Hoài Đức"
                sport="Cầu lông"
                court="NTĐ Trịnh Hoài Đức"
                time="2026-09-23 · 19:00"
                joined={2}
                total={6}
              />
            </div>
          }
        />

        <Section
          eyebrow="Điều phối"
          title="Điều phối trận đấu không hề đứt mạch"
          description="Chọn đúng mức hiển thị cho từng trận: mở cho cả cộng đồng, giới hạn trong danh sách mời, hoặc giữ kín trong nhóm của bạn."
          visual={
            <div className="space-y-3">
              {visibilityModes.map((mode) => (
                <div
                  key={mode.title}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5"
                >
                  <div className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-xl">
                    <mode.icon className="size-5" />
                  </div>
                  <div>
                    <p className="font-heading font-bold">{mode.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {mode.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          }
        />

        <section className="mx-auto w-full max-w-6xl px-6 py-16" id="uy-tin">
          <div className="text-center">
            <p className="text-brand text-sm font-semibold tracking-wide uppercase">
              Uy tín
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Uy tín được tạo từ hoạt động thật
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-muted-foreground">
              Không mua được, không tự phong. Điểm của bạn tăng theo số trận đã
              chơi, đánh giá từ đồng đội và mức độ giữ lời hẹn ra sân.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {RANK_TIERS.map((tier, index) => (
              <div
                key={tier.name}
                className="rounded-2xl border border-border bg-card p-5 text-center"
              >
                <div
                  className={cn(
                    "font-heading mx-auto flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-extrabold text-white",
                    tierStyles[index],
                  )}
                >
                  {index + 1}
                </div>
                <p className="mt-4 font-heading font-bold">{tier.name}</p>
                <p className="mt-1 text-sm font-semibold text-muted-foreground">
                  ≥ {tier.minScore} điểm
                </p>
              </div>
            ))}
          </div>
        </section>

        <Section
          reversed
          eyebrow="Sân bãi"
          title="Tìm sân đấu và khu vực để ra trận"
          description="Xem sân trên bản đồ theo vị trí hiện tại, kèm giá theo giờ, môn thể thao được hỗ trợ và trạng thái mở cửa. Gọi điện hoặc nhắn tin ngay từ thẻ sân."
          visual={
            <div className="space-y-4">
              {[
                {
                  name: "Cầu giấy sport center",
                  area: "Cầu Giấy",
                  price: "120.000đ/giờ",
                  sports: "Cầu lông",
                },
                {
                  name: "Sân Mỹ Đình",
                  area: "Nam Từ Liêm",
                  price: "150.000đ/giờ",
                  sports: "Pickleball",
                },
              ].map((court) => (
                <div
                  key={court.name}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-heading font-bold">{court.name}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="size-3.5" />
                        {court.area}
                      </p>
                    </div>
                    <span className="bg-success-muted text-success rounded-full px-2.5 py-1 text-xs font-semibold">
                      Mở cửa
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                        {court.sports}
                      </span>
                      <span className="text-brand text-sm font-semibold">
                        {court.price}
                      </span>
                    </div>
                    <span className="text-muted-foreground flex size-8 items-center justify-center rounded-full border border-border">
                      <Phone className="size-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          }
        />

        <Section
          eyebrow="Hồ sơ"
          title="Từ hồ sơ cá nhân đến uy tín rõ ràng"
          description="Hồ sơ hiển thị trình độ từng môn, lịch rảnh trong tuần và chi tiết uy tín được tách thành từng phần để người chơi khác biết rõ họ đang ghép với ai."
          visual={
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="font-heading font-bold">Chi tiết uy tín</p>
              <div className="mt-5 space-y-5">
                {trustBars.map((bar) => (
                  <div key={bar.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{bar.label}</span>
                      <span className="font-semibold">{bar.value}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="bg-brand-gradient h-full rounded-full"
                        style={{ width: `${bar.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
        />

        <Section
          reversed
          eyebrow="Cộng đồng"
          title="Những cộng đồng mạnh luôn dễ nhìn thấy"
          description="Bảng xếp hạng dùng đúng một công thức minh bạch cho tất cả mọi người. Bạn luôn biết mình đang đứng ở đâu và cần gì để lên hạng."
          visual={
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="font-heading font-bold">Công thức tính điểm</p>
              <div className="mt-5 space-y-3">
                {scoreFormula.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3"
                  >
                    <span className="text-sm text-muted-foreground">
                      {item.label}
                    </span>
                    <span className="font-heading text-sm font-bold">
                      {item.formula}
                    </span>
                  </div>
                ))}
                <div className="bg-brand-gradient flex items-center justify-between rounded-xl px-4 py-3 text-white">
                  <span className="text-sm font-medium">Tổng điểm</span>
                  <span className="font-heading text-sm font-bold">
                    Tổng 4 thành phần
                  </span>
                </div>
              </div>
            </div>
          }
        />

        <section className="relative overflow-hidden px-6 py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 size-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.18),transparent_65%)] blur-2xl"
          />
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Sẵn sàng ra sân hôm nay?
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Tạo tài khoản, chọn môn và trình độ, rồi tìm trận đầu tiên trong
              khu vực của bạn.
            </p>
            <Link
              href={viewer ? "/matches" : "/register"}
              className="bg-brand-gradient shadow-brand/30 mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 font-semibold text-white shadow-xl transition-opacity hover:opacity-90"
            >
              {viewer ? "Tìm trận ngay" : "Đăng ký miễn phí"}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter viewerId={viewer?.id ?? null} />
    </>
  );
}
