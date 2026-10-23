"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, Mail, User } from "lucide-react";
import { registerAction, type AuthFormState } from "@/app/(auth)/actions";
import { PasswordInput } from "@/components/auth/password-input";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    registerAction,
    undefined,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Họ và tên
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="name"
            name="name"
            required
            placeholder="Nguyen Van A"
            className="h-12 w-full rounded-xl border border-input bg-secondary/40 pr-4 pl-11 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Địa chỉ email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="email"
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="h-12 w-full rounded-xl border border-input bg-secondary/40 pr-4 pl-11 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Mật khẩu</label>
        <PasswordInput
          name="password"
          placeholder="Tối thiểu 8 ký tự, có chữ hoa và số"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Xác nhận mật khẩu</label>
        <PasswordInput
          name="confirmPassword"
          placeholder="Nhập lại mật khẩu"
          withToggle={false}
        />
      </div>

      {state?.error ? (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="bg-brand-gradient shadow-brand/30 flex h-13 w-full items-center justify-center gap-2 rounded-full font-semibold text-white shadow-xl transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        <ArrowRight className="size-4" />
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Khi đăng ký, bạn đồng ý với{" "}
        <Link href="/register" className="text-brand font-semibold">
          Điều khoản
        </Link>{" "}
        &amp;{" "}
        <Link href="/register" className="text-brand font-semibold">
          Chính sách riêng tư
        </Link>
      </p>
    </form>
  );
}
