"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";

interface Settings {
  heroTitle: string; heroSubtitle: string; heroImage: string;
  bgImageNew: string; bgImageSale: string; bgImageCatalog: string;
  aboutText: string; phone: string; email: string; address: string;
  socialVk: string; socialTg: string; socialInst: string;
  deliveryInfo: string; returnInfo: string; metaTitle: string; metaDesc: string;
}

const emptySettings: Settings = {
  heroTitle: "KRZME HOME", heroSubtitle: "Товары для вашего дома", heroImage: "",
  bgImageNew: "", bgImageSale: "", bgImageCatalog: "",
  aboutText: "", phone: "", email: "", address: "",
  socialVk: "", socialTg: "", socialInst: "",
  deliveryInfo: "", returnInfo: "", metaTitle: "", metaDesc: "",
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<Settings>(emptySettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((d) => {
      if (d) {
        const { id: _id, updatedAt: _updatedAt, ...rest } = d;
        const sanitized = Object.fromEntries(
          Object.entries(rest).map(([k, v]) => [k, v ?? ""])
        ) as Partial<Settings>;
        setForm({ ...emptySettings, ...sanitized });
      }
    });
  }, []);

  const set = (key: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      alert("Ошибка сохранения: " + res.status);
    }
  };

  const sections = [
    {
      title: "Главная страница",
      fields: [
        { label: "Заголовок Hero", key: "heroTitle" as keyof Settings },
        { label: "Подзаголовок Hero", key: "heroSubtitle" as keyof Settings },
        { label: "Фоновое изображение Hero (URL)", key: "heroImage" as keyof Settings },
        { label: "Фон секции «Новинки» (URL)", key: "bgImageNew" as keyof Settings },
        { label: "Фон секции «Акции» в каталоге (URL)", key: "bgImageSale" as keyof Settings },
        { label: "Фон шапки каталога (URL)", key: "bgImageCatalog" as keyof Settings },
      ],
    },
    {
      title: "Контакты",
      fields: [
        { label: "Телефон", key: "phone" as keyof Settings },
        { label: "Email", key: "email" as keyof Settings },
        { label: "Адрес", key: "address" as keyof Settings },
      ],
    },
    {
      title: "Социальные сети",
      fields: [
        { label: "ВКонтакте (URL)", key: "socialVk" as keyof Settings },
        { label: "Telegram (URL)", key: "socialTg" as keyof Settings },
        { label: "Instagram (URL)", key: "socialInst" as keyof Settings },
      ],
    },
    {
      title: "SEO",
      fields: [
        { label: "Meta Title", key: "metaTitle" as keyof Settings },
        { label: "Meta Description", key: "metaDesc" as keyof Settings },
      ],
    },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Настройки сайта</h1>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-medium px-5 py-2 rounded-xl transition-colors text-sm">
          <Save className="w-4 h-4" /> {saved ? "Сохранено!" : saving ? "Сохраняем..." : "Сохранить"}
        </button>
      </div>

      <div className="space-y-6">
        {sections.map(({ title, fields }) => (
          <div key={title} className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
            <div className="space-y-4">
              {fields.map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type="text" value={form[key]} onChange={set(key)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Long text fields */}
        {[
          { title: "О компании", key: "aboutText" as keyof Settings },
          { title: "Информация о доставке", key: "deliveryInfo" as keyof Settings },
          { title: "Информация о возврате", key: "returnInfo" as keyof Settings },
        ].map(({ title, key }) => (
          <div key={key} className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
            <textarea value={form[key]} onChange={set(key)} rows={5}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 resize-none" />
          </div>
        ))}
      </div>
    </div>
  );
}
