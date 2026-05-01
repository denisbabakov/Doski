export const dynamic = "force-dynamic";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/store/ProductCard";
import RevealSection from "@/components/store/RevealSection";
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from "lucide-react";

async function getFeaturedProducts() {
  try {
    return await prisma.product.findMany({
      where: { isFeatured: true, isVisible: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    });
  } catch { return []; }
}

async function getNewProducts() {
  try {
    return await prisma.product.findMany({
      where: { isNew: true, isVisible: true },
      take: 4,
      orderBy: { createdAt: "desc" },
    });
  } catch { return []; }
}

async function getCategories() {
  try {
    return await prisma.category.findMany({
      where: { isVisible: true, parentId: null },
      orderBy: { sortOrder: "asc" },
      take: 6,
    });
  } catch { return []; }
}

async function getSiteSettings() {
  try {
    return await prisma.siteSettings.findUnique({ where: { id: "main" } });
  } catch { return null; }
}


export default async function HomePage() {
  const [featured, newProducts, categories, settings] = await Promise.all([
    getFeaturedProducts(),
    getNewProducts(),
    getCategories(),
    getSiteSettings(),
  ]);

  const heroImage = settings?.heroImage || "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=1920&q=80";
  const storeName = settings?.heroTitle || "KRZME HOME";
  const heroSubtitle = settings?.heroSubtitle || "Стальные разделочные доски, подносы и аксессуары для современной кухни";
  const bgImageNew = settings?.bgImageNew || "/kitchen-bg.jpg";

  return (
    <main>

      {/* Hero */}
      <section className="relative h-[90vh] min-h-[560px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-[#3b82f6] mb-6">
              Официальный магазин
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight">
              {storeName}
            </h1>
            <p className="mt-6 text-base sm:text-lg text-[#aaa] max-w-lg leading-relaxed">{heroSubtitle}</p>
            <div className="flex flex-col sm:flex-row gap-3 mt-10">
              <Link href="/catalog" className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white font-semibold px-8 py-3.5 transition-all text-sm tracking-wide uppercase hover:bg-white hover:text-black">
                Смотреть каталог <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/catalog?filter=new" className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white font-semibold px-8 py-3.5 transition-all text-sm tracking-wide uppercase hover:bg-white hover:text-black">
                Новинки
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <RevealSection>
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#3b82f6] mb-2">Ассортимент</p>
                <h2 className="text-3xl font-bold text-white">Категории</h2>
              </div>
              <Link href="/catalog" className="text-sm text-[#999] hover:text-white transition-colors flex items-center gap-1">
                Все <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {categories.map((cat) => {
                const isUrl = cat.image && (cat.image.startsWith("http") || cat.image.startsWith("/"));
                return (
                  <Link key={cat.id} href={`/catalog?category=${cat.slug}`} className="group relative overflow-hidden bg-[#111] border border-[#1f1f1f] hover:border-[#3b82f6]/50 transition-all text-center aspect-square flex flex-col">
                    <div className="flex-1 relative overflow-hidden">
                      {isUrl ? (
                        <Image src={cat.image!} alt={cat.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-75 group-hover:brightness-90" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-[#444]">{cat.image || "📁"}</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <span className="text-xs font-semibold text-white tracking-wide uppercase line-clamp-2">{cat.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </RevealSection>
      )}



      {/* Featured products */}
      {featured.length > 0 && (
        <RevealSection>
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#3b82f6] mb-2">Популярное</p>
                <h2 className="text-3xl font-bold text-white">Хиты продаж</h2>
              </div>
              <Link href="/catalog?filter=featured" className="text-sm text-[#999] hover:text-white transition-colors flex items-center gap-1">
                Все <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {featured.map((p) => <ProductCard key={p.id} {...p} />)}
            </div>
          </section>
        </RevealSection>
      )}


      {/* Promo */}
      <RevealSection>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="relative overflow-hidden bg-[#111] border border-[#1f1f1f] p-10 sm:p-14 flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/5 to-transparent pointer-events-none" />
            <div className="relative">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#3b82f6] mb-3">Специальное предложение</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Скидка 15% на первый заказ</h3>
              <p className="text-[#999] text-sm">Зарегистрируйтесь и получите промокод на почту</p>
            </div>
            <Link href="/account" className="relative shrink-0 bg-[#3b82f6] hover:bg-[#2563eb] text-black font-semibold px-8 py-3.5 transition-colors text-sm tracking-wide uppercase">
              Получить скидку
            </Link>
          </div>
        </section>
      </RevealSection>

      {/* New products */}
      {newProducts.length > 0 && (
        <RevealSection>
          <section className="relative py-16">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:`url('${bgImageNew}')`}} />
            <div className="absolute inset-0 bg-black/75" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#3b82f6] mb-2">Только что</p>
                  <h2 className="text-3xl font-bold text-white">Новинки</h2>
                </div>
                <Link href="/catalog?filter=new" className="text-sm text-[#999] hover:text-white transition-colors flex items-center gap-1">
                  Все <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {newProducts.map((p) => <ProductCard key={p.id} {...p} />)}
              </div>
            </div>
          </section>
        </RevealSection>
      )}


      {/* Features */}
      <RevealSection>
        <section className="border-t border-[#1a1a1a] mt-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#1a1a1a]">
              {[
                { icon: Truck, title: "Быстрая доставка", text: "По всей России от 1 дня" },
                { icon: Shield, title: "Гарантия качества", text: "Только проверенные товары" },
                { icon: RefreshCw, title: "Лёгкий возврат", text: "30 дней без вопросов" },
                { icon: Headphones, title: "Поддержка", text: "Всегда на связи" },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex flex-col items-center text-center p-8 bg-[#0a0a0a]">
                  <Icon className="w-6 h-6 text-[#3b82f6] mb-4" />
                  <h4 className="font-semibold text-white text-sm mb-1">{title}</h4>
                  <p className="text-xs text-[#999]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

    </main>
  );
}
