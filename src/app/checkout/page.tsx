"use client";

import { useCart } from "@/store/cart";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, total, count, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", city: "", street: "", apartment: "", zip: "", notes: "",
  });

  if (count() === 0) {
    router.replace("/cart");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items: items.map((i) => ({ productId: i.id, quantity: i.quantity, price: i.price, name: i.name, image: i.image })), total: total() }),
      });
      const data = await res.json();
      if (data.paymentUrl) {
        clearCart();
        window.location.href = data.paymentUrl;
      } else if (data.orderNumber) {
        clearCart();
        router.push(`/order-success?order=${data.orderNumber}`);
      }
    } catch {
      alert("Ошибка при оформлении заказа");
    } finally {
      setLoading(false);
    }
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Оформление заказа</h1>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
        {/* Form */}
        <div className="flex-1 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 mb-5">Контактные данные</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Имя", key: "name", required: true, placeholder: "Иван Иванов" },
                { label: "Телефон", key: "phone", required: true, placeholder: "+7 (900) 000-00-00" },
                { label: "Email", key: "email", required: false, placeholder: "ivan@mail.ru", type: "email" },
              ].map(({ label, key, required, placeholder, type }) => (
                <div key={key} className={key === "email" ? "sm:col-span-2" : ""}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label} {required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={type || "text"}
                    value={form[key as keyof typeof form]}
                    onChange={set(key)}
                    required={required}
                    placeholder={placeholder}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 mb-5">Адрес доставки</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Город", key: "city", required: true, placeholder: "Москва", span: 2 },
                { label: "Улица, дом", key: "street", required: true, placeholder: "ул. Ленина, 10", span: 2 },
                { label: "Квартира", key: "apartment", required: false, placeholder: "42" },
                { label: "Индекс", key: "zip", required: false, placeholder: "123456" },
              ].map(({ label, key, required, placeholder, span }) => (
                <div key={key} className={span === 2 ? "sm:col-span-2" : ""}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label} {required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={form[key as keyof typeof form]}
                    onChange={set(key)}
                    required={required}
                    placeholder={placeholder}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Комментарий к заказу</label>
              <textarea
                value={form.notes}
                onChange={set("notes")}
                placeholder="Дополнительные пожелания..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">Ваш заказ</h2>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((i) => (
                <div key={i.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 line-clamp-1 flex-1 mr-2">{i.name} × {i.quantity}</span>
                  <span className="font-medium shrink-0">{(i.price * i.quantity).toLocaleString("ru")} ₽</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Доставка</span>
                <span className="text-emerald-600">Бесплатно</span>
              </div>
              <div className="flex justify-between font-bold text-base text-gray-900">
                <span>Итого</span>
                <span>{total().toLocaleString("ru")} ₽</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              {loading ? "Оформляем..." : "Оплатить заказ"}
            </button>
            <p className="mt-3 text-xs text-gray-400 text-center">
              Нажимая кнопку, вы соглашаетесь с{" "}
              <Link href="#" className="underline">условиями оферты</Link>
            </p>
          </div>
        </div>
      </form>
    </div>
    </div>
  );
}
