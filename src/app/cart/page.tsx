"use client";

import { useCart } from "@/store/cart";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingCart, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, count } = useCart();

  if (count() === 0) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-sm px-4">
        <div className="w-20 h-20 border border-[var(--border)] flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="w-8 h-8 text-[var(--text-dim)]" />
        </div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-exo)] text-white mb-3">Корзина пуста</h1>
        <p className="text-[var(--text-muted)] text-sm mb-8">Добавьте товары из каталога</p>
        <Link href="/catalog" className="btn-primary inline-flex">
          Перейти в каталог <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="page-header">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <span className="section-label">Покупки</span>
          <h1 className="text-4xl font-black font-[family-name:var(--font-exo)] text-white mt-1">Корзина</h1>
          <p className="text-sm text-[var(--text-dim)] mt-2">{count()} товаров</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Items */}
          <div className="flex-1 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-[var(--bg-card)] border border-[var(--border)] p-4 hover:border-[var(--border-hi)] transition-colors">
                <div className="relative w-24 h-24 shrink-0 overflow-hidden bg-[var(--bg-card-2)]">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl text-[var(--border-hi)]">◻</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.slug}`}
                    className="font-semibold text-white hover:text-[var(--amber)] transition-colors line-clamp-2 text-sm leading-snug">
                    {item.name}
                  </Link>
                  <p className="text-[var(--amber)] font-bold mt-1 text-sm">{item.price.toLocaleString("ru")} ₽</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-[var(--border)] bg-[var(--bg-card-2)]">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-white transition-colors text-lg">−</button>
                      <span className="w-8 text-center text-sm font-bold text-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-white transition-colors text-lg">+</button>
                    </div>
                    <span className="text-sm font-bold text-white">{(item.price * item.quantity).toLocaleString("ru")} ₽</span>
                  </div>
                </div>
                <button onClick={() => removeItem(item.id)}
                  className="shrink-0 p-2 text-[var(--text-dim)] hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 sticky top-20">
              <h2 className="text-xs font-bold tracking-widest uppercase text-[var(--text-dim)] mb-5">Ваш заказ</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Товары ({count()} шт)</span>
                  <span>{total().toLocaleString("ru")} ₽</span>
                </div>
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Доставка</span>
                  <span className="text-emerald-400">Бесплатно</span>
                </div>
                <div className="border-t border-[var(--border)] pt-3 flex justify-between font-bold text-white text-base">
                  <span>К оплате</span>
                  <span className="text-[var(--amber)]">{total().toLocaleString("ru")} ₽</span>
                </div>
              </div>
              <Link href="/checkout" className="btn-primary mt-6 block text-center w-full">
                Оформить заказ
              </Link>
              <Link href="/catalog"
                className="mt-3 block text-center text-xs text-[var(--text-dim)] hover:text-[var(--amber)] transition-colors tracking-wide uppercase">
                Продолжить покупки
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
