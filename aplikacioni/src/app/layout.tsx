import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getServerSession } from "next-auth";
import "./globals.css";
import { Hyrja } from "@/components/Hyrja";
import { OfruesiSesionit } from "@/components/OfruesiSesionit";
import Pwa from "@/components/Pwa";
import PerpunuesKerkesave from "@/components/PerpunuesKerkesave";
import { authOptions } from "@/lib/auth";


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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="sq" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <OfruesiSesionit session={session}>
          <header style={{ padding: "0.75rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee" }}>
            <strong>RideShare</strong>
            <Hyrja />
          </header>
          {children}
          <Pwa />
          <PerpunuesKerkesave />
        </OfruesiSesionit>
      </body>
    </html>
  );
}
