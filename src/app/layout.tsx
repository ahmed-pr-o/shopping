import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "سوقي - تسوق من أشهر المولات في غزة",
  description:
    "منصة التسوق الإلكتروني الأولى في غزة. تسوق من أشهر المولات والمحلات بأفضل الأسعار.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
