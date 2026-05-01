import { prisma } from "@/lib/prisma";
import { sendMessageToUser } from "@/lib/telegram";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { name: true, email: true, phone: true, telegramId: true } } },
  });
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(order);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status, adminNotes, trackingNumber } = await req.json();

  const order = await prisma.order.update({
    where: { id },
    data: { status, adminNotes, trackingNumber },
    include: { user: true },
  });

  // Notify customer via Telegram when order is shipped
  if (status === "SHIPPED" && order.user?.telegramId && trackingNumber) {
    await sendMessageToUser(
      order.user.telegramId,
      `📦 *Ваш заказ #${order.orderNumber} отправлен!*\n\nТрек-номер: \`${trackingNumber}\``
    ).catch(() => {});
  }

  return Response.json(order);
}
