export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Клиенты (CRM)</h1>
        <span className="text-sm text-gray-500">{customers.length} клиентов</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Клиент</th>
                <th className="px-5 py-3 font-medium">Телефон</th>
                <th className="px-5 py-3 font-medium">Telegram</th>
                <th className="px-5 py-3 font-medium">Заказов</th>
                <th className="px-5 py-3 font-medium">Выручка</th>
                <th className="px-5 py-3 font-medium">Теги</th>
                <th className="px-5 py-3 font-medium">Регистрация</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.name || "—"}</p>
                      <p className="text-xs text-gray-400">{c.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{c.phone || "—"}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {c.telegramUsername ? `@${c.telegramUsername}` : c.telegramId ? `ID: ${c.telegramId}` : "—"}
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-gray-900">{c._count.orders}</td>
                  <td className="px-5 py-3 text-sm font-medium">{c.lifetimeValue > 0 ? `${c.lifetimeValue.toLocaleString("ru")} ₽` : "—"}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {c.crmTags.map((tag) => (
                        <span key={tag} className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{new Date(c.createdAt).toLocaleDateString("ru")}</td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/customers/${c.id}`} className="text-xs text-sky-500 hover:underline">Открыть</Link>
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
