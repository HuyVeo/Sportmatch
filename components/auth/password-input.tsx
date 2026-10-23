"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

export function PasswordInput({
  name,
  placeholder,
  withToggle = true,
}: {
  name: string;
  placeholder: string;
  withToggle?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type={visible ? "text" : "password"}
        name={name}
        required
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-input bg-secondary/40 pr-11 pl-11 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand"
      />
      {withToggle && (
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      )}
    </div>
  );
}
