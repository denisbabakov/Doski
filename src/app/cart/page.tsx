"use client";

import { useCart } from "@/store/cart";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingCart, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, count } = useCart();

  if (count() === 0) return (
    <div className="bg-gray-50 text-gray-900 min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Корзина пуста</h1>
        <p className="text-gray-500 mb-8">Добавьте товары из каталога</p>
        <Link href="/catalog" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-full transition-colors">
          Перейти в каталог <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Корзина</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items */}
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 bg-white border border-gray-100 rounded-2xl p-4">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">🏠</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.slug}`} className="font-medium text-gray-900 hover:text-amber-600 transition-colors line-clamp-2">
                  {item.name}
                </Link>
                <p className="text-amber-600 font-bold mt-1">{item.price.toLocaleString("ru")} ₽</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900">−</button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900">+</button>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{(item.price * item.quantity).toLocaleString("ru")} ₽</span>
                </div>
              </div>
              <button onClick={() => removeItem(item.id)} className="shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Итого</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Товары ({count()} шт)</span>
                <span>{total().toLocaleString("ru")} ₽</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Доставка</span>
                <span className="text-emerald-600">Бесплатно</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-gray-900 text-base">
                <span>К оплате</span>
                <span>{total().toLocaleString("ru")} ₽</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="mt-6 block w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3.5 rounded-xl text-center transition-colors"
            >
              Оформить заказ
            </Link>
            <Link href="/catalog" className="mt-3 block text-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Продолжить покупки
            </Link>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
