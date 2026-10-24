import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { ButoiHyrjes } from "@/components/ButoiHyrjes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RideShare · AAB",
  description: "Aplikacioni i ndarjes së udhëtimeve për AAB",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sq" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <SessionProvider>
          <header style={{ padding: "0.75rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee" }}>
            <strong>RideShare</strong>
            <ButoiHyrjes />
          </header>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
