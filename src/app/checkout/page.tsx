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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({ productId: i.id, quantity: i.quantity, price: i.price, name: i.name, image: i.image })),
          total: total(),
        }),
      });
      const data = await res.json();
      if (data.paymentUrl) { clearCart(); window.location.href = data.paymentUrl; }
      else if (data.orderNumber) { clearCart(); router.push(`/order-success?order=${data.orderNumber}`); }
    } catch {
      alert("Ошибка при оформлении заказа");
    } finally {
      setLoading(false);
    }
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="min-h-screen">
      <div className="page-header">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <span className="section-label">Покупка</span>
          <h1 className="text-4xl font-black font-[family-name:var(--font-exo)] text-white mt-1">Оформление заказа</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">

          {/* Form */}
          <div className="flex-1 space-y-5">
            {/* Contact */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6">
              <h2 className="text-xs font-bold tracking-widest uppercase text-[var(--text-dim)] mb-5">Контактные данные</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Имя",     key: "name",  req: true,  ph: "Иван Иванов" },
                  { label: "Телефон", key: "phone", req: true,  ph: "+7 (900) 000-00-00" },
                  { label: "Email",   key: "email", req: false, ph: "ivan@mail.ru", type: "email", span: true },
                ].map(({ label, key, req, ph, type, span }) => (
                  <div key={key} className={span ? "sm:col-span-2" : ""}>
                    <label className="block text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-2">
                      {label} {req && <span className="text-[var(--amber)]">*</span>}
                    </label>
                    <input
                      type={type || "text"}
                      value={form[key as keyof typeof form]}
                      onChange={set(key)}
                      required={req}
                      placeholder={ph}
                      className="input-dark"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6">
              <h2 className="text-xs font-bold tracking-widest uppercase text-[var(--text-dim)] mb-5">Адрес доставки</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Город",      key: "city",      req: true,  ph: "Москва",            span: true },
                  { label: "Улица, дом", key: "street",    req: true,  ph: "ул. Ленина, 10",    span: true },
                  { label: "Квартира",   key: "apartment", req: false, ph: "42" },
                  { label: "Индекс",     key: "zip",       req: false, ph: "123456" },
                ].map(({ label, key, req, ph, span }) => (
                  <div key={key} className={span ? "sm:col-span-2" : ""}>
                    <label className="block text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-2">
                      {label} {req && <span className="text-[var(--amber)]">*</span>}
                    </label>
                    <input
                      type="text"
                      value={form[key as keyof typeof form]}
                      onChange={set(key)}
                      required={req}
                      placeholder={ph}
                      className="input-dark"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <label className="block text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-2">
                  Комментарий
                </label>
                <textarea
                  value={form.notes}
                  onChange={set("notes")}
                  placeholder="Дополнительные пожелания..."
                  rows={3}
                  className="input-dark resize-none"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 sticky top-20">
              <h2 className="text-xs font-bold tracking-widest uppercase text-[var(--text-dim)] mb-5">Ваш заказ</h2>
              <div className="space-y-2 mb-5 max-h-60 overflow-y-auto pr-1">
                {items.map((i) => (
                  <div key={i.id} className="flex justify-between text-sm gap-2">
                    <span className="text-[var(--text-muted)] line-clamp-1 flex-1">{i.name} × {i.quantity}</span>
                    <span className="font-medium text-white shrink-0">{(i.price * i.quantity).toLocaleString("ru")} ₽</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[var(--border)] pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Доставка</span>
                  <span className="text-emerald-400">Бесплатно</span>
                </div>
                <div className="flex justify-between font-bold text-base">
                  <span className="text-white">Итого</span>
                  <span className="text-[var(--amber)]">{total().toLocaleString("ru")} ₽</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary mt-6 w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full spin" /> Оформляем...</>
                  : "Оплатить заказ"
                }
              </button>
              <p className="mt-3 text-[10px] text-[var(--text-dim)] text-center">
                Нажимая кнопку, вы соглашаетесь с{" "}
                <Link href="#" className="text-[var(--amber)] hover:underline">условиями оферты</Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
