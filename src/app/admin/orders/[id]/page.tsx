"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

const ORDER_STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
const statusLabels: Record<string, string> = {
  PENDING: "Ожидает", PAID: "Оплачен", PROCESSING: "Обрабатывается",
  SHIPPED: "Отправлен", DELIVERED: "Доставлен", CANCELLED: "Отменён", REFUNDED: "Возврат",
};

interface Order {
  id: string; orderNumber: string; status: string; paymentStatus: string;
  deliveryName: string; deliveryPhone: string; deliveryCity: string;
  deliveryStreet: string; deliveryApt?: string; deliveryZip?: string;
  subtotal: number; deliveryCost: number; discount: number; total: number;
  notes?: string; adminNotes?: string; trackingNumber?: string;
  paymentId?: string; paymentUrl?: string;
  createdAt: string;
  items: Array<{ id: string; name: string; price: number; quantity: number; total: number; image?: string }>;
  user?: { name?: string; email?: string; phone?: string; telegramId?: string };
}

export default function AdminOrderPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((o) => {
        setOrder(o);
        setStatus(o.status);
        setAdminNotes(o.adminNotes || "");
        setTrackingNumber(o.trackingNumber || "");
      });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNotes, trackingNumber }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrder(updated);
    }
    setSaving(false);
  };

  if (!order) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/orders" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-900">Заказ #{order.orderNumber}</h1>
        <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString("ru")}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items & Delivery */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Товары</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{item.name} × {item.quantity}</span>
                  <span className="font-medium">{item.total.toLocaleString("ru")} ₽</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 space-y-1 text-sm">
              <div className="flex justify-between text-gray-500"><span>Подитог</span><span>{order.subtotal.toLocaleString("ru")} ₽</span></div>
              <div className="flex justify-between text-gray-500"><span>Доставка</span><span>{order.deliveryCost > 0 ? `${order.deliveryCost.toLocaleString("ru")} ₽` : "Бесплатно"}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Скидка</span><span>−{order.discount.toLocaleString("ru")} ₽</span></div>}
              <div className="flex justify-between font-bold text-base text-gray-900 pt-1 border-t"><span>Итого</span><span>{order.total.toLocaleString("ru")} ₽</span></div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Доставка</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p><span className="text-gray-400">Получатель:</span> {order.deliveryName}</p>
              <p><span className="text-gray-400">Телефон:</span> {order.deliveryPhone}</p>
              <p><span className="text-gray-400">Адрес:</span> {order.deliveryCity}, {order.deliveryStreet}{order.deliveryApt ? `, кв. ${order.deliveryApt}` : ""}</p>
              {order.deliveryZip && <p><span className="text-gray-400">Индекс:</span> {order.deliveryZip}</p>}
              {order.notes && <p><span className="text-gray-400">Комментарий:</span> {order.notes}</p>}
            </div>
          </div>

          {order.user && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Клиент</h3>
              <div className="text-sm text-gray-700 space-y-1">
                {order.user.name && <p>{order.user.name}</p>}
                {order.user.email && <p>{order.user.email}</p>}
                {order.user.phone && <p>{order.user.phone}</p>}
                {order.user.telegramId && <p>Telegram ID: {order.user.telegramId}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Management */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Управление заказом</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Статус</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500">
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{statusLabels[s] || s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Трек-номер</label>
              <input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="RA123456789RU" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Заметки администратора</label>
              <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 resize-none" />
            </div>

            <button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors">
              <Save className="w-4 h-4" /> {saving ? "Сохраняем..." : "Сохранить"}
            </button>
          </div>

          {order.paymentId && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 text-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Платёж</h3>
              <p className="text-gray-500">ID: <span className="font-mono text-gray-700">{order.paymentId}</span></p>
              <p className="text-gray-500 mt-1">Статус: <span className="font-medium text-gray-700">{order.paymentStatus}</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
