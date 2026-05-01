import { Bot, Context, InlineKeyboard, session } from "grammy";
import { prisma } from "./prisma";

export function createBot() {
  const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
  return bot;
}

export async function sendOrderNotification(order: {
  orderNumber: string;
  total: number;
  deliveryName: string;
  deliveryPhone: string;
  deliveryCity: string;
  deliveryStreet: string;
  items: Array<{ name: string; quantity: number; price: number }>;
}) {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminChatId || !process.env.TELEGRAM_BOT_TOKEN) return;

  const itemsList = order.items
    .map((i) => `• ${i.name} × ${i.quantity} = ${(i.price * i.quantity).toLocaleString("ru")} ₽`)
    .join("\n");

  const text =
    `🛒 *Новый заказ #${order.orderNumber}*\n\n` +
    `👤 ${order.deliveryName}\n` +
    `📞 ${order.deliveryPhone}\n` +
    `📍 ${order.deliveryCity}, ${order.deliveryStreet}\n\n` +
    `${itemsList}\n\n` +
    `💰 *Итого: ${order.total.toLocaleString("ru")} ₽*`;

  const keyboard = new InlineKeyboard().url(
    "Открыть в админке",
    `${process.env.NEXT_PUBLIC_APP_URL}/admin/orders`
  );

  await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: adminChatId,
        text,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      }),
    }
  );
}

export async function sendPaymentNotification(
  orderNumber: string,
  amount: number
) {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminChatId || !process.env.TELEGRAM_BOT_TOKEN) return;

  await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: adminChatId,
        text: `✅ *Оплачен заказ #${orderNumber}*\nСумма: ${amount.toLocaleString("ru")} ₽`,
        parse_mode: "Markdown",
      }),
    }
  );
}

export async function sendMessageToUser(chatId: string, text: string) {
  if (!process.env.TELEGRAM_BOT_TOKEN) return;
  await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
    }
  );
}
