"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { ShoppingCart, Heart, Star, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/store/cart";

interface Product {
  id: string; name: string; slug: string; price: number; comparePrice?: number;
  images: string[]; description?: string; shortDesc?: string; stock: number;
  isNew: boolean; isFeatured: boolean; sku?: string;
  category?: { name: string; slug: string };
  reviews: Array<{ rating: number; comment?: string; user: { name?: string }; createdAt: string }>;
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((d) => { setProduct(d); setLoading(false); });
  }, [slug]);

  if (loading) return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="bg-gray-50 text-gray-900 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl text-gray-500">Товар не найден</p>
        <Link href="/catalog" className="mt-4 inline-block text-amber-500 hover:underline">← В каталог</Link>
      </div>
    </div>
  );

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const avgRating = product.reviews.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : 0;

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      addItem({ id: product.id, name: product.name, price: product.price, image: product.images[0], slug: product.slug });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/catalog" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ChevronLeft className="w-4 h-4" /> Назад в каталог
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50">
            {product.images[selectedImage] ? (
              <Image src={product.images[selectedImage]} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">🏠</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3 mt-4">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${selectedImage === i ? "border-amber-500" : "border-transparent"}`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {product.category && (
            <Link href={`/catalog?category=${product.category.slug}`} className="text-sm text-amber-600 hover:underline mb-2">
              {product.category.name}
            </Link>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>

          {product.reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-4 h-4 ${s <= avgRating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                ))}
              </div>
              <span className="text-sm text-gray-500">({product.reviews.length} отзывов)</span>
            </div>
          )}

          <div className="flex items-end gap-3 mt-6">
            <span className="text-3xl font-bold text-gray-900">{product.price.toLocaleString("ru")} ₽</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <>
                <span className="text-xl text-gray-400 line-through">{product.comparePrice.toLocaleString("ru")} ₽</span>
                <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
              </>
            )}
          </div>

          {product.shortDesc && (
            <p className="text-gray-600 mt-4 leading-relaxed">{product.shortDesc}</p>
          )}

          <div className="mt-4 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 text-sm font-medium ${product.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>
              <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? "bg-emerald-500" : "bg-red-500"}`} />
              {product.stock > 0 ? `В наличии (${product.stock} шт)` : "Нет в наличии"}
            </span>
            {product.sku && <span className="text-sm text-gray-400">Арт: {product.sku}</span>}
          </div>

          {/* Qty + add */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center border border-gray-200 rounded-xl">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 text-lg">−</button>
                <span className="w-10 text-center font-medium">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 text-lg">+</button>
              </div>
              <button
                onClick={handleAdd}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {added ? "Добавлено в корзину!" : "В корзину"}
              </button>
              <button className="w-12 h-12 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors">
                <Heart className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="mt-8 border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Описание</h3>
              <div className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{product.description}</div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <section className="mt-12 border-t pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Отзывы ({product.reviews.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {product.reviews.map((r, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{r.user.name || "Покупатель"}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleDateString("ru")}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
    </div>
  );
}
