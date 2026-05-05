"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

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
  isWb?: boolean;
  wbArticle?: number | null;
}

export default function ProductCard({
  slug, name, price, comparePrice, images, isNew, stock, isWb, wbArticle,
}: ProductCardProps) {
  const discount = comparePrice
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  const handleWbClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (wbArticle) window.open(`/api/wb/go/${wbArticle}`, "_blank");
  };

  return (
    <Link href={isWb ? "#" : `/product/${slug}`} onClick={isWb ? handleWbClick : undefined} className="group block">
      <div className="relative overflow-hidden bg-[#111] border border-[var(--border)] group-hover:border-[var(--amber)]/40 transition-colors aspect-square">
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
          {isWb && (
            <span className="bg-[#cb11ab] text-white text-[9px] font-bold px-2 py-0.5 tracking-wider uppercase">
              WB
            </span>
          )}
          {isNew && (
            <span className="bg-[var(--amber)] text-black text-[9px] font-bold px-2 py-0.5 tracking-wider uppercase">
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

        {/* CTA button — только для WB товаров */}
        {isWb && (
          <div className="absolute bottom-0 left-0 right-0 bg-[#cb11ab]/90 backdrop-blur-sm text-white text-xs font-semibold py-3 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 tracking-wide uppercase">
            <ShoppingCart className="w-3.5 h-3.5" />
            Купить на WB
          </div>
        )}
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
