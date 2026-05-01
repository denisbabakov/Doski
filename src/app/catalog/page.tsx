export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/store/ProductCard";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Каталог" };

interface Props {
  searchParams: Promise<{ category?: string; filter?: string; page?: string; q?: string }>;
}

export default async function CatalogPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 24;

  // Fetch selected category with its children
  const selectedCat = params.category
    ? await prisma.category.findUnique({
        where: { slug: params.category },
        include: { children: { where: { isVisible: true }, orderBy: { sortOrder: "asc" } } },
      })
    : null;

  const hasSubcategories = (selectedCat?.children?.length ?? 0) > 0;

  // Build product filter — skip if we'll show subcategory grid
  const where: Record<string, unknown> = { isVisible: true };
  if (!hasSubcategories) {
    if (selectedCat) where.categoryId = selectedCat.id;
    if (params.filter === "new") where.isNew = true;
    if (params.filter === "featured") where.isFeatured = true;
    if (params.filter === "sale") where.comparePrice = { gt: prisma.product.fields.price };
    if (params.q) where.name = { contains: params.q, mode: "insensitive" };
  }

  const [products, total, categories, settings] = await Promise.all([
    hasSubcategories
      ? Promise.resolve([])
      : prisma.product.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: "desc" },
        }),
    hasSubcategories ? Promise.resolve(0) : prisma.product.count({ where }),
    prisma.category.findMany({
      where: { isVisible: true, parentId: null },
      include: { children: { where: { isVisible: true }, orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.siteSettings.findUnique({ where: { id: "main" } }),
  ]);

  const totalPages = Math.ceil(total / pageSize);
  const sectionBgImage =
    params.filter === "sale"
      ? (settings?.bgImageSale || "/kitchen-bg.jpg")
      : params.filter === "new"
      ? (settings?.bgImageNew || "/kitchen-bg.jpg")
      : (settings?.bgImageCatalog || "/kitchen-bg.jpg");

  const pageTitle = params.q
    ? `Поиск: "${params.q}"`
    : params.filter === "sale"
    ? "Акции"
    : params.filter === "new"
    ? "Новинки"
    : selectedCat?.name || "Каталог";

  return (
    <div className="min-h-screen">
      <div className="relative h-40 sm:h-52 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${sectionBgImage}')` }} />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative h-full flex items-end max-w-7xl mx-auto px-4 sm:px-6 pb-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#3b82f6] mb-1">Магазин</p>
            <h1 className="text-3xl font-bold text-white">{pageTitle}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-56 shrink-0">
            <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-4 text-sm tracking-wide uppercase">Категории</h3>
              <ul className="space-y-1">
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/catalog?category=${c.slug}`}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${params.category === c.slug ? "bg-[#3b82f6]/10 text-[#3b82f6] font-medium" : "text-[#aaa] hover:text-white hover:bg-[#1a1a1a]"}`}
                    >
                      {c.name}
                    </Link>
                    {c.children?.length > 0 && (
                      <ul className="ml-3 mt-1 space-y-1 border-l border-[#2a2a2a] pl-3">
                        {c.children.map((sub) => (
                          <li key={sub.id}>
                            <Link
                              href={`/catalog?category=${sub.slug}`}
                              className={`block px-2 py-1.5 rounded-lg text-xs transition-colors ${params.category === sub.slug ? "text-[#3b82f6] font-medium" : "text-[#888] hover:text-white hover:bg-[#1a1a1a]"}`}
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
              <hr className="my-4 border-[#2a2a2a]" />
              <h3 className="font-semibold text-white mb-3 text-sm tracking-wide uppercase">Подборки</h3>
              <ul className="space-y-1">
                {[
                  { label: "Новинки", value: "new" },
                  { label: "Хиты продаж", value: "featured" },
                  { label: "Акции", value: "sale" },
                ].map(({ label, value }) => (
                  <li key={value}>
                    <Link
                      href={`/catalog?filter=${value}`}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${params.filter === value ? "bg-[#3b82f6]/10 text-[#3b82f6] font-medium" : "text-[#aaa] hover:text-white hover:bg-[#1a1a1a]"}`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1">
            {hasSubcategories && selectedCat ? (
              /* Subcategory grid */
              <div>
                <p className="text-sm text-[#666] mb-6">{selectedCat.children.length} подкатегорий</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {selectedCat.children.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/catalog?category=${sub.slug}`}
                      className="group flex flex-col"
                    >
                      <div className="relative overflow-hidden bg-[#111] border border-[#1f1f1f] group-hover:border-[#3b82f6]/50 transition-all rounded-2xl aspect-square">
                        {sub.image && (sub.image.startsWith("http") || sub.image.startsWith("/")) ? (
                          <Image src={sub.image} alt={sub.name} fill className="object-cover" />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full">
                            <span className="text-5xl">{sub.image || "📁"}</span>
                          </div>
                        )}
                      </div>
                      <span className="mt-2 text-white text-sm font-medium text-center leading-tight group-hover:text-[#3b82f6] transition-colors">
                        {sub.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              /* Products grid */
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm text-[#666]">{total} товаров</span>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-16 text-[#555]">
                    <p className="text-4xl mb-4">🔍</p>
                    <p className="text-lg text-[#888]">Товары не найдены</p>
                    <Link href="/catalog" className="mt-4 inline-block text-[#3b82f6] hover:underline">
                      Показать все
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                    {products.map((p) => (
                      <ProductCard key={p.id} {...p} />
                    ))}
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Link
                        key={p}
                        href={{ query: { ...params, page: p } }}
                        className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${page === p ? "bg-[#3b82f6] text-black" : "bg-[#1a1a1a] text-[#aaa] hover:bg-[#222] hover:text-white"}`}
                      >
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
