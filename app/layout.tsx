import type { Metadata } from "next";
import { Be_Vietnam_Pro, Nunito } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const bodyFont = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
});

const displayFont = Nunito({
  variable: "--font-display",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "SportMatch — Tìm cộng đồng thể thao phù hợp",
  description:
    "Tạo trận đấu tại sân thể thao và ghép cặp với người chơi cầu lông, pickleball gần bạn.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
