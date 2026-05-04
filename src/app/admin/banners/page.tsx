"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Save, GripVertical } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  sortOrder: number;
  isActive: boolean;
}

const empty = (): Omit<Banner, "id"> => ({
  title: "", subtitle: "", image: "", link: "", sortOrder: 0, isActive: true,
});

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(empty());
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/banners").then((r) => r.json()).then(setBanners);
  }, []);

  const startEdit = (b: Banner) => {
    setEditing(b.id);
    setCreating(false);
    setForm({ title: b.title, subtitle: b.subtitle || "", image: b.image, link: b.link || "", sortOrder: b.sortOrder, isActive: b.isActive });
  };

  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm(empty());
  };

  const cancel = () => { setEditing(null); setCreating(false); };

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    if (creating) {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const created = await res.json();
      setBanners((prev) => [...prev, created]);
      setCreating(false);
    } else if (editing) {
      const res = await fetch(`/api/admin/banners/${editing}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const updated = await res.json();
      setBanners((prev) => prev.map((b) => (b.id === editing ? updated : b)));
      setEditing(null);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить баннер?")) return;
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    setBanners((prev) => prev.filter((b) => b.id !== id));
    if (editing === id) setEditing(null);
  };

  const toggleActive = async (b: Banner) => {
    const res = await fetch(`/api/admin/banners/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...b, isActive: !b.isActive }),
    });
    const updated = await res.json();
    setBanners((prev) => prev.map((x) => (x.id === b.id ? updated : x)));
  };

  const isOpen = editing !== null || creating;

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Баннеры</h1>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-medium px-4 py-2 rounded-xl transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Добавить
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="space-y-3">
          {banners.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
              Нет баннеров. Добавьте первый.
            </div>
          )}
          {banners.map((b) => (
            <div
              key={b.id}
              onClick={() => startEdit(b)}
              className={`bg-white rounded-2xl border transition-all cursor-pointer ${editing === b.id ? "border-sky-400 ring-1 ring-sky-300" : "border-gray-100 hover:border-gray-200"}`}
            >
              <div className="flex items-center gap-3 p-4">
                <GripVertical className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="w-16 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                  {b.image ? (
                    <Image src={b.image} alt="" width={64} height={40} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">нет</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{b.title || "Без названия"}</p>
                  {b.subtitle && <p className="text-xs text-gray-400 truncate">{b.subtitle}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleActive(b); }}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${b.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                  >
                    {b.isActive ? "Активен" : "Скрыт"}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(b.id); }}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Editor */}
        {isOpen && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">
              {creating ? "Новый баннер" : "Редактировать баннер"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок *</label>
                <input type="text" value={form.title} onChange={set("title")} placeholder="Новая коллекция"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Подзаголовок</label>
                <input type="text" value={form.subtitle} onChange={set("subtitle")} placeholder="Скидки до 50%"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL изображения *</label>
                <input type="text" value={form.image} onChange={set("image")} placeholder="https://..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
                {form.image && (
                  <div className="mt-2 rounded-xl overflow-hidden h-28 bg-gray-100">
                    <Image src={form.image} alt="" width={400} height={112} className="object-cover w-full h-full" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ссылка (URL)</label>
                <input type="text" value={form.link} onChange={set("link")} placeholder="/catalog"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Порядок сортировки</label>
                <input type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded accent-sky-500" />
                <span className="text-sm text-gray-700">Активен (показывать на сайте)</span>
              </label>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} disabled={saving || !form.title || !form.image}
                className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm">
                <Save className="w-4 h-4" /> {saving ? "Сохраняем..." : "Сохранить"}
              </button>
              <button onClick={cancel} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
