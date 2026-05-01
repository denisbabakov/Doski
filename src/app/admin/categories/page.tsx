"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Save, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  sortOrder: number;
  isVisible: boolean;
  parentId: string | null;
}

const emptyForm = (): Omit<Category, "id"> => ({
  name: "", slug: "", description: "", image: "", sortOrder: 0, isVisible: true, parentId: null,
});

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-а-яё]/gi, "")
    .replace(/--+/g, "-");
}

function CategoryRow({ c, editing, startEdit, toggleVisible, handleDelete, isChild = false }: {
  c: Category; editing: string | null;
  startEdit: (c: Category) => void;
  toggleVisible: (c: Category) => void;
  handleDelete: (id: string) => void;
  isChild?: boolean;
}) {
  return (
    <div
      onClick={() => startEdit(c)}
      className={`bg-white rounded-2xl border transition-all cursor-pointer ${editing === c.id ? "border-amber-400 ring-1 ring-amber-300" : "border-gray-100 hover:border-gray-200"}`}
    >
      <div className="flex items-center gap-3 p-4">
        <div className={`rounded-xl bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center ${isChild ? "w-10 h-10" : "w-14 h-14"}`}>
          {c.image && (c.image.startsWith("http") || c.image.startsWith("/")) ? (
            <Image src={c.image} alt={c.name} width={56} height={56} className="object-cover w-full h-full" />
          ) : (
            <span className={isChild ? "text-lg" : "text-2xl"}>{c.image || "📁"}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-gray-900 ${isChild ? "text-xs" : "text-sm"}`}>
            {isChild && <span className="text-gray-300 mr-1">└</span>}{c.name}
          </p>
          <p className="text-xs text-gray-400 font-mono">/{c.slug}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={(e) => { e.stopPropagation(); toggleVisible(c); }}
            className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${c.isVisible ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
            {c.isVisible ? "Видима" : "Скрыта"}
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories").then((r) => r.json()).then(setCategories);
  }, []);

  const startEdit = (c: Category) => {
    setEditing(c.id);
    setCreating(false);
    setForm({
      name: c.name, slug: c.slug, description: c.description || "",
      image: c.image || "", sortOrder: c.sortOrder, isVisible: c.isVisible, parentId: c.parentId ?? null,
    });
  };

  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm(emptyForm());
  };

  const cancel = () => { setEditing(null); setCreating(false); };

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setForm((f) => ({
        ...f,
        [key]: value,
        ...(key === "name" && !editing ? { slug: toSlug(value) } : {}),
      }));
    };

  const handleSave = async () => {
    if (!form.name || !form.slug) return;
    setSaving(true);
    if (creating) {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const created = await res.json();
      setCategories((prev) => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder));
      setCreating(false);
    } else if (editing) {
      const res = await fetch(`/api/admin/categories/${editing}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const updated = await res.json();
      setCategories((prev) => prev.map((c) => (c.id === editing ? updated : c)));
      setEditing(null);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить категорию? Товары в ней не удаляются.")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (editing === id) setEditing(null);
  };

  const toggleVisible = async (c: Category) => {
    const res = await fetch(`/api/admin/categories/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...c, isVisible: !c.isVisible }),
    });
    const updated = await res.json();
    setCategories((prev) => prev.map((x) => (x.id === c.id ? updated : x)));
  };

  const isOpen = editing !== null || creating;

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Категории</h1>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium px-4 py-2 rounded-xl transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Добавить
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="space-y-2">
          {categories.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
              Категорий нет. Добавьте первую.
            </div>
          )}
          {categories.filter((c) => !c.parentId).map((parent) => (
            <div key={parent.id}>
              {/* Parent category */}
              <CategoryRow c={parent} editing={editing} startEdit={startEdit} toggleVisible={toggleVisible} handleDelete={handleDelete} />
              {/* Subcategories */}
              {categories.filter((c) => c.parentId === parent.id).map((child) => (
                <div key={child.id} className="ml-6 mt-1">
                  <CategoryRow c={child} editing={editing} startEdit={startEdit} toggleVisible={toggleVisible} handleDelete={handleDelete} isChild />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Editor */}
        {isOpen && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">
              {creating ? "Новая категория" : "Редактировать категорию"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
                <input type="text" value={form.name} onChange={set("name")} placeholder="Банные чаны"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL) *</label>
                <input type="text" value={form.slug} onChange={set("slug")} placeholder="bannye-chany"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
                <p className="text-xs text-gray-400 mt-1">Латиница, без пробелов. Генерируется автоматически.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Изображение (URL или эмодзи)
                </label>
                <input type="text" value={form.image} onChange={set("image")}
                  placeholder="https://i.imgur.com/abc123.jpg или 🛁"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 ${form.image.startsWith("blob:") ? "border-red-400 focus:border-red-400 focus:ring-red-300" : "border-gray-200 focus:border-amber-500 focus:ring-amber-500"}`} />

                {/* blob: warning */}
                {form.image.startsWith("blob:") && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 leading-relaxed">
                    ⚠️ Это временная ссылка браузера — она не сохранится.<br />
                    Загрузите фото на <strong>imgur.com</strong>, затем кликните на него правой кнопкой → <strong>"Копировать адрес изображения"</strong>.<br />
                    Нужна ссылка вида: <code className="bg-red-100 px-1 rounded">https://i.imgur.com/XXXXX.jpg</code>
                  </div>
                )}

                {/* Preview */}
                {form.image && !form.image.startsWith("blob:") && (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">
                      {form.image.startsWith("http") || form.image.startsWith("/") ? (
                        <Image src={form.image} alt="" width={64} height={64} className="object-cover w-full h-full" />
                      ) : (
                        <span className="text-3xl">{form.image}</span>
                      )}
                    </div>
                    <button onClick={() => setForm((f) => ({ ...f, image: "" }))} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1">
                      <X className="w-3 h-3" /> Убрать
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Родительская категория</label>
                <select
                  value={form.parentId ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value || null }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                >
                  <option value="">— Корневая категория —</option>
                  {categories.filter((c) => !c.parentId && c.id !== editing).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                <textarea value={form.description} onChange={set("description")} rows={2}
                  placeholder="Краткое описание категории..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Порядок сортировки</label>
                <input type="number" value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isVisible}
                  onChange={(e) => setForm((f) => ({ ...f, isVisible: e.target.checked }))}
                  className="w-4 h-4 rounded accent-amber-500" />
                <span className="text-sm text-gray-700">Показывать на сайте</span>
              </label>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} disabled={saving || !form.name || !form.slug || form.image.startsWith("blob:")}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm">
                <Save className="w-4 h-4" /> {saving ? "Сохраняем..." : "Сохранить"}
              </button>
              <button onClick={cancel}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
