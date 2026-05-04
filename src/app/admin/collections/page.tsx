"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  images: string[];
  price: number;
  isNew: boolean;
  isFeatured: boolean;
  category: { name: string } | null;
}

export default function AdminCollectionsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((data) => { setProducts(data); setLoading(false); });
  }, []);

  const toggle = async (p: Product, field: "isNew" | "isFeatured") => {
    setUpdating(p.id + field);
    const res = await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !p[field] }),
    });
    if (res.ok) {
      setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, [field]: !p[field] } : x));
    }
    setUpdating(null);
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>;

  const newCount = products.filter((p) => p.isNew).length;
  const featuredCount = products.filter((p) => p.isFeatured).length;

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Подборки</h1>
        <p className="text-sm text-gray-500 mt-1">Управление товарами в секциях «Новинки» и «Хиты продаж»</p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-3">
          <p className="text-xs text-gray-400">Новинки</p>
          <p className="text-2xl font-bold text-gray-900">{newCount}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-3">
          <p className="text-xs text-gray-400">Хиты продаж</p>
          <p className="text-2xl font-bold text-gray-900">{featuredCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="px-4 py-3 font-medium">Товар</th>
                <th className="px-4 py-3 font-medium">Категория</th>
                <th className="px-4 py-3 font-medium">Цена</th>
                <th className="px-4 py-3 font-medium text-center">Новинка</th>
                <th className="px-4 py-3 font-medium text-center">Хит продаж</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {p.images[0] ? (
                          <Image src={p.images[0]} alt="" width={40} height={40} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">🏠</div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.category?.name || "—"}</td>
                  <td className="px-4 py-3 text-sm font-medium">{p.price.toLocaleString("ru")} ₽</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggle(p, "isNew")}
                      disabled={updating === p.id + "isNew"}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${p.isNew ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
                    >
                      {p.isNew ? "✓ Новинка" : "—"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggle(p, "isFeatured")}
                      disabled={updating === p.id + "isFeatured"}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${p.isFeatured ? "bg-sky-100 text-sky-700 hover:bg-sky-200" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
                    >
                      {p.isFeatured ? "✓ Хит" : "—"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
