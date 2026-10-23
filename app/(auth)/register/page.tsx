import Link from "next/link";
import { Check } from "lucide-react";
import { RegisterForm } from "@/components/auth/register-form";
import { SiteLogo } from "@/components/layout/site-logo";

const benefits = [
  "Tham gia miễn phí mãi mãi",
  "Tìm bạn chơi cầu lông & pickleball",
  "Chat thời gian thực",
  "Xây dựng uy tín thể thao",
];

export default function RegisterPage() {
  return (
    <>
      <div className="bg-brand-gradient relative hidden overflow-hidden lg:flex lg:items-center lg:justify-center">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-20 size-80 rounded-full bg-white/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -bottom-28 size-80 rounded-full bg-white/10"
        />

        <div className="relative max-w-sm px-10 text-center">
          <div className="text-7xl">⚡</div>
          <h2 className="mt-10 text-4xl font-extrabold text-white">
            Tham gia SportMatch
          </h2>
          <p className="mt-5 leading-relaxed text-white/90">
            Tạo hồ sơ trong vài phút và bắt đầu tìm bạn chơi phù hợp ngay hôm
            nay!
          </p>
          <ul className="mt-10 space-y-3 text-left">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-white">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/25">
                  <Check className="size-3" />
                </span>
                <span className="text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <SiteLogo />

          <h1 className="mt-10 text-3xl font-extrabold">Tạo tài khoản</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-brand font-semibold">
              Đăng nhập
            </Link>
          </p>

          <RegisterForm />
        </div>
      </div>
    </>
  );
}
