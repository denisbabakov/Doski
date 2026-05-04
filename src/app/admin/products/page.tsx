export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil } from "lucide-react";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: { select: { name: true } } },
  });

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Товары</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-medium px-4 py-2 rounded-xl transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Добавить
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="px-4 py-3 font-medium">Товар</th>
                <th className="px-4 py-3 font-medium">Категория</th>
                <th className="px-4 py-3 font-medium">Цена</th>
                <th className="px-4 py-3 font-medium">Склад</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium"></th>
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
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{p.name}</p>
                        {p.sku && <p className="text-xs text-gray-400">Арт: {p.sku}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.category?.name || "—"}</td>
                  <td className="px-4 py-3 text-sm font-medium">{p.price.toLocaleString("ru")} ₽</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={p.stock > 0 ? "text-emerald-600" : "text-red-500"}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.isVisible ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.isVisible ? "Виден" : "Скрыт"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="p-1.5 text-gray-500 hover:text-sky-500 transition-colors inline-flex">
                      <Pencil className="w-4 h-4" />
                    </Link>
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
