export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/store/ProductCard";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = { title: "Каталог" };

interface Props {
  searchParams: Promise<{ category?: string; filter?: string; page?: string; q?: string }>;
}

export default async function CatalogPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 24;

  const selectedCat = params.category
    ? await prisma.category.findUnique({
        where: { slug: params.category },
        include: { children: { where: { isVisible: true }, orderBy: { sortOrder: "asc" } } },
      })
    : null;

  const hasSubcategories = (selectedCat?.children?.length ?? 0) > 0;

  const where: Record<string, unknown> = { isVisible: true };
  if (!hasSubcategories) {
    if (selectedCat) where.categoryId = selectedCat.id;
    if (params.filter === "new") where.isNew = true;
    if (params.filter === "featured") where.isFeatured = true;
    if (params.filter === "sale") where.comparePrice = { gt: prisma.product.fields.price };
    if (params.q) where.name = { contains: params.q, mode: "insensitive" };
  }

  const [products, total, categories] = await Promise.all([
    hasSubcategories
      ? Promise.resolve([])
      : prisma.product.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
    hasSubcategories ? Promise.resolve(0) : prisma.product.count({ where }),
    prisma.category.findMany({
      where: { isVisible: true, parentId: null },
      include: { children: { where: { isVisible: true }, orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  const pageTitle = params.q
    ? `Поиск: "${params.q}"`
    : params.filter === "sale" ? "Акции"
    : params.filter === "new"  ? "Новинки"
    : selectedCat?.name || "Каталог";

  return (
    <div className="min-h-screen">

      {/* Page header */}
      <div className="page-header">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-[var(--text-dim)] mb-4">
            <Link href="/" className="hover:text-[var(--amber)] transition-colors">Главная</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[var(--text-muted)]">{pageTitle}</span>
          </nav>
          <span className="section-label">Магазин</span>
          <h1 className="text-4xl sm:text-5xl font-black font-[family-name:var(--font-exo)] text-white mt-1">
            {pageTitle}
          </h1>
          {total > 0 && (
            <p className="mt-3 text-sm text-[var(--text-dim)]">{total} товаров</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Sidebar ── */}
          <aside className="w-full lg:w-52 shrink-0">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-5 sticky top-20">
              <h3 className="text-xs font-bold tracking-widest uppercase text-[var(--text-dim)] mb-4">Категории</h3>
              <ul className="space-y-0.5">
                <li>
                  <Link href="/catalog"
                    className={`block px-3 py-2 text-sm transition-colors ${!params.category && !params.filter ? "text-[var(--amber)] bg-[var(--sky-glow)]" : "text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-card-2)]"}`}>
                    Все товары
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link href={`/catalog?category=${c.slug}`}
                      className={`block px-3 py-2 text-sm transition-colors ${params.category === c.slug ? "text-[var(--amber)] bg-[var(--sky-glow)]" : "text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-card-2)]"}`}>
                      {c.name}
                    </Link>
                    {c.children?.length > 0 && (
                      <ul className="ml-3 border-l border-[var(--border)] pl-3 space-y-0.5 mt-0.5">
                        {c.children.map((sub) => (
                          <li key={sub.id}>
                            <Link href={`/catalog?category=${sub.slug}`}
                              className={`block px-2 py-1.5 text-xs transition-colors ${params.category === sub.slug ? "text-[var(--amber)]" : "text-[var(--text-dim)] hover:text-white"}`}>
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
              <div className="my-4 border-t border-[var(--border)]" />
              <h3 className="text-xs font-bold tracking-widest uppercase text-[var(--text-dim)] mb-3">Подборки</h3>
              <ul className="space-y-0.5">
                {[
                  { label: "Новинки",    value: "new" },
                  { label: "Хиты продаж", value: "featured" },
                  { label: "Акции",       value: "sale" },
                ].map(({ label, value }) => (
                  <li key={value}>
                    <Link href={`/catalog?filter=${value}`}
                      className={`block px-3 py-2 text-sm transition-colors ${params.filter === value ? "text-[var(--amber)] bg-[var(--sky-glow)]" : "text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-card-2)]"}`}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* ── Main ── */}
          <div className="flex-1">
            {hasSubcategories && selectedCat ? (
              <div>
                <p className="text-sm text-[var(--text-dim)] mb-6">{selectedCat.children.length} подкатегорий</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {selectedCat.children.map((sub) => (
                    <Link key={sub.id} href={`/catalog?category=${sub.slug}`} className="group card-steel overflow-hidden flex flex-col">
                      <div className="relative overflow-hidden aspect-square">
                        {sub.image && (sub.image.startsWith("http") || sub.image.startsWith("/")) ? (
                          <Image src={sub.image} alt={sub.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-75" />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-5xl text-[var(--border-hi)]">{sub.image || "📁"}</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                      <div className="p-4">
                        <span className="text-sm font-bold text-white group-hover:text-[var(--amber)] transition-colors uppercase tracking-wide">
                          {sub.name}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {products.length === 0 ? (
                  <div className="text-center py-24 border border-[var(--border)]">
                    <p className="text-5xl mb-5 text-[var(--border-hi)]">◻</p>
                    <p className="text-lg text-[var(--text-muted)] mb-2">Товары не найдены</p>
                    <Link href="/catalog" className="mt-4 inline-block text-sm text-[var(--amber)] hover:underline">
                      Показать все товары
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {products.map((p) => <ProductCard key={p.id} {...p} />)}
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-12">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Link key={p} href={{ query: { ...params, page: p } }}
                        className={`w-10 h-10 flex items-center justify-center text-sm font-bold tracking-wide transition-colors ${
                          page === p
                            ? "bg-[var(--amber)] text-black"
                            : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--amber)] hover:text-[var(--amber)]"
                        }`}>
                        {p}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
