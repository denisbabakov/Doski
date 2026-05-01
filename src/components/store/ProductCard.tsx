"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/store/cart";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  comparePrice?: number | null;
  images: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  stock: number;
}

export default function ProductCard({
  id, slug, name, price, comparePrice, images, isNew, stock,
}: ProductCardProps) {
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const discount = comparePrice
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ id, name, price, image: images[0], slug });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link href={`/product/${slug}`} className="group block">
      <div className="relative overflow-hidden bg-[#111] border border-[#1f1f1f] group-hover:border-[#3b82f6]/30 transition-colors aspect-square">
        {images[0] ? (
          <Image
            src={images[0]}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#333] text-4xl">◻</div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isNew && (
            <span className="bg-[#3b82f6] text-black text-[9px] font-bold px-2 py-0.5 tracking-wider uppercase">
              New
            </span>
          )}
          {discount > 0 && (
            <span className="bg-white text-black text-[9px] font-bold px-2 py-0.5 tracking-wider uppercase">
              -{discount}%
            </span>
          )}
          {stock === 0 && (
            <span className="bg-[#1a1a1a] text-[#555] text-[9px] font-bold px-2 py-0.5 tracking-wider uppercase">
              Нет
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); }}
          className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
        >
          <Heart className="w-3.5 h-3.5 text-[#888]" />
        </button>

        {/* Add to cart */}
        <button
          onClick={handleAdd}
          disabled={stock === 0}
          className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm text-white text-xs font-semibold py-3 opacity-0 group-hover:opacity-100 transition-all hover:bg-[#3b82f6] hover:text-black disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 tracking-wide uppercase"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          {added ? "Добавлено" : "В корзину"}
        </button>
      </div>

      <div className="mt-3 px-0.5">
        <h3 className="text-sm font-medium text-[#ccc] group-hover:text-white transition-colors line-clamp-2">
          {name}
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-bold text-white text-sm">
            {price.toLocaleString("ru")} ₽
          </span>
          {comparePrice && comparePrice > price && (
            <span className="text-xs text-[#777] line-through">
              {comparePrice.toLocaleString("ru")} ₽
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
