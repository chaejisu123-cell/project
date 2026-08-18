import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "오퍼하우스 현장관리",
  description: "오퍼하우스 인테리어 시공 현장 관리 시스템",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-canvas text-ink">
        {children}
      </body>
    </html>
  );
}
