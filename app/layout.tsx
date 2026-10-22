import type { Metadata } from "next";
import { DotGothic16, Press_Start_2P } from "next/font/google";
import "./globals.css";

// レトロゲーム風の見た目用。日本語はドット絵フォント、英字見出しはファミコン世代のビットマップ書体
const dotGothic = DotGothic16({
  weight: "400",
  subsets: ["latin"],
  preload: false,
  variable: "--font-dot-gothic",
  display: "swap",
});

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
  display: "swap",
});

export const metadata: Metadata = {
  title: "S.Fukui",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${dotGothic.variable} ${pressStart.variable}`}>
      <body>{children}</body>
    </html>
  );
}
