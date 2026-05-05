export const dynamic = "force-dynamic";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/store/ProductCard";
import RevealSection from "@/components/store/RevealSection";
import StatsCounter from "@/components/store/StatsCounter";
import HeroPanels from "@/components/ui/HeroPanels";
import { ArrowRight, Truck, Shield, Headphones } from "lucide-react";

async function getFeaturedProducts() {
  try { return await prisma.product.findMany({ where: { isFeatured: true, isVisible: true }, take: 8, orderBy: { createdAt: "desc" } }); }
  catch { return []; }
}
async function getNewProducts() {
  try { return await prisma.product.findMany({ where: { isNew: true, isVisible: true }, take: 4, orderBy: { createdAt: "desc" } }); }
  catch { return []; }
}
async function getCategories() {
  try { return await prisma.category.findMany({ where: { isVisible: true, parentId: null }, orderBy: { sortOrder: "asc" }, take: 6 }); }
  catch { return []; }
}
async function getSiteSettings() {
  try { return await prisma.siteSettings.findUnique({ where: { id: "main" } }); }
  catch { return null; }
}

export default async function HomePage() {
  const [featured, newProducts, categories, settings] = await Promise.all([
    getFeaturedProducts(), getNewProducts(), getCategories(), getSiteSettings(),
  ]);

  const heroImage   = settings?.heroImage   || "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=80";
  const storeName   = settings?.heroTitle   || "AQUA STEEL";
  const heroSubtitle = settings?.heroSubtitle || "Банные чаны, аква бласт и товары для дома — сталь, огонь, вода";
  const bgImageNew  = settings?.bgImageNew  || "/kitchen-bg.jpg";
  const [word1, word2] = storeName.split(" ");

  return (
    <main>

      {/* ══ HERO — panel assembly ══ */}
      <section className="relative h-screen min-h-[640px] flex items-end overflow-hidden">

        {/* Assembled image panels */}
        <HeroPanels imageUrl={heroImage} />

        {/* Colour overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/55 to-black/20 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f] via-transparent to-transparent z-10" />
        {/* Ambient amber blob */}
        <div className="absolute left-[-4%] top-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-[rgba(232,160,32,0.08)] blur-[120px] z-10 pointer-events-none" />

        {/* Content */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 pb-20 sm:pb-28">
          <span className="section-label hero-a inline-block">Официальный магазин</span>

          <h1 className="font-[family-name:var(--font-exo)] font-black leading-none tracking-tight mt-3">
            <span className="hero-b block text-[clamp(3.5rem,10vw,8.5rem)] text-white">{word1 || storeName}</span>
            {word2 && (
              <span className="hero-c block text-[clamp(3.5rem,10vw,8.5rem)] text-[var(--amber)] text-sky-glow">
                {word2}
              </span>
            )}
          </h1>

          <div className="hero-d mt-6 flex items-center gap-4">
            <span className="amber-line !m-0" />
            <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-md leading-relaxed">{heroSubtitle}</p>
          </div>

          <div className="hero-e flex flex-wrap gap-3 mt-10">
            <Link href="/catalog" className="btn-primary">
              Смотреть каталог <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/catalog?filter=new" className="btn-secondary">
              Новинки сезона
            </Link>
          </div>
        </div>

        {/* Decorative vertical line */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3 z-20">
          <div className="w-px h-24 bg-gradient-to-b from-transparent to-[var(--amber)]" />
          <span className="text-[10px] font-bold tracking-[0.3em] text-[var(--amber)] uppercase" style={{writingMode:"vertical-rl"}}>scroll</span>
          <div className="w-px h-24 bg-gradient-to-t from-transparent to-[var(--amber)]" />
        </div>
      </section>

      {/* ══ STATS ══ */}
      <RevealSection>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <StatsCounter />
        </section>
      </RevealSection>

      {/* ══ CATEGORIES ══ */}
      {categories.length > 0 && (
        <RevealSection>
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="section-label">Ассортимент</span>
                <h2 className="text-3xl font-bold font-[family-name:var(--font-exo)] text-white">Категории</h2>
              </div>
              <Link href="/catalog" className="link-amber text-sm flex items-center gap-1">
                Все <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {categories.map((cat, idx) => {
                const isUrl = cat.image && (cat.image.startsWith("http") || cat.image.startsWith("/"));
                return (
                  <Link key={cat.id} href={`/catalog?category=${cat.slug}`}
                    className="card-steel group relative overflow-hidden text-center aspect-square flex flex-col"
                    style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div className="flex-1 relative overflow-hidden">
                      {isUrl ? (
                        <Image src={cat.image!} alt={cat.name} fill
                          className="object-cover brightness-70 group-hover:brightness-90 group-hover:scale-106 transition-all duration-500"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-[var(--border-hi)]">
                          {cat.image || "📁"}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <span className="text-xs font-bold text-white tracking-widest uppercase line-clamp-2">{cat.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </RevealSection>
      )}

      {/* ══ FEATURED ══ */}
      {featured.length > 0 && (
        <RevealSection>
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="section-label">Популярное</span>
                <h2 className="text-3xl font-bold font-[family-name:var(--font-exo)] text-white">Хиты продаж</h2>
              </div>
              <Link href="/catalog?filter=featured" className="link-amber text-sm flex items-center gap-1">
                Все <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {featured.map((p) => <ProductCard key={p.id} {...p} />)}
            </div>
          </section>
        </RevealSection>
      )}

      {/* ══ PROMO BANNER ══ */}
      <RevealSection>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="stripe-bg relative overflow-hidden bg-[var(--bg-card-2)] border border-[var(--border-hi)] p-10 sm:p-14 flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--sky-glow)] to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--blue-glow)] rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <span className="section-label">Специальное предложение</span>
              <h3 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-exo)] text-white mb-2">
                Скидка 15% на первый заказ
              </h3>
              <p className="text-[var(--text-muted)] text-sm">Зарегистрируйтесь и получите промокод на почту</p>
            </div>
            <Link href="/account" className="btn-primary relative shrink-0">
              Получить скидку
            </Link>
          </div>
        </section>
      </RevealSection>

      {/* ══ NEW PRODUCTS ══ */}
      {newProducts.length > 0 && (
        <RevealSection>
          <section className="relative py-24">
            <div className="absolute inset-0 bg-cover bg-center bg-fixed" style={{backgroundImage:`url('${bgImageNew}')`}} />
            <div className="absolute inset-0 bg-black/82" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <span className="section-label">Только что</span>
                  <h2 className="text-3xl font-bold font-[family-name:var(--font-exo)] text-white">Новинки</h2>
                </div>
                <Link href="/catalog?filter=new" className="link-amber text-sm flex items-center gap-1">
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

      {/* ══ WHY US ══ */}
      <RevealSection>
        <section className="border-t border-[var(--border)] mt-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
            <div className="text-center mb-14">
              <span className="section-label">Почему мы</span>
              <h2 className="text-3xl font-bold font-[family-name:var(--font-exo)] text-white">Наши преимущества</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--border)]">
              {[
                { icon: Truck,       title: "Быстрая доставка",  text: "По всей России от 1 дня" },
                { icon: Shield,      title: "Гарантия качества", text: "Только проверенные товары" },
{ icon: Headphones,  title: "Поддержка",          text: "Всегда на связи" },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="group flex flex-col items-center text-center p-10 bg-[var(--bg-card)] hover:bg-[var(--bg-card-2)] transition-colors cursor-default">
                  <div className="w-12 h-12 border border-[var(--border)] group-hover:border-[var(--amber)] flex items-center justify-center mb-5 transition-colors">
                    <Icon className="w-5 h-5 text-[var(--amber)]" />
                  </div>
                  <h4 className="font-bold text-white text-sm mb-2 tracking-wide uppercase">{title}</h4>
                  <p className="text-xs text-[var(--text-dim)] leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

    </main>
  );
}
