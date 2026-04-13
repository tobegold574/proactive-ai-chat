import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Proactive AI Chat | 主动对话AI",
  description: "下一代智能聊天体验 - AI会主动关心你，记得你的偏好",
  icons: {
    icon: "/sparkle.png",
    apple: "/sparkle.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="min-h-screen bg-slate-950 text-white antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
