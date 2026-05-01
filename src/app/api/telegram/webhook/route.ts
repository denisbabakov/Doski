import { NextRequest } from "next/server";
import { Bot, webhookCallback } from "grammy";
import { prisma } from "@/lib/prisma";

let bot: Bot | null = null;

function getBot() {
  if (!bot && process.env.TELEGRAM_BOT_TOKEN) {
    bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

    bot.command("start", async (ctx) => {
      const telegramId = String(ctx.from?.id);
      const username = ctx.from?.username;

      await prisma.user.upsert({
        where: { telegramId },
        update: { telegramUsername: username },
        create: {
          telegramId,
          telegramUsername: username,
          email: `tg_${telegramId}@krzme.local`,
          name: ctx.from?.first_name,
        },
      }).catch(() => {});

      await ctx.reply(
        `👋 Добро пожаловать в *KRZME HOME*!\n\n` +
        `🏠 Магазин товаров для дома\n\n` +
        `Доступные команды:\n` +
        `/orders — мои заказы\n` +
        `/catalog — перейти в каталог\n` +
        `/help — помощь`,
        { parse_mode: "Markdown" }
      );
    });

    bot.command("orders", async (ctx) => {
      const telegramId = String(ctx.from?.id);
      const user = await prisma.user.findUnique({
        where: { telegramId },
        include: {
          orders: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      });

      if (!user || user.orders.length === 0) {
        return ctx.reply("У вас пока нет заказов. Посетите наш магазин!");
      }

      const statusLabels: Record<string, string> = {
        PENDING: "⏳ Ожидает оплаты",
        PAID: "✅ Оплачен",
        PROCESSING: "🔄 В обработке",
        SHIPPED: "🚚 В доставке",
        DELIVERED: "📦 Доставлен",
        CANCELLED: "❌ Отменён",
        REFUNDED: "↩️ Возврат",
      };

      const text = user.orders
        .map((o) => `*#${o.orderNumber}*\n${statusLabels[o.status] || o.status} — ${o.total.toLocaleString("ru")} ₽`)
        .join("\n\n");

      await ctx.reply(`📋 *Ваши последние заказы:*\n\n${text}`, { parse_mode: "Markdown" });
    });

    bot.command("catalog", async (ctx) => {
      await ctx.reply(
        `🛍 Посетите наш каталог:\n${process.env.NEXT_PUBLIC_APP_URL}/catalog`
      );
    });

    bot.command("help", async (ctx) => {
      await ctx.reply(
        `ℹ️ *Помощь KRZME HOME*\n\n` +
        `/start — начало работы\n` +
        `/orders — мои заказы\n` +
        `/catalog — каталог товаров\n\n` +
        `По всем вопросам пишите нам, и мы ответим в ближайшее время!`,
        { parse_mode: "Markdown" }
      );
    });

    // Handle messages — save to DB + echo support
    bot.on("message:text", async (ctx) => {
      const telegramId = String(ctx.from?.id);
      await prisma.telegramMessage.create({
        data: {
          chatId: telegramId,
          message: ctx.message.text,
          direction: "in",
        },
      }).catch(() => {});

      // Check if it's a command we don't handle
      if (!ctx.message.text.startsWith("/")) {
        await ctx.reply(
          "Спасибо за сообщение! Наш менеджер скоро ответит вам.\n\n" +
          "Используйте /help для просмотра доступных команд."
        );
      }
    });
  }
  return bot;
}

export async function POST(req: NextRequest) {
  const botInstance = getBot();
  if (!botInstance) return Response.json({ ok: false, error: "Bot not configured" });

  const handler = webhookCallback(botInstance, "std/http");
  return handler(req);
}
