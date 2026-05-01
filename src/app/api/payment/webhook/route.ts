import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPaymentNotification } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { event, object } = body;

  if (event === "payment.succeeded") {
    const { id: paymentId, metadata } = object;
    const orderId = metadata?.orderId;
    if (!orderId) return Response.json({ ok: true });

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "SUCCEEDED",
        status: "PAID",
        paymentId,
      },
    });

    await sendPaymentNotification(order.orderNumber, order.total).catch(() => {});
  }

  if (event === "payment.canceled") {
    const { metadata } = object;
    if (metadata?.orderId) {
      await prisma.order.update({
        where: { id: metadata.orderId },
        data: { paymentStatus: "FAILED", status: "CANCELLED" },
      });
    }
  }

  return Response.json({ ok: true });
}
