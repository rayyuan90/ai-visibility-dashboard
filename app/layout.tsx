import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "AsterVision · AI Visibility",
  description: "AI 搜索品牌可见度分析",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
