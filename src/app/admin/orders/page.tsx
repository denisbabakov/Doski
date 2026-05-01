export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700", PAID: "bg-green-100 text-green-700",
  PROCESSING: "bg-blue-100 text-blue-700", SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-emerald-100 text-emerald-700", CANCELLED: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  PENDING: "Ожидает", PAID: "Оплачен", PROCESSING: "Обрабатывается",
  SHIPPED: "Отправлен", DELIVERED: "Доставлен", CANCELLED: "Отменён", REFUNDED: "Возврат",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
    take: 100,
  });

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Заказы</h1>
        <span className="text-sm text-gray-500">{orders.length} заказов</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Номер</th>
                <th className="px-5 py-3 font-medium">Клиент</th>
                <th className="px-5 py-3 font-medium">Телефон</th>
                <th className="px-5 py-3 font-medium">Товаров</th>
                <th className="px-5 py-3 font-medium">Сумма</th>
                <th className="px-5 py-3 font-medium">Статус</th>
                <th className="px-5 py-3 font-medium">Дата</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-sm font-mono font-medium text-gray-900">#{o.orderNumber}</td>
                  <td className="px-5 py-3 text-sm text-gray-700">{o.deliveryName}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{o.deliveryPhone}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{o.items.length}</td>
                  <td className="px-5 py-3 text-sm font-semibold">{o.total.toLocaleString("ru")} ₽</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[o.status] || "bg-gray-100 text-gray-600"}`}>
                      {statusLabels[o.status] || o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString("ru")}</td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="text-xs text-amber-500 hover:underline">Открыть</Link>
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
