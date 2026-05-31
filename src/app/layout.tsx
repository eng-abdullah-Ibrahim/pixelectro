import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// تعديل الـ Metadata ليعبر عن الهوية الحقيقية للمشروع
export const metadata: Metadata = {
  title: "Pixelectro | Where Vision Becomes Reality",
  description: "Pixelectro digital studio and production platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* تمرير الخطوط وتنعيم المظهر جوه الـ body لضمان حقن السكريبتات ونظافة التصميم */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}