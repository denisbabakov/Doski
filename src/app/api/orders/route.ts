import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPayment } from "@/lib/yukassa";
import { sendOrderNotification } from "@/lib/telegram";

function generateOrderNumber() {
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `KH-${dateStr}-${rand}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, email, city, street, apartment, zip, notes, items, total } = body;

  if (!name || !phone || !city || !street || !items?.length) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const orderNumber = generateOrderNumber();
  const subtotal = items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0);

  const order = await prisma.order.create({
    data: {
      orderNumber,
      deliveryName: name,
      deliveryPhone: phone,
      deliveryCity: city,
      deliveryStreet: street,
      deliveryApt: apartment || null,
      deliveryZip: zip || null,
      notes: notes || null,
      subtotal,
      total: total || subtotal,
      items: {
        create: items.map((i: { productId: string; name: string; image?: string; price: number; quantity: number }) => ({
          productId: i.productId,
          name: i.name,
          image: i.image || null,
          price: i.price,
          quantity: i.quantity,
          total: i.price * i.quantity,
        })),
      },
    },
    include: { items: true },
  });

  // Send Telegram notification
  await sendOrderNotification({
    orderNumber: order.orderNumber,
    total: order.total,
    deliveryName: order.deliveryName,
    deliveryPhone: order.deliveryPhone,
    deliveryCity: order.deliveryCity,
    deliveryStreet: order.deliveryStreet,
    items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
  }).catch(() => {});

  // Create YuKassa payment
  let paymentUrl: string | null = null;
  if (process.env.YUKASSA_SHOP_ID && process.env.YUKASSA_SECRET_KEY) {
    try {
      const payment = await createPayment({
        amount: order.total,
        orderId: order.id,
        orderNumber: order.orderNumber,
        returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/order-success?order=${order.orderNumber}`,
        description: `Заказ ${order.orderNumber} в KRZME HOME`,
        email: email || undefined,
      });
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentId: payment.id, paymentUrl: payment.confirmation.confirmation_url },
      });
      paymentUrl = payment.confirmation.confirmation_url;
    } catch (e) {
      console.error("YuKassa error:", e);
    }
  }

  return Response.json({ orderNumber: order.orderNumber, paymentUrl });
}
