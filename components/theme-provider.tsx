"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

// next-themes chèn <script> chặn nháy theme. Script này đã chạy từ HTML của
// server; khi render lại ở client, React 19.2 cảnh báo "Encountered a script
// tag...". Đổi type ở client để React coi là dữ liệu, không phải script — thẻ
// script của next-themes có sẵn suppressHydrationWarning nên không lệch hydrate.
const clientScriptProps =
  typeof window === "undefined" ? undefined : { type: "application/json" };

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider scriptProps={clientScriptProps} {...props}>
      {children}
    </NextThemesProvider>
  );
}
