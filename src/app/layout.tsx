import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";

const geist = Geist({ variable: "--font-geist", subsets: ["latin", "cyrillic"] });

export async function generateMetadata(): Promise<Metadata> {
  const s = await prisma.siteSettings.findUnique({ where: { id: "main" } }).catch(() => null);
  const name = s?.heroTitle || "KRZME HOME";
  return {
    title: { default: `${name} — товары для дома`, template: `%s | ${name}` },
    description: s?.metaDesc || "Интернет-магазин товаров для дома. Декор, текстиль, посуда с доставкой по всей России.",
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await prisma.siteSettings.findUnique({ where: { id: "main" } }).catch(() => null);
  const storeName = s?.heroTitle || "KRZME HOME";

  return (
    <html lang="ru" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-geist)]">
        {/* Background layers */}
        <div aria-hidden className="fixed inset-0 -z-10 bg-[#0a0a0a]" />
        <div aria-hidden className="fixed inset-0 -z-10" style={{background:"radial-gradient(ellipse 80% 45% at 50% -5%, rgba(59,130,246,0.18) 0%, transparent 70%), radial-gradient(ellipse 50% 30% at 10% 100%, rgba(59,130,246,0.06) 0%, transparent 60%), radial-gradient(ellipse 50% 30% at 90% 100%, rgba(59,130,246,0.05) 0%, transparent 60%)"}} />
        <div aria-hidden className="fixed inset-0 -z-10" style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M0 20 L20 0 L40 20 L20 40 Z' fill='none' stroke='%233b82f6' stroke-opacity='0.07' stroke-width='0.5'/%3E%3C/svg%3E\")", backgroundSize:"40px 40px"}} />
        <Header storeName={storeName} />
        <div className="flex-1">{children}</div>
        <Footer storeName={storeName} phone={s?.phone} email={s?.email} socialVk={s?.socialVk} socialTg={s?.socialTg} />
      </body>
    </html>
  );
}
