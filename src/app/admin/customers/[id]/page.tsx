"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, X, Plus } from "lucide-react";

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Ожидает", PAID: "Оплачен", PROCESSING: "Обрабатывается",
  SHIPPED: "Отправлен", DELIVERED: "Доставлен", CANCELLED: "Отменён", REFUNDED: "Возврат",
};
const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700", PAID: "bg-green-100 text-green-700",
  PROCESSING: "bg-blue-100 text-blue-700", SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-emerald-100 text-emerald-700", CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-600",
};

interface Customer {
  id: string; name?: string; email: string; phone?: string;
  telegramId?: string; telegramUsername?: string;
  crmNotes?: string; crmTags: string[];
  lifetimeValue: number; orderCount: number; lastOrderAt?: string;
  createdAt: string;
  orders: Array<{
    id: string; orderNumber: string; status: string; total: number; createdAt: string;
    items: Array<{ name: string; quantity: number }>;
  }>;
  addresses: Array<{ id: string; name: string; city: string; street: string; apartment?: string }>;
}

export default function AdminCustomerPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/customers/${id}`).then((r) => r.json()).then((c) => {
      setCustomer(c);
      setNotes(c.crmNotes || "");
      setTags(c.crmTags || []);
    });
  }, [id]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/admin/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crmNotes: notes, crmTags: tags }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!customer) return (
    <div className="p-8 flex justify-center">
      <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/customers" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{customer.name || customer.email}</h1>
          {customer.name && <p className="text-sm text-gray-400">{customer.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: stats + orders */}
        <div className="lg:col-span-2 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Заказов", value: customer.orderCount },
              { label: "Выручка", value: customer.lifetimeValue > 0 ? `${customer.lifetimeValue.toLocaleString("ru")} ?` : "0 ?" },
              { label: "Регистрация", value: new Date(customer.createdAt).toLocaleDateString("ru") },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4">
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Orders */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">История заказов</h3>
            </div>
            {customer.orders.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">Заказов нет</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {customer.orders.map((o) => (
                  <div key={o.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-mono font-medium text-gray-900">#{o.orderNumber}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {o.items.map((i) => `${i.name} ?${i.quantity}`).join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ORDER_STATUS_COLORS[o.status] || "bg-gray-100 text-gray-600"}`}>
                        {ORDER_STATUS_LABELS[o.status] || o.status}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{o.total.toLocaleString("ru")} ?</p>
                        <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString("ru")}</p>
                      </div>
                      <Link href={`/admin/orders/${o.id}`} className="text-xs text-amber-500 hover:underline">
                        Открыть
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Addresses */}
          {customer.addresses.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Адреса</h3>
              <div className="space-y-2">
                {customer.addresses.map((a) => (
                  <div key={a.id} className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-2.5">
                    {a.city}, {a.street}{a.apartment ? `, кв. ${a.apartment}` : ""}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: CRM */}
        <div className="space-y-4">
          {/* Contact info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Контакты</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Email</span>
                <span className="text-gray-700">{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Телефон</span>
                  <span className="text-gray-700">{customer.phone}</span>
                </div>
              )}
              {(customer.telegramUsername || customer.telegramId) && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Telegram</span>
                  <span className="text-gray-700">
                    {customer.telegramUsername ? `@${customer.telegramUsername}` : `ID: ${customer.telegramId}`}
                  </span>
                </div>
              )}
              {customer.lastOrderAt && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Последний заказ</span>
                  <span className="text-gray-700">{new Date(customer.lastOrderAt).toLocaleDateString("ru")}</span>
                </div>
              )}
            </div>
          </div>

          {/* CRM Tags */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Теги CRM</h3>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-amber-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {tags.length === 0 && <span className="text-xs text-gray-400">Нет тегов</span>}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
                placeholder="Добавить тег..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500"
              />
              <button onClick={addTag} className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* CRM Notes */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Заметки</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Заметки о клиенте..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
            >
              <Save className="w-4 h-4" /> {saved ? "Сохранено!" : saving ? "Сохраняем..." : "Сохранить"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
