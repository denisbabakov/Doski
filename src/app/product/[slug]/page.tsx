"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Phone, MessageCircle, Star, ChevronLeft } from "lucide-react";
import Link from "next/link";

const CONTACT_CATEGORIES = ["bannye-chany", "akva-blast"];

interface Product {
  id: string; name: string; slug: string; price: number; comparePrice?: number;
  images: string[]; description?: string; shortDesc?: string; stock: number;
  isNew: boolean; isFeatured: boolean; sku?: string;
  contactPhone?: string; contactTelegram?: string;
  category?: { name: string; slug: string };
  reviews: Array<{ rating: number; comment?: string; user: { name?: string }; createdAt: string }>;
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((d) => { setProduct(d); setLoading(false); });
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--amber)] border-t-transparent rounded-full spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl text-[var(--text-muted)]">Товар не найден</p>
        <Link href="/catalog" className="mt-4 inline-block text-[var(--amber)] hover:underline text-sm">← В каталог</Link>
      </div>
    </div>
  );

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;
  const avgRating = product.reviews.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : 0;

  const isContactCategory = product.category && CONTACT_CATEGORIES.includes(product.category.slug);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Breadcrumb */}
        <Link href="/catalog" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-dim)] hover:text-[var(--amber)] transition-colors mb-8 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Назад в каталог
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ── Gallery ── */}
          <div>
            <div className="img-frame relative aspect-square">
              {product.images[selectedImage] ? (
                <Image src={product.images[selectedImage]} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl text-[var(--border-hi)]">◻</div>
              )}
              {product.isNew && (
                <div className="absolute top-4 left-4 bg-[var(--amber)] text-black text-[9px] font-black px-2.5 py-1 tracking-widest uppercase">
                  New
                </div>
              )}
              {discount > 0 && (
                <div className="absolute top-4 left-4 mt-7 bg-white text-black text-[9px] font-black px-2.5 py-1 tracking-widest uppercase">
                  -{discount}%
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-20 overflow-hidden border-2 transition-colors ${selectedImage === i ? "border-[var(--amber)]" : "border-[var(--border)] hover:border-[var(--border-hi)]"}`}>
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="flex flex-col">
            {product.category && (
              <Link href={`/catalog?category=${product.category.slug}`}
                className="text-xs font-bold tracking-widest uppercase text-[var(--amber)] hover:text-[var(--amber-hi)] transition-colors mb-3">
                {product.category.name}
              </Link>
            )}

            <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-exo)] text-white leading-tight">
              {product.name}
            </h1>

            {product.reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= avgRating ? "fill-[var(--amber)] text-[var(--amber)]" : "text-[var(--border-hi)]"}`} />
                  ))}
                </div>
                <span className="text-xs text-[var(--text-dim)]">({product.reviews.length} отзывов)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-4 mt-8 pb-6 border-b border-[var(--border)]">
              <span className="text-4xl font-black font-[family-name:var(--font-exo)] text-[var(--amber)]">
                {product.price.toLocaleString("ru")} ₽
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-xl text-[var(--text-dim)] line-through mb-1">
                  {product.comparePrice.toLocaleString("ru")} ₽
                </span>
              )}
            </div>

            {product.shortDesc && (
              <p className="text-[var(--text-muted)] mt-5 leading-relaxed text-sm">{product.shortDesc}</p>
            )}

            {/* Stock */}
            <div className="mt-4 flex items-center gap-2">
              <span className={`relative w-2 h-2 rounded-full ${product.stock > 0 ? "bg-emerald-500" : "bg-red-500"}`}>
                {product.stock > 0 && <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-50" />}
              </span>
              <span className={`text-sm font-medium ${product.stock > 0 ? "text-emerald-400" : "text-red-400"}`}>
                {product.stock > 0 ? `В наличии — ${product.stock} шт.` : "Нет в наличии"}
              </span>
              {product.sku && <span className="text-xs text-[var(--text-dim)] ml-2">Арт: {product.sku}</span>}
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-3 mt-8">
              {isContactCategory ? (
                <>
                  {product.contactPhone && (
                    <a href={`tel:${product.contactPhone}`} className="btn-primary w-full justify-center">
                      <Phone className="w-4 h-4" />
                      Позвонить — {product.contactPhone}
                    </a>
                  )}
                  {product.contactTelegram && (
                    <a href={`https://t.me/${product.contactTelegram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                      className="btn-secondary w-full justify-center">
                      <MessageCircle className="w-4 h-4" />
                      Написать в Telegram
                    </a>
                  )}
                </>
              ) : null}
            </div>

            {product.description && (
              <div className="mt-8 pt-6 border-t border-[var(--border)]">
                <h3 className="text-xs font-bold tracking-widest uppercase text-[var(--text-dim)] mb-4">Описание</h3>
                <div className="text-[var(--text-muted)] leading-relaxed text-sm whitespace-pre-line">
                  {product.description}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        {product.reviews.length > 0 && (
          <section className="mt-16 pt-10 border-t border-[var(--border)]">
            <span className="section-label">Покупатели</span>
            <h2 className="text-2xl font-bold font-[family-name:var(--font-exo)] text-white mb-8">
              Отзывы — {product.reviews.length}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {product.reviews.map((r, i) => (
                <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-white text-sm">{r.user.name || "Покупатель"}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "fill-[var(--amber)] text-[var(--amber)]" : "text-[var(--border-hi)]"}`} />
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-sm text-[var(--text-muted)] leading-relaxed">{r.comment}</p>}
                  <p className="text-xs text-[var(--text-dim)] mt-3">{new Date(r.createdAt).toLocaleDateString("ru")}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
