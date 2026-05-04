"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Category { id: string; name: string }

const emptyProduct = {
  name: "", slug: "", description: "", shortDesc: "", price: 0, comparePrice: "",
  sku: "", stock: 0, images: [""], categoryId: "", tags: "",
  isVisible: true, isFeatured: false, isNew: false,
  metaTitle: "", metaDesc: "",
};

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const router = useRouter();
  const [form, setForm] = useState(emptyProduct);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories").then((r) => r.json()).then(setCategories).catch(() => {});
    if (!isNew) {
      fetch(`/api/admin/products/${id}`)
        .then((r) => r.json())
        .then((p) => {
          setForm({ ...p, comparePrice: p.comparePrice || "", tags: (p.tags || []).join(", "), images: p.images?.length ? p.images : [""] });
          setLoading(false);
        });
    }
  }, [id, isNew]);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
      stock: Number(form.stock),
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      images: form.images.filter(Boolean),
    };
    const url = isNew ? "/api/admin/products" : `/api/admin/products/${id}`;
    const method = isNew ? "POST" : "PATCH";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) router.push("/admin/products");
    else alert("Ошибка сохранения");
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Удалить товар?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    router.push("/admin/products");
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-zа-яё0-9]+/gi, "-").replace(/^-|-$/g, "");

  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-900">{isNew ? "Новый товар" : "Редактировать товар"}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Main info */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Основная информация</h3>
            {[
              { label: "Название *", key: "name", onBlur: () => !form.slug && setForm(f => ({ ...f, slug: slugify(f.name) })) },
              { label: "Slug (URL)", key: "slug" },
              { label: "Артикул (SKU)", key: "sku" },
            ].map(({ label, key, onBlur }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input type="text" value={(form as unknown as Record<string, string>)[key]} onChange={set(key)} onBlur={onBlur}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Краткое описание</label>
              <textarea value={form.shortDesc} onChange={set("shortDesc")} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Полное описание</label>
              <textarea value={form.description} onChange={set("description")} rows={5} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none" />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Цена и наличие</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Цена *", key: "price", type: "number" },
                { label: "Цена до скидки", key: "comparePrice", type: "number" },
                { label: "На складе", key: "stock", type: "number" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type={type} value={(form as unknown as Record<string, string | number>)[key]} onChange={set(key)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold text-gray-900">Изображения (URL)</h3>
            {form.images.map((img, i) => (
              <div key={i} className="flex gap-2">
                <input type="text" value={img} onChange={(e) => {
                  const imgs = [...form.images]; imgs[i] = e.target.value; setForm(f => ({ ...f, images: imgs }));
                }} placeholder="https://..." className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
                <button onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))} className="px-3 text-gray-400 hover:text-red-500">?</button>
              </div>
            ))}
            <button onClick={() => setForm(f => ({ ...f, images: [...f.images, ""] }))} className="text-sm text-amber-500 hover:underline">+ Добавить изображение</button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Параметры</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
              <select value={form.categoryId} onChange={set("categoryId")} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500">
                <option value="">— Без категории —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Теги (через запятую)</label>
              <input type="text" value={form.tags} onChange={set("tags")} placeholder="декор, текстиль" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
            </div>
            {[
              { label: "Видимый", key: "isVisible" },
              { label: "Рекомендуемый", key: "isFeatured" },
              { label: "Новинка", key: "isNew" },
            ].map(({ label, key }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={(form as unknown as Record<string, boolean>)[key]} onChange={set(key)}
                  className="w-4 h-4 accent-amber-500" />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <button onClick={handleSave} disabled={saving} className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors">
              <Save className="w-4 h-4" /> {saving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>

          {!isNew && (
            <div className="bg-white border border-red-100 rounded-2xl p-5">
              <h3 className="font-semibold text-red-600 mb-1 text-sm">Опасная зона</h3>
              <p className="text-xs text-gray-500 mb-3">Это действие нельзя отменить</p>
              <button onClick={handleDelete} className="flex items-center justify-center gap-2 w-full border border-red-300 text-red-500 hover:bg-red-50 font-medium py-2.5 rounded-xl transition-colors text-sm">
                <Trash2 className="w-4 h-4" /> Удалить товар
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
