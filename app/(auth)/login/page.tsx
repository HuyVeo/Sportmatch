import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { SiteLogo } from "@/components/layout/site-logo";

export default function LoginPage() {
  return (
    <>
      <div className="relative hidden overflow-hidden bg-[#131a2b] lg:flex lg:items-center lg:justify-center">
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 size-[28rem] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.25),transparent_65%)] blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-24 size-[26rem] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.18),transparent_65%)] blur-2xl"
        />

        <div className="relative max-w-sm px-10 text-center">
          <div className="text-7xl">🔍</div>
          <h2 className="mt-10 text-4xl font-extrabold text-white">
            Chào mừng trở lại!
          </h2>
          <p className="mt-5 leading-relaxed text-white/70">
            Cộng đồng thể thao đang chờ bạn. Đăng nhập để tìm trận và kết nối với
            người chơi gần bạn.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            {["🏸", "🏓", "⚡"].map((icon) => (
              <span
                key={icon}
                className="flex size-12 items-center justify-center rounded-xl bg-white/5 text-xl"
              >
                {icon}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <SiteLogo />

          <h1 className="mt-10 text-3xl font-extrabold">Đăng nhập</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-brand font-semibold">
              Đăng ký miễn phí
            </Link>
          </p>

          <LoginForm />
        </div>
      </div>
    </>
  );
}
