"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { loginAction, type AuthFormState } from "@/app/(auth)/actions";
import { PasswordInput } from "@/components/auth/password-input";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    loginAction,
    undefined,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
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
        <PasswordInput name="password" placeholder="Nhập mật khẩu" />
      </div>

      <div className="flex justify-end">
        <Link href="/login" className="text-brand text-sm font-semibold">
          Quên mật khẩu?
        </Link>
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
        {pending ? "Đang đăng nhập..." : "Đăng nhập"}
        <ArrowRight className="size-4" />
      </button>
    </form>
  );
}
