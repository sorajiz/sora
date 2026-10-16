import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

const display = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pade Store · a little menu / for things you love 𐙚",
  description: "ghé một chút, chọn điều bạn thích! Bảng menu sản phẩm & dịch vụ Discord chính thức tại Pade Store.",
  metadataBase: new URL("https://menu.sorae.tokyo"),
  openGraph: {
    title: "PADE STORE · a little menu / for things you love 𐙚",
    description: "products & services, kept simple.",
    url: "https://menu.sorae.tokyo",
    siteName: "Pade Store",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PADE STORE · a little menu 𐙚",
    description: "products & services, kept simple.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`dark ${sans.variable} ${display.variable}`}>
      <body className="bg-[var(--void)] text-[var(--off-white)] antialiased min-h-screen selection:bg-[var(--silver-dim)] selection:text-[var(--void)] font-sans">
        <div className="silver-wave-deco" />
        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
