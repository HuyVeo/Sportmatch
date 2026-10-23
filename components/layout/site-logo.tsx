import Link from "next/link";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function SiteLogo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      <span className="bg-brand-gradient flex size-9 items-center justify-center rounded-xl shadow-lg shadow-brand/25">
        <Zap className="size-5 fill-white text-white" />
      </span>
      <span className="font-heading text-xl font-extrabold tracking-tight">
        Sport<span className="text-brand">Match</span>
      </span>
    </Link>
  );
}
