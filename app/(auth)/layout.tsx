import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="grid min-h-svh flex-1 lg:grid-cols-2">{children}</div>;
}
