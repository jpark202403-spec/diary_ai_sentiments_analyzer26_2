import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diary AI Sentiments Analyzer",
  description: "인공지능 기반 텍스트 감성 분석 스마트 저널링 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F7F5FA] text-[#221E2A]">
        {children}
      </body>
    </html>
  );
}
