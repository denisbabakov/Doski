export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { ShoppingBag, Users, Package, TrendingUp } from "lucide-react";

async function getStats() {
  const [orders, users, products, revenue] = await Promise.all([
    prisma.order.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.product.count({ where: { isVisible: true } }),
    prisma.order.aggregate({ where: { paymentStatus: "SUCCEEDED" }, _sum: { total: true } }),
  ]);
  const recentOrders = await prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  return { orders, users, products, revenue: revenue._sum.total || 0, recentOrders };
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PAID: "bg-green-100 text-green-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  PENDING: "Ожидает", PAID: "Оплачен", PROCESSING: "Обрабатывается",
  SHIPPED: "Отправлен", DELIVERED: "Доставлен", CANCELLED: "Отменён",
};

export default async function AdminDashboard() {
  const { orders, users, products, revenue, recentOrders } = await getStats();

  const cards = [
    { label: "Заказов", value: orders, icon: ShoppingBag, color: "bg-blue-500" },
    { label: "Клиентов", value: users, icon: Users, color: "bg-purple-500" },
    { label: "Товаров", value: products, icon: Package, color: "bg-sky-500" },
    { label: "Выручка", value: `${revenue.toLocaleString("ru")} ₽`, icon: TrendingUp, color: "bg-emerald-500" },
  ];

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Дашборд</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Последние заказы</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="px-6 py-3 font-medium">Номер</th>
                <th className="px-6 py-3 font-medium">Клиент</th>
                <th className="px-6 py-3 font-medium">Сумма</th>
                <th className="px-6 py-3 font-medium">Статус</th>
                <th className="px-6 py-3 font-medium">Дата</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 text-sm font-mono text-gray-900">#{o.orderNumber}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{o.deliveryName}</td>
                  <td className="px-6 py-3 text-sm font-medium">{o.total.toLocaleString("ru")} ₽</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[o.status] || "bg-gray-100 text-gray-600"}`}>
                      {statusLabels[o.status] || o.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {new Date(o.createdAt).toLocaleDateString("ru")}
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
