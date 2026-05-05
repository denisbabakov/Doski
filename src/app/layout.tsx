import type { Metadata } from "next";
import { Exo_2, Rubik } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CursorGlow from "@/components/ui/CursorGlow";
import TelegramFloat from "@/components/ui/TelegramFloat";
import { prisma } from "@/lib/prisma";

const exo2 = Exo_2({ variable: "--font-exo", subsets: ["latin", "cyrillic"], weight: ["400","600","700","800","900"] });
const rubik = Rubik({ variable: "--font-rubik", subsets: ["latin", "cyrillic"], weight: ["400","500","600","700"] });

export async function generateMetadata(): Promise<Metadata> {
  const s = await prisma.siteSettings.findUnique({ where: { id: "main" } }).catch(() => null);
  const name = s?.heroTitle || "AQUA STEEL";
  return {
    title: { default: `${name} — банные чаны и аква бласт`, template: `%s | ${name}` },
    description: s?.metaDesc || "Банные чаны, аква бласт и товары для дома. Производство и доставка по всей России.",
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await prisma.siteSettings.findUnique({ where: { id: "main" } }).catch(() => null);
  const storeName = s?.heroTitle || "AQUA STEEL";

  return (
    <html lang="ru" className={`${exo2.variable} ${rubik.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {/* Background: deep charcoal base */}
        <div aria-hidden className="fixed inset-0 -z-10 bg-[#0d0d0f]" />
        {/* Ambient glows: amber top-right (fire/warmth), blue bottom-left (water) */}
        <div aria-hidden className="fixed inset-0 -z-10" style={{background:"radial-gradient(ellipse 60% 40% at 85% -10%, rgba(232,160,32,0.12) 0%, transparent 65%), radial-gradient(ellipse 50% 35% at 15% 110%, rgba(74,158,221,0.10) 0%, transparent 60%)"}} />
        <CursorGlow />
        <Header storeName={storeName} />
        <div className="flex-1">{children}</div>
        <Footer storeName={storeName} phone={s?.phone} email={s?.email} socialVk={s?.socialVk} socialTg={s?.socialTg} />
        <TelegramFloat handle={s?.socialTg} />
      </body>
    </html>
  );
}
