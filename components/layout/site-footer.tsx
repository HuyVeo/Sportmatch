import Link from "next/link";
import { SiteLogo } from "@/components/layout/site-logo";

type FooterLink = { label: string; href: string };

const PRODUCT_LINKS: FooterLink[] = [
  { label: "Khám phá", href: "/discover" },
  { label: "Trận đấu", href: "/matches" },
  { label: "Sân bãi", href: "/courts" },
  { label: "Xếp hạng", href: "/ranking" },
];

const SPORT_LINKS: FooterLink[] = [
  { label: "Cầu lông", href: "/matches" },
  { label: "Pickleball", href: "/matches" },
];

/**
 * Các trang "Sản phẩm" cần đăng nhập: khách bấm vào sẽ được chuyển sang trang
 * Đăng nhập (proxy.ts) rồi quay lại đúng trang sau khi đăng nhập.
 */
export function SiteFooter({ viewerId }: { viewerId: string | null }) {
  const accountLinks: FooterLink[] = viewerId
    ? [
        { label: "Hồ sơ cá nhân", href: `/profile/${viewerId}` },
        { label: "Cài đặt tài khoản", href: "/settings" },
      ]
    : [
        { label: "Đăng nhập", href: "/login" },
        { label: "Đăng ký miễn phí", href: "/register" },
      ];

  const footerGroups = [
    { title: "Sản phẩm", links: PRODUCT_LINKS },
    { title: "Môn thể thao", links: SPORT_LINKS },
    { title: "Tài khoản", links: accountLinks },
  ];

  return (
    <footer className="border-t border-border/70 bg-card/40">
      <div className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="space-y-4">
            <SiteLogo />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Nền tảng giúp bạn tạo trận, tìm sân và ghép cặp với người chơi phong
              trào gần khu vực của mình.
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <p className="font-heading text-sm font-bold">{group.title}</p>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border/70 pt-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} SportMatch. Ra sân cùng cộng đồng.
        </div>
      </div>
    </footer>
  );
}
