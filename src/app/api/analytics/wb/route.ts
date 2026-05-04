import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchWbOrders } from "@/lib/wb";

export async function GET() {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  // Clicks from our DB grouped by day
  const clicksRaw = await prisma.wbClick.groupBy({
    by: ["createdAt"],
    _count: { id: true },
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "asc" },
  });

  // Aggregate clicks by day string
  const clicksByDay: Record<string, number> = {};
  for (const row of clicksRaw) {
    const day = row.createdAt.toISOString().slice(0, 10);
    clicksByDay[day] = (clicksByDay[day] ?? 0) + row._count.id;
  }

  // Top clicked products
  const topRaw = await prisma.wbClick.groupBy({
    by: ["productId"],
    _count: { id: true },
    where: { createdAt: { gte: since } },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });

  const productIds = topRaw.map((r) => r.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, wbArticle: true, images: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const topProducts = topRaw.map((r) => ({
    ...productMap.get(r.productId),
    clicks: r._count.id,
  }));

  // Total clicks
  const totalClicks = await prisma.wbClick.count({ where: { createdAt: { gte: since } } });

  // WB orders via Statistics API
  let wbOrders: { total: number; byDay: Record<string, number> } = { total: 0, byDay: {} };
  try {
    const orders = await fetchWbOrders(30);
    const active = orders.filter((o) => !o.isCancel && o.orderType === 1);
    const byDay: Record<string, number> = {};
    for (const o of active) {
      const day = o.date?.slice(0, 10);
      if (day) byDay[day] = (byDay[day] ?? 0) + 1;
    }
    wbOrders = { total: active.length, byDay };
  } catch {
    // Stats API might fail — non-critical
  }

  return NextResponse.json({
    totalClicks,
    wbOrders,
    clicksByDay,
    topProducts,
  });
}
